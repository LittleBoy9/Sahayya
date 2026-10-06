import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Plus, Send } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { Avatar, BackButton, Pill } from '@/components/ui';
import { Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useChat } from '@/store';
import { shadows } from '@/theme/shadows';
import { DURATION, EASE, LOOP, TIMING } from '@/theme/motion';
import { getQuickReplies, getSession } from '@/mocks/api';
import type { Coordinator, Message } from '@/mocks/types';

/**
 * Case chat — the asynchronous continuation of the helpline call.
 *
 * The coordinator sends the traveller the things they will need at the clinic,
 * including a structured appointment payload that is a real message type rather
 * than a text bubble with markup in it. Layout and copy follow README.md §5.
 */

/**
 * Prototype scaffolding. The coordinator's reply is faked client-side so the
 * send flow is demonstrable; replace the whole send path with real messaging
 * (Supabase Realtime or a websocket) — README.md §5.
 */
const CANNED_REPLY =
  'Noted — I have added that to your case file and told the clinic ahead of your visit.';

/** "09:44" from the device clock — a real thread stamps server time. */
function clockTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// ─── Typing indicator ────────────────────────────────────────────────────────

/**
 * One dot of the typing indicator: translateY 0 → -4 → 0 with opacity .4 → 1 → .4.
 *
 * Like the pulsing status dots this carries meaning rather than decoration, so
 * reduce-motion slows it by LOOP.reducedMotionFactor instead of removing it.
 */
function TypingDot({ delay }: { delay: number }) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const cycle = LOOP.typingDot * (reduced ? LOOP.reducedMotionFactor : 1);

    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: cycle / 2, easing: EASE }),
          withTiming(0, { duration: cycle / 2, easing: EASE }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, progress, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [{ translateY: progress.value * -4 }],
  }));

  return <Animated.View style={style} className="h-[6px] w-[6px] rounded-full bg-blue" />;
}

function TypingIndicator() {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Rhea is typing"
      className="w-[52px] flex-row items-center justify-center gap-1 rounded-panel-lg border border-line bg-surface py-[14px]"
    >
      {LOOP.typingDotStagger.map((delay) => (
        <TypingDot key={delay} delay={delay} />
      ))}
    </View>
  );
}

// ─── Structured message renderer ─────────────────────────────────────────────

/**
 * Switches on `message.kind`.
 *
 * README.md is explicit that the backend sends typed payloads — `text`,
 * `appointment`, and later `document` / `cost_estimate` — so new kinds land as
 * new branches here rather than as markup smuggled inside a text body.
 */
function MessageRow({ message }: { message: Message }) {
  const router = useRouter();
  const outbound = message.author === 'traveller';

  return (
    <Rise duration={DURATION.riseFast} className={outbound ? 'items-end' : 'items-start'}>
      <View style={{ maxWidth: '78%' }}>
        {message.kind === 'appointment' ? (
          // Appointment held — a card, not a bubble. Taps through to Booking.
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Appointment held: ${message.summary}. Confirm booking.`}
            onPress={() => router.push(`/provider/${message.providerId}/book`)}
            className="rounded-panel border border-blue-border bg-surface p-[14px] active:border-blue"
            style={shadows.blueTintCard}
          >
            <Txt variant="overlineSm" className="text-blue">
              Appointment held
            </Txt>
            <Txt variant="cardTitleSm" className="mt-[7px]">
              {message.summary}
            </Txt>
            <Txt variant="meta" className="mt-[9px] font-geist-600 text-blue">
              Confirm booking →
            </Txt>
          </Pressable>
        ) : (
          <View
            className={`rounded-panel-lg border px-[14px] py-3 ${
              outbound ? 'border-blue bg-blue' : 'border-line bg-surface'
            }`}
          >
            {/* README.md §5: 14px body at 1.55 line-height. */}
            <Txt
              variant="body"
              className={`leading-[21.7px] ${outbound ? 'text-on-night' : 'text-ink'}`}
            >
              {message.text}
            </Txt>
          </View>
        )}

        <Txt
          variant="metaXs"
          className={`mt-1 text-muted-4 ${outbound ? 'text-right' : 'text-left'}`}
        >
          {message.time}
        </Txt>
      </View>
    </Rise>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();

  // Conversation state survives navigation, so it lives in the store.
  const messages = useChat((s) => s.messages);
  const draft = useChat((s) => s.draft);
  const typing = useChat((s) => s.typing);
  const setDraft = useChat((s) => s.setDraft);
  const setTyping = useChat((s) => s.setTyping);
  const append = useChat((s) => s.append);

  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  // Composer focus is a paint detail of this screen only.
  const [focused, setFocused] = useState(false);

  const listRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Monotonic suffix so two sends in the same millisecond keep distinct keys. */
  const seq = useRef(0);

  useEffect(() => {
    getSession().then((s) => {
      setCoordinator(s.coordinator);
      setCaseNumber(s.caseNumber);
    });
    getQuickReplies().then((r) => setQuickReplies([...r]));
  }, []);

  // A pending canned reply must not fire into an unmounted screen.
  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    seq.current += 1;
    append({
      id: `out-${Date.now()}-${seq.current}`,
      kind: 'text',
      author: 'traveller',
      text,
      time: clockTime(),
    });
    setDraft('');
    setTyping(true);

    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      seq.current += 1;
      append({
        id: `in-${Date.now()}-${seq.current}`,
        kind: 'text',
        author: 'coordinator',
        text: CANNED_REPLY,
        time: clockTime(),
      });
    }, TIMING.chatTyping);
  }, [append, draft, setDraft, setTyping]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sticky translucent header */}
      <View className="flex-row items-center gap-[11px] border-b border-line-2 bg-bg/[0.86] px-4 pb-3 pt-[58px]">
        <BackButton />
        <Avatar initials={coordinator?.initials ?? 'RK'} size={36} fontSize={13} />
        <View className="flex-1">
          <Txt variant="bodyMl" className="font-geist-600">
            {coordinator?.name ?? ''}
          </Txt>
          {/* Presence and case number only once the session has actually loaded —
              an "Online · case #" stub would be a claim we cannot back. */}
          {coordinator && caseNumber ? (
            <Txt variant="metaLg" className="text-green">
              {coordinator.online ? 'Online' : 'Offline'} · case #{caseNumber}
            </Txt>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${coordinator?.name ?? 'your coordinator'}`}
          hitSlop={8}
          onPress={() => router.push('/call')}
          className="rounded-chip border border-line bg-surface px-3 py-2 active:bg-blue-tint"
        >
          <Txt variant="meta" className="font-geist-600 text-blue">
            Call
          </Txt>
        </Pressable>
      </View>

      {/* Message list — pinned to the newest message */}
      <ScrollView
        ref={listRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 8,
          gap: 10,
        }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      >
        <Txt variant="metaSm" className="mb-1 text-center text-muted-3">
          Today · encrypted, kept in your case file
        </Txt>

        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}

        {typing ? <TypingIndicator /> : null}
      </ScrollView>

      {/* Quick replies — these fill the composer rather than sending, so the
          traveller can edit before committing to the wording. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // flexGrow 0 stops the row claiming the column's spare height, and
        // alignItems centre stops the pills stretching to the cross axis.
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          gap: 7,
          alignItems: 'center',
        }}
      >
        {quickReplies.map((reply) => (
          <Pill
            key={reply}
            label={reply}
            onPress={() => {
              setDraft(reply);
              inputRef.current?.focus();
            }}
          />
        ))}
      </ScrollView>

      {/* Composer */}
      <View className="flex-row items-center gap-[9px] border-t border-line-2 bg-surface px-4 pb-3 pt-[10px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach a photo or document"
          hitSlop={4}
          className="h-10 w-10 items-center justify-center rounded-card border border-line bg-surface active:bg-line-soft"
        >
          <Plus size={18} color="#7A8496" />
        </Pressable>

        <TextInput
          ref={inputRef}
          accessibilityLabel={`Message ${coordinator?.name ?? 'your coordinator'}`}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="send"
          submitBehavior="submit"
          placeholder={coordinator ? `Message ${coordinator.name.split(' ')[0]}…` : 'Message…'}
          className={`h-10 flex-1 rounded-card border px-[13px] font-geist text-body text-ink placeholder:text-muted-3 ${
            focused ? 'border-blue' : 'border-line'
          }`}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !draft.trim() }}
          hitSlop={4}
          onPress={send}
          className="h-10 w-10 items-center justify-center rounded-card bg-blue active:bg-blue-press"
        >
          <Send size={16} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

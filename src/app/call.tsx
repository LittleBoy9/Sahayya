import { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MessageSquare, MicOff, PhoneOff } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { PrototypeNotice } from '@/components/PrototypeNotice';
import { Gradient, Glow } from '@/components/Gradient';
import { Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { shadows } from '@/theme/shadows';
import { DURATION, EASE, LOOP, TIMING } from '@/theme/motion';
import { getCallTranscript } from '@/mocks/api';

/**
 * Helpline call — the moment the product justifies itself.
 *
 * Mounts in `dialing` and flips itself to `live` after TIMING.callConnect: the
 * screen is a simulation of a telephony session, so every transition here is a
 * timer rather than a user action. README.md §4.
 *
 * Production note from README.md §4: replace the simulated transition with real
 * call state from the telephony SDK and the transcript with live ASR or the
 * coordinator's typed notes. If neither exists at launch, drop the transcript
 * rather than faking it — but keep the rings and the two states, which are the
 * reassurance this screen exists to deliver.
 */

/** The prototype caps the staged transcript at four lines. */
const MAX_TRANSCRIPT_LINES = 4;

/** Avatar box and the ring travel: scale(.7) → scale(2.1) across a 200px square. */
const AVATAR_BOX = 200;
const RING_FROM = 0.7;
const RING_TO = 2.1;
const RING_OPACITY = 0.55;

/** The clinic the coordinator is booking while she talks. */
const HELD_PROVIDER = 'ashoka';

/** Raised text on the dark call surfaces — transcript body, chip labels, glyphs. */
const ON_NIGHT_6 = 'text-on-night-6';
const ON_NIGHT_6_HEX = '#DCE6F5';

type TranscriptLine = Awaited<ReturnType<typeof getCallTranscript>>[number];

/** MM:SS, counting up from connection. */
function formatElapsed(totalSeconds: number): string {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ─── Ring ────────────────────────────────────────────────────────────────────

/**
 * One expanding ring. Three of these stack on the avatar, staggered by
 * LOOP.ringStagger, so a new pulse leaves the centre roughly every 850ms.
 *
 * README.md keeps this animation under reduce-motion — an outbound call with a
 * frozen avatar reads as a hung app — and only slows it by
 * LOOP.reducedMotionFactor.
 */
function Ring({ delay }: { delay: number }) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const factor = reduced ? LOOP.reducedMotionFactor : 1;

    progress.value = 0;
    progress.value = withDelay(
      delay * factor,
      withRepeat(withTiming(1, { duration: LOOP.ring * factor, easing: EASE }), -1, false),
    );
  }, [delay, progress, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: RING_OPACITY * (1 - progress.value),
    transform: [{ scale: RING_FROM + progress.value * (RING_TO - RING_FROM) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 rounded-full border-[1.5px] border-blue/50"
      style={style}
    />
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CallScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [phase, setPhase] = useState<'dialing' | 'live'>('dialing');
  const [seconds, setSeconds] = useState(0);
  /** How many transcript lines have been revealed. Screen-local, never restored. */
  const [revealed, setRevealed] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [muted, setMuted] = useState(false);

  const live = phase === 'live';

  useEffect(() => {
    getCallTranscript().then(setTranscript);
  }, []);

  // Dialing → live. One timer, cleared if the traveller hangs up before it fires.
  useEffect(() => {
    const connect = setTimeout(() => setPhase('live'), TIMING.callConnect);
    return () => clearTimeout(connect);
  }, []);

  // Once live, two intervals run for the life of the call: the elapsed clock and
  // the transcript feed. Both are torn down on unmount.
  useEffect(() => {
    if (!live) return;

    setRevealed(1);

    const tick = setInterval(() => setSeconds((s) => s + 1), TIMING.callTick);
    const step = setInterval(
      () => setRevealed((n) => Math.min(n + 1, MAX_TRANSCRIPT_LINES)),
      TIMING.callTranscriptStep,
    );

    return () => {
      clearInterval(tick);
      clearInterval(step);
    };
  }, [live]);

  /**
   * Hang up. The call is a full-screen modal on top of whatever the traveller
   * was doing, so unwind the whole stack rather than stepping back through
   * triage — the call ending should land them on Home.
   */
  const endCall = () => {
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  /**
   * README.md §4: "radial-gradient(circle at 50% 32%, rgba(11,95,255,.28),
   * transparent 62%)". RN has no radial gradient, so <Glow> paints an SVG square
   * sized to the CSS `farthest-corner` radius and centred on 50% / 32%.
   */
  const glowSize = 2 * Math.hypot(width / 2, height * 0.68);

  const lines = transcript.slice(0, Math.min(revealed, MAX_TRANSCRIPT_LINES));

  const actions = [
    { id: 'booking', label: 'Booking held', go: () => router.push(`/provider/${HELD_PROVIDER}/book`) },
    { id: 'clinic', label: 'View clinic', go: () => router.push(`/provider/${HELD_PROVIDER}`) },
    { id: 'cost', label: 'Cost estimate', go: () => router.push('/cost') },
  ];

  return (
    <View
      className="flex-1 overflow-hidden bg-night px-screen-dark"
      style={{ paddingTop: 70, paddingBottom: 40 }}
    >
      {/* Blue wash behind everything */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          left: width / 2 - glowSize / 2,
          top: height * 0.32 - glowSize / 2,
        }}
      >
        <Glow size={glowSize} color="rgba(11,95,255,.28)" stop={0.62} />
      </View>

      {/* Who you are talking to, and what the call is doing right now */}
      <View className="items-center">
        <Txt
          variant="overline"
          className="text-center tracking-overline-wider text-on-night-5"
          // The clock is the only thing that changes on this line every second;
          // announcing the whole overline each tick would be unusable.
          accessibilityLiveRegion="none"
        >
          {live ? `Connected · ${formatElapsed(seconds)}` : 'Sahaya helpline · Delhi NCR'}
        </Txt>
        <Txt variant="cardHero" className="mt-[10px] text-center text-on-night">
          Rhea Kapoor
        </Txt>
        <Txt variant="body" className="mt-[6px] text-center text-on-night-3">
          {live ? 'Case coordinator · speaking English' : 'Connecting you to a coordinator…'}
        </Txt>
      </View>

      {/* Avatar + rings. The rings overflow the 200px box by design and are
          clipped by the screen, exactly as the CSS version is. */}
      <View className="flex-1 items-center justify-center">
        <View
          className="items-center justify-center"
          style={{ width: AVATAR_BOX, height: AVATAR_BOX }}
        >
          {LOOP.ringStagger.map((delay) => (
            <Ring key={delay} delay={delay} />
          ))}
          <View className="rounded-full" style={shadows.callAvatar}>
            <Gradient
              angle={150}
              colors={['#1B6BFF', '#0A3FB0']}
              style={{
                width: 124,
                height: 124,
                borderRadius: 62,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt variant="avatarXl" className="text-on-night">
                RK
              </Txt>
            </Gradient>
          </View>
        </View>
      </View>

      {live ? (
        <>
          {/* Live transcript — lines append one at a time, each rising in */}
          <Rise
            duration={DURATION.riseFast}
            className="mb-[22px] rounded-panel-lg border border-white/10 bg-white/[0.06] p-4"
          >
            <View className="mb-[11px] flex-row items-center gap-2">
              <View className="h-[7px] w-[7px] rounded-full bg-green" />
              <Txt variant="overline" className="text-on-night-3">
                Live transcript
              </Txt>
            </View>
            {lines.map((line) => (
              <Rise key={line.id} duration={DURATION.riseFast}>
                <Txt variant="bodySm" className={`mb-[7px] ${ON_NIGHT_6}`}>
                  <Txt variant="bodySm" className="font-geist-600 text-on-night-4">
                    {line.speaker}
                  </Txt>{' '}
                  {line.text}
                </Txt>
              </Rise>
            ))}
          </Rise>

          {/* What the coordinator is pushing into the app while she talks */}
          <View className="mb-[18px] flex-row gap-[9px]">
            {actions.map((action) => (
              <Pressable
                key={action.id}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={action.go}
                className="flex-1 items-center rounded-card border border-white/[0.14] bg-white/[0.05] px-2 py-3 active:bg-white/[0.12]"
              >
                <Txt variant="meta" className={`font-geist-600 ${ON_NIGHT_6}`}>
                  {action.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {/* Call controls */}
      <View className="flex-row justify-center gap-[14px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Unmute your microphone' : 'Mute your microphone'}
          accessibilityState={{ selected: muted }}
          onPress={() => setMuted((m) => !m)}
          className={`h-[62px] w-[62px] items-center justify-center rounded-full border border-white/[0.14] ${
            muted ? 'bg-white/[0.18]' : 'bg-white/[0.07]'
          } active:-translate-y-[2px]`}
        >
          <MicOff size={18} color={ON_NIGHT_6_HEX} strokeWidth={2} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Message your coordinator instead"
          onPress={() => router.push('/chat')}
          className="h-[62px] w-[62px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.07] active:-translate-y-[2px]"
        >
          <MessageSquare size={18} color={ON_NIGHT_6_HEX} strokeWidth={2} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End the call"
          onPress={endCall}
          className="h-[62px] w-[62px] items-center justify-center rounded-full border border-red bg-red active:-translate-y-[2px]"
        >
          <PhoneOff size={18} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>

      <Txt variant="labelSm" className="mt-4 text-center text-on-night-5">
        {live
          ? 'Recorded for your case file · tap red to end'
          : 'Average answer time today: 34 seconds'}
      </Txt>

      {/* Remove with the prototype notice before any real release. This screen
          claims a real person is answering, so it is the most important of the
          three placements. */}
      <PrototypeNotice tone="dark" className="mt-3 self-center" />
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Activity,
  Bandage,
  ChevronRight,
  CircleAlert,
  Clock,
  Navigation,
  Siren,
  Thermometer,
  Users,
  Wind,
  type LucideIcon,
} from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { BackButton, Button, IconWell, ListRow } from '@/components/ui';
import { PulsingDot } from '@/components/PulsingDot';
import { Rise, SlideIn } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { DURATION, EASE, LOOP } from '@/theme/motion';
import { computeSeverity, isImmediateDispatch, isUrgentBand } from '@/lib/triage';
import type { TriageAnswers } from '@/lib/triage';
import { getTriageQuestions } from '@/mocks/api';
import type { TriageOption, TriageQuestion } from '@/mocks/types';
import { useTriage } from '@/store';

/**
 * Symptom triage — three questions, then a severity recommendation.
 *
 * Layout, copy and timings follow README.md §3. The answers are kept in the
 * triage store because the call and chat screens brief the coordinator with
 * them; only the question index is local, since it must not survive a re-entry.
 *
 * SAFETY: this screen never decides how urgent anything is. It collects option
 * ids and hands them to src/lib/triage.ts — a marked clinical stub — which owns
 * `computeSeverity`, the immediate-dispatch short-circuit and the band's colour
 * treatment. README.md and CLAUDE.md are explicit that no screen may infer
 * severity from raw answers.
 */

/**
 * Resolves the kebab-case `iconName` on each option to a lucide component.
 * The mocks deliberately ship names rather than components so the fixture file
 * stays free of imports; this map is the only place that binds the two.
 */
const OPTION_ICONS: Record<string, LucideIcon> = {
  thermometer: Thermometer,
  activity: Activity,
  bandage: Bandage,
  wind: Wind,
  clock: Clock,
  navigation: Navigation,
  users: Users,
  siren: Siren,
};

const TOTAL_QUESTIONS = 3;

export default function TriageScreen() {
  const router = useRouter();
  const reduced = useReduceMotion();

  const answers = useTriage((s) => s.answers);
  const labels = useTriage((s) => s.labels);
  const result = useTriage((s) => s.result);
  const recordAnswer = useTriage((s) => s.answer);
  const setResult = useTriage((s) => s.setResult);
  const reset = useTriage((s) => s.reset);

  const [questions, setQuestions] = useState<TriageQuestion[] | null>(null);
  /** Index of the question on screen; equal to TOTAL_QUESTIONS once done. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    getTriageQuestions().then(setQuestions);
  }, []);

  // Re-entering triage always starts a fresh assessment — a stale answer set
  // would silently pre-brief the coordinator with the last visit's symptoms.
  useEffect(() => {
    reset();
  }, [reset]);

  // ─── Progress track ────────────────────────────────────────────────────────
  // Animated in pixels rather than percent: the track is flexed between the back
  // button and the counter, so its width is only known after layout.
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);
  const answered = Math.min(step, TOTAL_QUESTIONS);

  useEffect(() => {
    progress.value = withTiming(answered / TOTAL_QUESTIONS, {
      duration: reduced ? 0 : DURATION.progress,
      easing: EASE,
    });
  }, [answered, progress, reduced]);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.value * trackWidth }));

  /**
   * Records one answer and decides what comes next. The two branches that end
   * the flow — an immediate-dispatch answer and the final question — both go
   * through `computeSeverity`; nothing here reads the band itself.
   */
  const pick = (option: TriageOption) => {
    recordAnswer(option.id, option.label);

    // Answers are appended in question order, so the array index is the question
    // index and a short-circuit only ever drops trailing entries — which is why
    // the tuple can be built positionally without padding.
    const all = [...answers, option.id];
    const next: TriageAnswers = [all[0], all[1], all[2]];
    const dispatchNow = isImmediateDispatch(option.id);

    if (dispatchNow || step === TOTAL_QUESTIONS - 1) {
      setResult(computeSeverity(next));
      setStep(TOTAL_QUESTIONS);
      return;
    }

    setStep(step + 1);
  };

  if (!questions) return <View className="flex-1 bg-surface" />;

  const question = questions[Math.min(step, TOTAL_QUESTIONS - 1)];
  const done = step >= TOTAL_QUESTIONS && result !== null;
  const urgent = result ? isUrgentBand(result.band) : true;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ flexGrow: 1, paddingTop: 62, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — back, progress, n/3 */}
      <View className="flex-row items-center gap-[14px] px-screen">
        <BackButton />
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`Question ${Math.min(step + 1, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`}
          accessibilityValue={{ min: 0, max: TOTAL_QUESTIONS, now: answered }}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          className="h-1 flex-1 overflow-hidden rounded-pill bg-divider-soft"
        >
          <Animated.View className="h-full rounded-pill bg-blue" style={fillStyle} />
        </View>
        <Txt variant="meta" className="font-geist-600 text-muted-2">
          {answered}/{TOTAL_QUESTIONS}
        </Txt>
      </View>

      {done && result ? (
        // ─── Result ──────────────────────────────────────────────────────────
        <Rise className="flex-1 px-screen pt-[30px]">
          {/* Severity panel. Its colour follows the band, never the raw answers. */}
          <View
            className={`rounded-panel-lg border p-5 ${
              urgent ? 'border-red-border bg-red-tint' : 'border-blue-border bg-blue-tint'
            }`}
          >
            <View className="flex-row items-center gap-[9px]">
              <PulsingDot
                size={9}
                className={urgent ? 'bg-red' : 'bg-blue'}
                duration={urgent ? LOOP.pulseUrgent : LOOP.pulse}
              />
              <Txt variant="overline" className={urgent ? 'text-red' : 'text-blue'}>
                {result.overline}
              </Txt>
            </View>
            <Txt variant="cardHeroSm" className="mt-3">
              {result.headline}
            </Txt>
            <Txt
              variant="bodySm"
              className={`mt-[10px] ${urgent ? 'text-red-text' : 'text-muted'}`}
            >
              {result.explanation}
            </Txt>
          </View>

          {/* What the coordinator will already know, in the traveller's words. */}
          <View className="mt-[18px] overflow-hidden rounded-panel border border-line">
            <ListRow label="Main complaint" value={labels[0] ?? 'Not answered'} />
            <ListRow label="Duration" value={labels[1] ?? 'Not asked'} />
            <ListRow label="Mobility" value={labels[2] ?? 'Not asked'} />
            <ListRow label="Suggested care" value={result.suggestedCare} last />
          </View>

          <View className="flex-1" />

          <Button
            label="Connect me to a coordinator"
            variant="danger"
            height={54}
            className="mt-7"
            onPress={() => router.push('/call')}
          />
          <Button
            label="Browse clinics myself"
            variant="secondary"
            height={50}
            className="mt-[10px]"
            onPress={() => router.push('/care')}
          />
        </Rise>
      ) : (
        // ─── Question ────────────────────────────────────────────────────────
        // Keyed on the step so each question re-mounts and slides in afresh.
        <SlideIn
          key={question.id}
          duration={DURATION.slideFast}
          className="flex-1 px-screen pt-[34px]"
        >
          <Txt variant="overline" className="text-blue">
            {question.kicker}
          </Txt>
          <Txt variant="titleLg" className="mt-3">
            {question.question}
          </Txt>
          <Txt variant="body" className="mt-[10px] text-muted-2">
            {question.help}
          </Txt>

          <View className="mt-[26px] gap-[9px]">
            {question.options.map((option) => {
              const Icon = OPTION_ICONS[option.iconName] ?? CircleAlert;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label}. ${option.sub}`}
                  onPress={() => pick(option)}
                  className="flex-row items-center gap-[13px] rounded-card border border-line bg-surface p-4 active:border-blue active:bg-blue-tint"
                >
                  <IconWell
                    icon={Icon}
                    size={34}
                    iconSize={11}
                    className={option.wellClass}
                    color={option.iconClass}
                  />
                  <View className="flex-1">
                    <Txt variant="bodyMd" className="font-geist-600">
                      {option.label}
                    </Txt>
                    <Txt variant="meta" className="mt-[2px] text-muted-2">
                      {option.sub}
                    </Txt>
                  </View>
                  <ChevronRight size={14} color="#C3CAD6" />
                </Pressable>
              );
            })}
          </View>

          <View className="flex-1" />

          {/* Escape hatch — nobody in real trouble should have to finish a form. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip the questions and call a coordinator now"
            hitSlop={6}
            onPress={() => router.push('/call')}
            className="mt-[26px] rounded-card border border-dashed border-dash-border-2 bg-bg-2 p-[14px] active:border-coral"
          >
            <Txt variant="bodyXs" className="text-center text-muted">
              Skip questions — call a coordinator now
            </Txt>
          </Pressable>
        </SlideIn>
      )}
    </ScrollView>
  );
}

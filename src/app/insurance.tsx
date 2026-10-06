import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Check, Upload } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { Button, IconWell, ScreenHeader } from '@/components/ui';
import { Gradient } from '@/components/Gradient';
import { Pop, Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { DURATION, EASE, LINEAR, LOOP, TIMING } from '@/theme/motion';
import { getClaimSteps, getPolicy } from '@/mocks/api';
import type { ClaimStep, ClaimStepState, Policy, UploadState } from '@/mocks/types';

/**
 * Insurance & claim — prove coverage, then get the claim moving.
 *
 * Layout, copy and timings follow README.md §10. The upload is a three-state
 * local machine ('idle' → 'busy' → 'done') driven by a fake progress interval,
 * and the claim stepper reads its states off that machine rather than off the
 * fixture — the mock ships the four labels without states for exactly that
 * reason. Nothing here survives navigation, so it is all useState: a real claim
 * status arrives from insurer webhooks, not from what the traveller last tapped.
 *
 * Production (README.md): real upload to storage, OCR line-item extraction
 * server-side, status from insurer webhooks. Never store policy documents on the
 * device.
 */

/**
 * The claim stepper's dot colour transition. README.md §10 specifies 300ms; the
 * shared scale's only 300ms entry is DURATION.tabSwitch, which means something
 * else, so the value is named locally rather than borrowed.
 */
const DOT_TRANSITION = 300;

/** The file the prototype pretends to read. Server-owned once uploads are real. */
const UPLOAD_FILENAME = 'ashoka-invoice.pdf';
const UPLOAD_RESULT = '4 items read · ₹6,040 matched your estimate';

/**
 * The shimmer sweep, authored in README.md as
 * `linear-gradient(90deg,#F1F3F7,#E4E7EC,#F1F3F7)` over a 320px band. Gradient
 * stops are the one place a hex belongs in a screen — expo-linear-gradient takes
 * colours, not classes — and these two are `line-soft` and `line`.
 */
const SHIMMER_COLORS = ['#F1F3F7', '#E4E7EC', '#F1F3F7'] as const;
const SHIMMER_BAND = 320;

// ─── Spinner ─────────────────────────────────────────────────────────────────

/**
 * The 22px upload spinner: a 2.5px ring with a blue top edge, rotating over
 * LOOP.spinner. It carries meaning — a frozen spinner reads as a hung upload —
 * so reduce-motion slows it by LOOP.reducedMotionFactor rather than stopping it.
 */
function Spinner() {
  const reduced = useReduceMotion();
  const spin = useSharedValue(0);

  useEffect(() => {
    const factor = reduced ? LOOP.reducedMotionFactor : 1;

    spin.value = 0;
    spin.value = withRepeat(
      withTiming(1, { duration: LOOP.spinner * factor, easing: LINEAR }),
      -1,
      false,
    );
  }, [reduced, spin]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <Animated.View
      className="h-[22px] w-[22px] rounded-full border-[2.5px] border-line border-t-blue"
      style={style}
    />
  );
}

// ─── Shimmer ─────────────────────────────────────────────────────────────────

/**
 * One placeholder line standing in for an OCR result still being extracted.
 *
 * CSS animates `background-position` on an over-wide gradient; RN has no such
 * property, so the equivalent is a fixed 320px gradient band translated across
 * the line. Purely decorative — under reduce-motion the band is dropped and the
 * line rests at its `line-soft` fill.
 */
function ShimmerLine({ delay = 0, className = '' }: { delay?: number; className?: string }) {
  const reduced = useReduceMotion();
  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduced || width === 0) return;

    sweep.value = 0;
    sweep.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: LOOP.shimmer, easing: LINEAR }), -1, false),
    );
  }, [delay, reduced, sweep, width]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -SHIMMER_BAND + sweep.value * (width + SHIMMER_BAND) }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      className={`h-[11px] overflow-hidden rounded-bar bg-line-soft ${className}`}
    >
      {reduced ? null : (
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, width: SHIMMER_BAND }, style]}
        >
          <Gradient angle={90} colors={SHIMMER_COLORS} style={{ flex: 1 }} />
        </Animated.View>
      )}
    </View>
  );
}

// ─── Stepper dot ─────────────────────────────────────────────────────────────

/**
 * An 11px claim dot that cross-fades between its three states over 300ms.
 *
 * Reanimated can animate a colour directly, but only from raw hex values — this
 * stacks the `blue` and `green` fills over the pending `dash-border-2` base and
 * animates their opacity instead, so every colour stays a token.
 */
function StepDot({ state }: { state: ClaimStepState }) {
  const reduced = useReduceMotion();
  const active = useSharedValue(state === 'active' ? 1 : 0);
  const done = useSharedValue(state === 'done' ? 1 : 0);

  useEffect(() => {
    const duration = reduced ? 0 : DOT_TRANSITION;

    active.value = withTiming(state === 'active' ? 1 : 0, { duration, easing: EASE });
    done.value = withTiming(state === 'done' ? 1 : 0, { duration, easing: EASE });
  }, [active, done, reduced, state]);

  const activeStyle = useAnimatedStyle(() => ({ opacity: active.value }));
  const doneStyle = useAnimatedStyle(() => ({ opacity: done.value }));

  return (
    <View className="h-[11px] w-[11px] rounded-full bg-dash-border-2">
      <Animated.View className="absolute inset-0 rounded-full bg-blue" style={activeStyle} />
      <Animated.View className="absolute inset-0 rounded-full bg-green" style={doneStyle} />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

/**
 * Where each of the four steps sits, given the upload.
 * idle → nothing has been sent; busy → the documents are arriving; done → they
 * landed and Sahaya is reviewing. The last two steps wait on the insurer.
 */
function stepStateFor(index: number, upload: UploadState): ClaimStepState {
  if (index === 0) return upload === 'done' ? 'done' : upload === 'busy' ? 'active' : 'pending';
  if (index === 1) return upload === 'done' ? 'active' : 'pending';
  return 'pending';
}

export default function InsuranceScreen() {
  const router = useRouter();
  const reduced = useReduceMotion();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [steps, setSteps] = useState<Omit<ClaimStep, 'state'>[] | null>(null);

  /** Upload machine — screen-local, deliberately not in the store. */
  const [upload, setUpload] = useState<UploadState>('idle');
  const [pct, setPct] = useState(0);

  /** The interval and its running total, kept in refs so the tick stays pure. */
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const pctRef = useRef(0);

  useEffect(() => {
    getPolicy().then(setPolicy);
    getClaimSteps().then(setSteps);
  }, []);

  // A half-finished upload must not keep ticking after the screen is gone.
  useEffect(
    () => () => {
      if (tick.current) clearInterval(tick.current);
    },
    [],
  );

  // ─── Progress bar ──────────────────────────────────────────────────────────
  // Animated in pixels: the bar is full-bleed inside a padded card, so its width
  // is only known after layout. Linear, because an eased progress bar reads as a
  // stutter between the 160ms ticks.
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct / 100, {
      duration: reduced ? 0 : DURATION.uploadStep,
      easing: LINEAR,
    });
  }, [pct, progress, reduced]);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.value * trackWidth }));

  /** Fakes the read: 7–16% every 160ms until the file is fully "parsed". */
  const startUpload = () => {
    if (upload === 'busy') return;

    pctRef.current = 0;
    setPct(0);
    setUpload('busy');

    tick.current = setInterval(() => {
      const next = pctRef.current + 7 + Math.random() * 9;

      if (next >= 100) {
        if (tick.current) clearInterval(tick.current);
        tick.current = null;
        pctRef.current = 100;
        setPct(100);
        setUpload('done');
        return;
      }

      pctRef.current = next;
      setPct(next);
    }, TIMING.uploadTick);
  };

  if (!policy || !steps) return <View className="flex-1 bg-bg" />;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: 62, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen">
        <ScreenHeader title="Insurance & claim" />

        {/* Policy card — the proof of coverage, shown before anything is asked for */}
        <Rise duration={DURATION.riseBase}>
          <View className="mt-[18px] overflow-hidden rounded-panel-lg">
            <Gradient angle={135} colors={['#153A8A', '#0B1020']} style={{ padding: 18 }}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Txt variant="overline" className="font-geist-600 text-on-night-3">
                    Travel policy
                  </Txt>
                  <Txt variant="cardTitle2xl" className="mt-2 text-on-night">
                    {policy.insurer}
                  </Txt>
                </View>
                {policy.active ? (
                  <View className="rounded-tag bg-green-bright px-[9px] py-[5px]">
                    <Txt variant="metaSm" className="font-geist-700 text-night">
                      ACTIVE
                    </Txt>
                  </View>
                ) : null}
              </View>

              <View className="mt-[22px] flex-row gap-[26px]">
                <View>
                  <Txt variant="metaSm" className="text-on-night-4">
                    Policy no.
                  </Txt>
                  <Txt variant="bodySm" className="mt-[3px] tracking-policy text-on-night">
                    {policy.policyNumber}
                  </Txt>
                </View>
                <View>
                  <Txt variant="metaSm" className="text-on-night-4">
                    Valid until
                  </Txt>
                  <Txt variant="bodySm" className="mt-[3px] text-on-night">
                    {policy.validUntil}
                  </Txt>
                </View>
              </View>
            </Gradient>
          </View>
        </Rise>

        {/* Upload — one dropzone with three faces */}
        <Rise delay={60} duration={DURATION.riseBase}>
          <Txt variant="section" className="mb-[11px] mt-6">
            Upload your bill or report
          </Txt>

          {upload === 'idle' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Photograph or attach a document. PDF or photo — we read the itemisation for you."
              onPress={startUpload}
              className="items-center rounded-panel-lg border-[1.5px] border-dashed border-dash-border bg-surface px-5 py-[34px] active:border-blue active:bg-press-tint"
            >
              <IconWell
                icon={Upload}
                size={44}
                iconSize={20}
                className="bg-blue-tint"
                color="#0B5FFF"
                radiusClassName="rounded-well"
              />
              <Txt variant="bodyMl" className="mt-[14px] font-geist-600">
                Photograph or attach a document
              </Txt>
              <Txt variant="labelSm" className="mt-[5px] text-muted-2">
                PDF or photo · we read the itemisation for you
              </Txt>
            </Pressable>
          ) : null}

          {upload === 'busy' ? (
            <View
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Reading ${UPLOAD_FILENAME}, ${Math.round(pct)} percent`}
              className="rounded-panel-lg border border-line bg-surface px-5 py-6"
            >
              <View className="flex-row items-center gap-3">
                <Spinner />
                <Txt variant="body" className="flex-1 font-geist-600">
                  Reading {UPLOAD_FILENAME}…
                </Txt>
                <Txt variant="bodyXs" className="font-geist-700 text-blue">
                  {Math.round(pct)}%
                </Txt>
              </View>

              <View
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                className="mt-4 h-[6px] overflow-hidden rounded-bar bg-divider-soft"
              >
                <Animated.View className="h-full rounded-bar bg-blue" style={fillStyle} />
              </View>

              {/* The itemisation being extracted, not yet knowable */}
              <ShimmerLine className="mt-[14px]" />
              <ShimmerLine
                delay={LOOP.shimmerStagger[1]}
                className="mt-2 w-[62%]"
              />
            </View>
          ) : null}

          {upload === 'done' ? (
            <Pop duration={DURATION.popFast}>
              <View className="rounded-panel-lg border border-green-border bg-green-tint-2 p-[18px]">
                <View className="flex-row items-center gap-[11px]">
                  <View className="h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-green">
                    <Check size={14} color="#FFFFFF" strokeWidth={2.6} />
                  </View>
                  <View className="flex-1">
                    <Txt variant="body" className="font-geist-600">
                      {UPLOAD_FILENAME}
                    </Txt>
                    <Txt variant="meta" className="mt-[2px] text-green-deep">
                      {UPLOAD_RESULT}
                    </Txt>
                  </View>
                </View>
              </View>
            </Pop>
          ) : null}
        </Rise>

        {/* Claim status — the four steps, dots driven by the upload above */}
        <Rise delay={100} duration={DURATION.riseBase}>
          <Txt variant="section" className="mb-1 mt-[26px]">
            Claim status
          </Txt>

          <View className="pt-[6px]">
            {steps.map((step, index) => {
              const state = stepStateFor(index, upload);
              const last = index === steps.length - 1;

              return (
                <View
                  key={step.id}
                  accessibilityRole="text"
                  accessibilityLabel={`${step.label} — ${state}`}
                  className="flex-row items-start gap-[13px]"
                >
                  <View className="items-center pt-[5px]">
                    <StepDot state={state} />
                    {/* The connector belongs between steps, so the last one drops it */}
                    {last ? null : <View className="h-[34px] w-[1.5px] bg-track-soft" />}
                  </View>
                  <Txt
                    variant="bodySm"
                    className={`pt-px font-geist-500 ${
                      state === 'pending' ? 'text-muted-3' : 'text-ink'
                    }`}
                  >
                    {step.label}
                  </Txt>
                </View>
              );
            })}
          </View>

          <Button
            label="Ask Rhea about this claim"
            variant="ghost"
            height={50}
            className="mt-2"
            onPress={() => router.push('/chat')}
          />
        </Rise>
      </View>
    </ScrollView>
  );
}

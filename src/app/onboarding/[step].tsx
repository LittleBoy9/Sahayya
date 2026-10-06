import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Txt } from '@/components/Txt';
import { Button } from '@/components/ui';
import { Glow } from '@/components/Gradient';
import { Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useTrip } from '@/store';
import { shadows } from '@/theme/shadows';
import { DURATION, EASE } from '@/theme/motion';
import { getCities, getOnboardingSteps } from '@/mocks/api';
import type { City } from '@/mocks/types';

/**
 * Onboarding — the arrival flow, README.md §1.
 *
 * Three steps on one dark route: two explain what Sahaya is, the third captures
 * the destination city so providers, prices and insurance can be preloaded.
 *
 * The step lives in the URL rather than in state, so each step is its own
 * back-navigable entry and the root layout's `fade` transition covers the change.
 * The chosen city goes to the trip store (it outlives this screen); nothing else
 * here needs to survive navigation.
 */

/** Shape of one step as `getOnboardingSteps()` returns it. */
type OnboardingStep = Awaited<ReturnType<typeof getOnboardingSteps>>[number];

// ─── Progress dots ───────────────────────────────────────────────────────────

/**
 * One of the three 3px bars. The fill crossfades over 300ms per README.md — each
 * step is a fresh mount, so in practice this reads as the filled bars arriving
 * with the screen. Decorative, so reduce-motion snaps it.
 */
function StepBar({ filled }: { filled: boolean }) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    progress.value = reduced
      ? target
      : // tabSwitch is the app's 300ms crossfade token.
        withTiming(target, { duration: DURATION.tabSwitch, easing: EASE });
  }, [filled, reduced, progress]);

  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View className="h-[3px] flex-1 overflow-hidden rounded-pill bg-white/[0.16]">
      <Animated.View className="h-full w-full rounded-pill bg-blue" style={style} />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const city = useTrip((s) => s.city);
  const setCity = useTrip((s) => s.setCity);
  const completeOnboarding = useTrip((s) => s.completeOnboarding);

  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    getOnboardingSteps().then(setSteps);
    getCities().then(setCities);
  }, []);

  // The dark ground paints immediately so the fade from Home has nothing to flash.
  if (steps.length === 0) return <View className="flex-1 bg-night" />;

  // A hand-typed or stale step index must not crash the flow — clamp it.
  const parsed = Number.parseInt(step ?? '0', 10);
  const index = Number.isNaN(parsed)
    ? 0
    : Math.min(Math.max(parsed, 0), steps.length - 1);
  const isLast = index === steps.length - 1;
  const content = steps[index];

  /** Steps 0 and 1 advance; the last one enters the app. */
  const onPrimary = () => {
    if (!isLast) {
      router.push(`/onboarding/${index + 1}`);
      return;
    }
    completeOnboarding();
    router.replace('/');
  };

  const onSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <View className="flex-1 overflow-hidden bg-night">
      <StatusBar style="light" />

      {/*
        Two decorative radial glows bleeding off opposite corners. <Glow> takes a
        colour string rather than a class (RN has no radial gradient — it is an SVG
        fill), so these are the `blue` and `coral` tokens at the prototype's alpha.
      */}
      <Glow
        size={420}
        color="rgba(11,95,255,.55)"
        stop={0.68}
        className="-right-[120px] -top-[140px]"
      />
      <Glow
        size={360}
        color="rgba(255,107,87,.32)"
        stop={0.7}
        className="-bottom-[80px] -left-[140px]"
      />

      {/*
        Padding 120 / 28 / 40 per README.md. flexGrow lets the spacer push the
        controls to the bottom on a tall device, while still scrolling on a short
        one — step 3 stacks a 38px headline and four city rows.
      */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 120,
          paddingHorizontal: 28,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand lockup + headline + body */}
        <Rise duration={DURATION.riseSlow}>
          <View className="mb-[52px] flex-row items-center gap-[10px]">
            <View className="h-[30px] w-[30px] items-center justify-center rounded-card bg-blue">
              <Txt variant="cardTitle" className="font-figtree-800 tracking-normal text-on-night">
                S
              </Txt>
            </View>
            <Txt variant="cardTitleXl" className="font-figtree-800 tracking-card-title-sm text-on-night">
              Sahaya
            </Txt>
          </View>

          <Txt variant="hero" accessibilityRole="header" className="text-on-night">
            {content.title}
          </Txt>
          <Txt variant="bodyLg" className="mt-4 max-w-[290px] text-on-night-2">
            {content.body}
          </Txt>
        </Rise>

        <View className="flex-1" />

        {/* City picker — last step only. Writes straight to the trip store. */}
        {isLast && cities.length > 0 ? (
          <Rise delay={50} duration={DURATION.slideSlow} className="mb-[28px] gap-[9px]">
            <Txt variant="overline" className="mb-[2px] font-geist-600 text-on-night-4">
              Where are you travelling?
            </Txt>
            {cities.map((option) => {
              const selected = option.name === city;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.name}, ${option.providerCount} providers`}
                  onPress={() => setCity(option.name)}
                  className={`flex-row items-center gap-3 rounded-card border px-[15px] py-[14px] ${
                    selected
                      ?                        'border-blue-select bg-blue/[0.16]'
                      : 'border-white/[0.12] bg-white/[0.05]'
                  }`}
                >
                  <View
                    className={`h-2 w-2 rounded-full ${
                      selected ? 'bg-blue-select-dot' : 'bg-white/[0.3]'
                    }`}
                  />
                  <Txt variant="bodyMd" className="flex-1 font-geist-500 text-on-night">
                    {option.name}
                  </Txt>
                  <Txt variant="meta" className="text-on-night-7">
                    {option.providerCount} providers
                  </Txt>
                </Pressable>
              );
            })}
          </Rise>
        ) : null}

        {/* Progress: filled up to and including the current step. */}
        <View
          className="mb-5 flex-row gap-[6px]"
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${index + 1} of ${steps.length}`}
        >
          {steps.map((s, i) => (
            <StepBar key={s.id} filled={i <= index} />
          ))}
        </View>

        {/*
          54px primary. `style` overrides Button's default quiet blue shadow with
          the stronger onboarding one from README.md's shadow table, so the height
          has to be restated in the same array.
        */}
        <Button
          label={content.cta}
          height={54}
          onPress={onPrimary}
          className="active:translate-y-[1px]"
          style={[{ height: 54 }, shadows.bluePrimary]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip setup and go to the home screen"
          hitSlop={10}
          onPress={onSkip}
          className="mt-3 h-[30px] items-center justify-center"
        >
          <Txt variant="label" className="text-on-night-8">
            Skip setup
          </Txt>
        </Pressable>
      </ScrollView>
    </View>
  );
}

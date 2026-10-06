import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Txt } from '@/components/Txt';
import { Glow } from '@/components/Gradient';
import { Button, Card, ScreenHeader } from '@/components/ui';
import { Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { DURATION, EASE } from '@/theme/motion';
import { getCostEstimate, getProvider } from '@/mocks/api';
import type { CostEstimate, Provider } from '@/mocks/types';

/**
 * Cost estimate — what the visit will actually cost, before it happens.
 *
 * Layout, copy and timings follow README.md §9: a dark hero carrying the total
 * and the coverage split, a line-by-line breakdown where each row's bar shows
 * its share of the bill, then the provenance note that is the whole reason a
 * traveller believes the number.
 *
 * Every figure is formatted from the numbers on CostEstimate rather than stored
 * as display strings — the USD side comes from a live FX rate in production, and
 * `fxDate` is surfaced on tap because README.md asks for the rate date to be
 * inspectable.
 */

/** ₹6,040 — Indian digit grouping, which is not the Western one (₹60,40 vs 6,040). */
function inr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function usd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

// ─── Breakdown bar ───────────────────────────────────────────────────────────

interface CostBarProps {
  /** Share of the total, 0–1. */
  share: number;
  /** Stagger offset so the bars read as a sequence rather than a single block. */
  delay: number;
}

/**
 * The 6px share bar under one cost line.
 *
 * Its own component because each bar owns Reanimated hooks, which cannot be
 * created inside a map. The bar is laid out at its final width and then scaled
 * in from `transformOrigin: left` — scaling is on the UI thread, where animating
 * width would relayout every frame.
 */
function CostBar({ share, delay }: CostBarProps) {
  const reduced = useReduceMotion();
  const grow = useSharedValue(0);

  useEffect(() => {
    // Decorative: under reduce-motion the bar simply appears at full length.
    grow.value = reduced
      ? withTiming(1, { duration: 0 })
      : withDelay(delay, withTiming(1, { duration: DURATION.costBar, easing: EASE }));
  }, [delay, grow, reduced]);

  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: grow.value }] }));

  return (
    <View className="mt-2 h-[6px] overflow-hidden rounded-pill bg-track-soft">
      <Animated.View
        className="h-full rounded-pill bg-blue"
        style={[
          { width: `${Math.round(share * 100)}%`, transformOrigin: 'left' },
          fill,
        ]}
      />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CostScreen() {
  const router = useRouter();
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  /** The FX rate date is hidden until the USD figure is tapped — README.md §9. */
  const [showRateDate, setShowRateDate] = useState(false);

  useEffect(() => {
    getCostEstimate().then(setEstimate);
    getProvider('ashoka').then((p) => setProvider(p ?? null));
  }, []);

  if (!estimate) return <View className="flex-1 bg-bg" />;

  const providerName = provider?.name ?? '';

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: 62, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen">
        <ScreenHeader title="What this will cost" />

        {/* Dark hero — the total, then how little of it the traveller pays */}
        <Rise duration={DURATION.riseFast} className="mt-[18px]">
          <View className="overflow-hidden rounded-panel-lg bg-night p-5">
            {/* Blue radial wash bleeding off the top-right corner */}
            <Glow
              size={200}
              color="rgba(11,95,255,0.5)"
              stop={0.7}
              className="-right-[50px] -top-[70px]"
            />

            <Txt variant="overlineLg" className="text-on-night-4">
              Estimated total at {providerName}
            </Txt>

            <View className="mt-[10px] flex-row items-baseline gap-[10px]">
              <Txt variant="costHero" className="text-on-night">
                {inr(estimate.totalInr)}
              </Txt>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Approximately ${usd(estimate.totalUsd)}. Show the exchange rate date.`}
                hitSlop={10}
                onPress={() => setShowRateDate((shown) => !shown)}
              >
                <Txt variant="body" className="text-on-night-3">
                  ≈ {usd(estimate.totalUsd)}
                </Txt>
              </Pressable>
            </View>

            {showRateDate ? (
              <Txt variant="metaSm" className="mt-[6px] text-on-night-5">
                Exchange rate as of {estimate.fxDate}
              </Txt>
            ) : null}

            {/* Divider at white 10% — the hero sits on `night`, not on a surface */}
            <View className="mt-5 h-px bg-white/10" />

            <View className="mt-[18px] flex-row gap-5">
              <View>
                <Txt variant="metaLg" className="text-on-night-4">
                  Insurance covers
                </Txt>
                <Txt variant="cardTitleXl" className="mt-1 text-green-bright">
                  {estimate.coveragePercent}%
                </Txt>
              </View>
              <View>
                <Txt variant="metaLg" className="text-on-night-4">
                  You pay at the desk
                </Txt>
                <Txt variant="cardTitleXl" className="mt-1 text-on-night">
                  {inr(estimate.youPayInr)}
                </Txt>
              </View>
            </View>
          </View>
        </Rise>

        {/* Line by line — label, amount, USD equivalent, share bar */}
        <Txt variant="section" className="mb-3 mt-6">
          Line by line
        </Txt>

        <View className="gap-[14px]">
          {estimate.lines.map((line, index) => (
            <View
              key={line.id}
              accessible
              accessibilityLabel={`${line.label}. ${inr(line.amountInr)}, approximately ${usd(
                line.amountUsd,
              )}. ${Math.round(line.share * 100)} percent of the total.`}
            >
              <View className="flex-row items-baseline justify-between gap-3">
                <Txt variant="bodySm" className="flex-1 text-body-strong">
                  {line.label}
                </Txt>
                <View className="shrink-0 items-end">
                  <Txt variant="body" className="font-geist-700">
                    {inr(line.amountInr)}
                  </Txt>
                  <Txt variant="metaSm" className="mt-[2px] text-muted-3">
                    {usd(line.amountUsd)}
                  </Txt>
                </View>
              </View>
              {/* 80ms apart: enough to read as a sequence, short enough that the
                  last bar still lands inside the hero's entrance. */}
              <CostBar share={line.share} delay={120 + index * 80} />
            </View>
          ))}
        </View>

        {/* Provenance — the claim that makes the number trustworthy. README.md and
            CLAUDE.md both flag the 10% dispute promise as a legal commitment, so
            the copy ships verbatim from the estimate rather than being reworded. */}
        <Card className="mt-6 p-[15px]">
          <Txt variant="bodyXs" className="text-muted">
            {estimate.provenance}
          </Txt>
        </Card>

        <Button
          label="Check my insurance"
          className="mt-[14px]"
          onPress={() => router.push('/insurance')}
        />
      </View>
    </ScrollView>
  );
}

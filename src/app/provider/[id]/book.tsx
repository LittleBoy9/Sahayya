import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Languages } from 'lucide-react-native';
import Svg, { Path, type PathProps } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Txt } from '@/components/Txt';
import { Button, IconWell, ScreenHeader } from '@/components/ui';
import { Pop, Rise } from '@/components/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { shadows } from '@/theme/shadows';
import { DURATION, EASE, TIMING } from '@/theme/motion';
import { getAvailability, getDoctors, getProvider, getSession } from '@/mocks/api';
import type { BookingDay, BookingSlot, Provider } from '@/mocks/types';
import { useBooking } from '@/store';

/**
 * Booking — confirm a held slot in as few taps as possible.
 *
 * Two states, per README.md §8: `picking` (held-for-you card, day pills, slot
 * grid, interpreter row, a CTA that reads the selection back) and `confirmed`
 * (a checkmark that draws itself, the case number, and the way onward to Cost).
 *
 * The day/slot selection lives in the `useBooking` store because it is set from
 * the chat's appointment card too and must survive navigation; which of the two
 * states we are in is screen-local — "Change time" is a step back, not a route.
 */

/** The slot grid is 3 columns wide (README.md §8). */
const SLOT_COLUMNS = 3;

/** Splits the slot list into fixed-width rows so the columns are truly equal. */
function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

// ─── Drawing checkmark ───────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * The success checkmark, drawn rather than revealed: stroke-dashoffset 34 → 0
 * over TIMING.checkDraw after TIMING.checkDelay. Its own component so the hooks
 * mount fresh every time the screen flips into the confirmed state.
 */
function DrawnCheck() {
  const reduced = useReduceMotion();
  // 34 = the dash length of the path, so the stroke starts fully retracted.
  const dashOffset = useSharedValue(34);

  useEffect(() => {
    if (reduced) {
      // Decorative — under reduce-motion the mark is simply already drawn.
      dashOffset.value = 0;
      return;
    }

    dashOffset.value = withDelay(
      TIMING.checkDelay,
      withTiming(0, { duration: TIMING.checkDraw, easing: EASE }),
    );
  }, [dashOffset, reduced]);

  const animatedProps = useAnimatedProps<PathProps>(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Pop duration={DURATION.popSlow}>
      <View className="h-24 w-24 items-center justify-center rounded-full bg-green-tint">
        <Svg width={42} height={42} viewBox="0 0 42 42">
          {/* react-native-svg takes colour as a string prop, like lucide does. */}
          <AnimatedPath
            d="M11 22 L18 29 L31 14"
            fill="none"
            stroke="#0FA958"
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={34}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
    </Pop>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const day = useBooking((s) => s.day);
  const slot = useBooking((s) => s.slot);
  const setDay = useBooking((s) => s.setDay);
  const setSlot = useBooking((s) => s.setSlot);

  /** 0 = picking a slot, 1 = confirmed. Local: "Change time" returns to 0. */
  const [bookStep, setBookStep] = useState<0 | 1>(0);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [days, setDays] = useState<BookingDay[]>([]);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);

  useEffect(() => {
    getProvider(id).then((p) => setProvider(p ?? null));
    // The doctor whose slot is being held — the first English-speaking name the
    // provider detail screen offers. Not every provider has one on file.
    getDoctors(id).then((doctors) => setDoctorName(doctors[0]?.name ?? null));
    getAvailability().then((availability) => {
      setDays(availability.days);
      setSlots(availability.slots);
    });
    getSession().then((session) => setCaseNumber(session.caseNumber));
  }, [id]);

  if (!provider || !days.length || !slots.length) return <View className="flex-1 bg-surface" />;

  /** "Today · 10:30 · Dr. A. Menon" — read back by the CTA and the receipt. */
  const bookLine = [day, slot, doctorName].filter(Boolean).join(' · ');

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingTop: 58, paddingBottom: 40, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {bookStep === 0 ? (
        // ─── Picking ─────────────────────────────────────────────────────────
        <Rise duration={DURATION.riseFast} className="flex-1 px-screen">
          <ScreenHeader title="Book a visit" />

          {/* The slot the coordinator is already holding with the clinic */}
          <View className="mt-5 rounded-panel border border-line bg-bg-2 p-[15px]">
            <Txt variant="overline" className="tracking-overline text-blue">
              Held for you
            </Txt>
            <Txt variant="cardTitle" className="mt-[7px]">
              {provider.name}
            </Txt>
            <Txt variant="labelSm" className="mt-[3px] text-muted-2">
              {provider.address}
            </Txt>
          </View>

          {/* Day — three equal pills, selected is an ink fill */}
          <Txt variant="overlineXs" className="mb-[10px] mt-6 text-muted-3">
            Day
          </Txt>
          <View className="flex-row gap-2">
            {days.map((option) => {
              const selected = option.label === day;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => setDay(option.label)}
                  className={`h-[46px] flex-1 items-center justify-center rounded-card border ${
                    selected ? 'border-ink bg-ink' : 'border-line bg-surface'
                  }`}
                >
                  <Txt
                    variant="body"
                    className={`font-geist-600 ${selected ? 'text-on-night' : 'text-body-strong'}`}
                  >
                    {option.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          {/* Time — 3-column grid, selected is a blue-tint fill with a blue border.
              Rendered row by row rather than wrapped, so every column is exactly
              a third wide however many slots the clinic returns. */}
          <Txt variant="overlineXs" className="mb-[10px] mt-[22px] text-muted-3">
            Time
          </Txt>
          <View className="gap-2">
            {chunk(slots, SLOT_COLUMNS).map((row, rowIndex) => (
              <View key={row[0].id} className="flex-row gap-2">
                {row.map((option) => {
                  const selected = option.label === slot;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${option.label}${selected ? ', selected' : ''}`}
                      onPress={() => setSlot(option.label)}
                      className={`h-[46px] flex-1 items-center justify-center rounded-card border ${
                        selected ? 'border-blue bg-blue-tint' : 'border-line bg-surface'
                      }`}
                    >
                      <Txt
                        variant="body"
                        className={`font-geist-600 ${selected ? 'text-blue' : 'text-body-strong'}`}
                      >
                        {option.label}
                      </Txt>
                    </Pressable>
                  );
                })}
                {/* Keeps a short final row aligned to the grid instead of stretching. */}
                {row.length < SLOT_COLUMNS
                  ? Array.from({ length: SLOT_COLUMNS - row.length }).map((_, i) => (
                      <View key={`pad-${rowIndex}-${i}`} className="flex-1" />
                    ))
                  : null}
              </View>
            ))}
          </View>

          {/* Interpreter — included, not an upsell */}
          <View className="mt-[22px] flex-row items-center gap-3 rounded-panel border border-line px-[15px] py-[14px]">
            <IconWell icon={Languages} size={34} className="bg-green-tint" color="#0FA958" />
            <View className="flex-1">
              <Txt variant="bodySm" className="font-geist-600">
                Interpreter on standby
              </Txt>
              <Txt variant="metaLg" className="mt-[2px] text-muted-2">
                Free · joins by phone if needed
              </Txt>
            </View>
            <Txt variant="meta" className="font-geist-600 text-green">
              Added
            </Txt>
          </View>

          <View className="flex-1" />

          {/* The CTA reads the whole selection back before it commits anything */}
          <Button
            label={`Confirm ${bookLine}`}
            onPress={() => setBookStep(1)}
            className="mt-6"
            // README.md §8: this CTA is 54px and carries the stronger blue shadow,
            // so the style array supplies both in place of Button's defaults.
            style={[{ height: 54 }, shadows.bluePrimarySoft]}
          />
        </Rise>
      ) : (
        // ─── Confirmed ───────────────────────────────────────────────────────
        <Rise duration={DURATION.riseBase} className="flex-1 px-screen-dark">
          <View className="flex-1 items-center justify-center">
            <DrawnCheck />

            <Txt variant="cardHero" className="mt-[22px] text-center">
              You are booked
            </Txt>
            <Txt variant="bodyMl" className="mt-[10px] text-center text-muted">
              {bookLine}
            </Txt>
            <Txt variant="bodyMl" className="text-center text-muted">
              {provider.name}
            </Txt>

            {/* What to do on arrival, and what the clinic already has */}
            <View className="mt-[22px] w-full rounded-panel border border-line bg-bg-2 px-4 py-[14px]">
              <Txt variant="labelSm" className="leading-[20px] text-muted">
                Show your Sahaya case number at reception. Rhea has sent the clinic your triage
                notes, allergies and insurance approval.
              </Txt>
              {caseNumber ? (
                <Txt variant="caseNumber" className="mt-[11px]">
                  {caseNumber}
                </Txt>
              ) : null}
            </View>
          </View>

          <Button label="What will this cost?" onPress={() => router.push('/cost')} />
          <Button
            label="Change time"
            variant="secondary"
            height={48}
            className="mt-[10px]"
            // Returns to picking with day and slot intact — they live in the store.
            onPress={() => setBookStep(0)}
          />
        </Rise>
      )}
    </ScrollView>
  );
}

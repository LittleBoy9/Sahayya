import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Txt } from '@/components/Txt';
import { Button, Pill, ScreenHeader } from '@/components/ui';
import { Pop, Rise } from '@/components/motion';
import { shadows } from '@/theme/shadows';
import { DURATION } from '@/theme/motion';
import { usePhrasebook } from '@/store';
import { getPhrases } from '@/mocks/api';
import type { Phrase, PhraseCategory } from '@/mocks/types';

/**
 * Phrasebook — get the traveller through the consultation when the doctor's
 * English runs out.
 *
 * README.md §11. Three categories of ready-made phrases; tapping one covers the
 * whole screen in `blue` so the phone can simply be handed to the doctor or the
 * pharmacist. Content (English / Hindi / transliteration) is final and comes
 * from `getPhrases`.
 */

/** Pill order is fixed by README.md §11 — Symptoms · Allergies · Payment. */
const CATEGORIES: PhraseCategory[] = ['Symptoms', 'Allergies', 'Payment'];

export default function PhrasebookScreen() {
  // The chosen category survives navigation (store); the phrase being shown
  // full-screen does not — leaving the screen must never leave the overlay armed.
  const category = usePhrasebook((s) => s.category);
  const setCategory = usePhrasebook((s) => s.setCategory);

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [shown, setShown] = useState<Phrase | null>(null);

  useEffect(() => {
    // Guard against an out-of-order resolve when categories are tapped quickly.
    let live = true;
    getPhrases(category).then((next) => {
      if (live) setPhrases(next);
    });
    return () => {
      live = false;
    };
  }, [category]);

  // With the overlay up, Android's back gesture should dismiss it rather than
  // pop the screen out from under a doctor who is mid-read.
  useEffect(() => {
    if (!shown) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setShown(null);
      return true;
    });
    return () => sub.remove();
  }, [shown]);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 58, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-screen">
          {/* Header + helper */}
          <Rise duration={DURATION.riseBase}>
            <ScreenHeader title="Say it in Hindi" />
            <Txt variant="bodyXs" className="mt-[10px] text-muted-2">
              Tap a phrase to show it full-screen to your doctor or pharmacist.
            </Txt>
          </Rise>

          {/* Category filter */}
          <Rise delay={40} duration={DURATION.riseBase}>
            <View className="mt-4 flex-row gap-2">
              {CATEGORIES.map((name) => (
                <Pill
                  key={name}
                  label={name}
                  active={name === category}
                  onPress={() => setCategory(name)}
                />
              ))}
            </View>
          </Rise>

          {/* Phrase cards. Keying on the category as well as the id remounts the
              list when the filter changes, so the new set enters rather than
              swapping in place. */}
          <View className="mt-[18px] gap-[10px]">
            {phrases.map((phrase, index) => (
              <Rise key={`${category}-${phrase.id}`} delay={index * 40} duration={350}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Show "${phrase.en}" full screen to the doctor`}
                  accessibilityHint={`In Hindi: ${phrase.translit}`}
                  onPress={() => setShown(phrase)}
                  style={({ pressed }) => (pressed ? shadows.phraseRaised : undefined)}
                  className="rounded-panel border border-line bg-surface p-4 active:border-blue-border"
                >
                  <Txt variant="bodyMl" className="font-geist-600">
                    {phrase.en}
                  </Txt>
                  <Txt variant="hindiCard" className="mt-[11px] text-blue">
                    {phrase.hi}
                  </Txt>
                  {/* Geist ships no italic face, so RN renders this upright on
                      Android. A real italic is the fix, not a fake-oblique hack. */}
                  <Txt variant="labelSm" className="mt-[6px] italic text-muted-2">
                    {phrase.translit}
                  </Txt>
                </Pressable>
              </Rise>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── Show-to-doctor overlay ──────────────────────────────────────────
          Covers the whole viewport in `blue` — the phone is being handed over,
          so nothing of the app should read as tappable chrome.

          TODO(production): while this is open, force screen brightness to
          maximum (expo-brightness), hold a wake lock so the display never
          sleeps mid-sentence (expo-keep-awake), and offer text-to-speech
          playback of the Hindi (expo-speech) for the doctor who would rather
          hear it than read it. */}
      {shown ? (
        <Pop
          duration={300}
          accessibilityViewIsModal
          className="absolute inset-0 z-20 bg-blue px-[28px] pb-[40px] pt-[70px]"
        >
          <StatusBar style="light" />
          <Txt variant="overline" className="text-white/[0.6]">
            Show this to the doctor
          </Txt>
          <View className="flex-1 justify-center">
            <Txt variant="hindiFull" className="text-on-night">
              {shown.hi}
            </Txt>
            <Txt variant="bodyMd" className="mt-[22px] text-white/[0.72]">
              {shown.en}
            </Txt>
          </View>
          <Button
            label="Done"
            variant="dark"
            className="bg-white/[0.16]"
            onPress={() => setShown(null)}
          />
        </Pop>
      ) : null}
    </View>
  );
}

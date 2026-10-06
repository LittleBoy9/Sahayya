import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import {
  Hospital,
  Languages,
  ReceiptIndianRupee,
  ShieldCheck,
  Siren,
} from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { PrototypeNotice } from '@/components/PrototypeNotice';
import { Gradient } from '@/components/Gradient';
import { useTrip } from '@/store';
import { PulsingDot } from '@/components/PulsingDot';
import { Pop, Rise, SlideIn } from '@/components/motion';
import { shadows } from '@/theme/shadows';
import { DURATION } from '@/theme/motion';
import { getNearbyProviders, getSession } from '@/mocks/api';
import type { Coordinator, Provider, Trip, Traveller } from '@/mocks/types';

/**
 * Home — the context-aware entry point.
 *
 * Tells the traveller where they are and what is around them, then offers one
 * enormous escape hatch. Layout follows README.md §2 top to bottom.
 */

const TILES = [
  {
    id: 'clinic',
    href: '/care',
    title: 'Find a clinic',
    sub: 'Filter by language & price',
    well: 'bg-blue-tint',
    icon: Hospital,
    tint: '#0B5FFF',
  },
  {
    id: 'cost',
    href: '/cost',
    title: 'What will it cost?',
    sub: 'Real prices, before you go',
    well: 'bg-green-tint',
    icon: ReceiptIndianRupee,
    tint: '#0FA958',
  },
  {
    id: 'insurance',
    href: '/insurance',
    title: 'Insurance & claims',
    sub: 'Cashless approved',
    well: 'bg-amber-tint',
    icon: ShieldCheck,
    tint: '#F0A020',
  },
  {
    id: 'phrasebook',
    href: '/phrasebook',
    title: 'Talk to the doctor',
    sub: 'Hindi phrases, spoken',
    well: 'bg-violet-tint',
    icon: Languages,
    tint: '#6B4DE0',
  },
] as const;

/** Carousel status tag colours, keyed by tag type. */
const TAG_STYLE: Record<Provider['tag'], { well: string; text: string }> = {
  Verified: { well: 'bg-blue-tint', text: 'text-blue' },
  'Open now': { well: 'bg-green-tint', text: 'text-green' },
  Cashless: { well: 'bg-amber-tint', text: 'text-amber-deep' },
};

export default function HomeScreen() {
  const router = useRouter();
  const onboarded = useTrip((s) => s.onboarded);
  const [session, setSession] = useState<{
    traveller: Traveller;
    trip: Trip;
    coordinator: Coordinator;
    greeting: string;
  } | null>(null);
  const [nearby, setNearby] = useState<Provider[]>([]);

  useEffect(() => {
    getSession().then(setSession);
    getNearbyProviders().then(setNearby);
  }, []);

  // The arrival flow is the app's entry point until it has been completed or skipped.
  if (!onboarded) return <Redirect href="/onboarding/0" />;

  if (!session) return <View className="flex-1 bg-bg" />;

  const { traveller, trip, coordinator, greeting } = session;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: 62, paddingBottom: 108 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen">
        {/* Remove with the prototype notice before any real release. */}
        <PrototypeNotice className="mb-4 self-start" />

        {/* Greeting */}
        <Rise duration={DURATION.riseBase}>
          <View className="flex-row items-start justify-between">
            <View>
              <Txt variant="labelSm" className="text-muted-2">
                {greeting}
              </Txt>
              <Txt variant="cardHeroLg" className="mt-[3px]">
                {traveller.firstName}
              </Txt>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open medical profile"
              hitSlop={8}
              onPress={() => router.push('/profile')}
              className="h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface"
            >
              <Txt variant="body" className="font-figtree-700 text-blue">
                {traveller.initials}
              </Txt>
            </Pressable>
          </View>
        </Rise>

        {/* Location strip */}
        <Rise delay={40} duration={DURATION.riseBase}>
          <View className="mt-4 flex-row items-center gap-2 rounded-card border border-line bg-surface px-3 py-[10px]">
            <PulsingDot size={7} className="bg-green" />
            <Txt variant="labelSm" className="text-body-strong">
              {trip.neighbourhood} · {trip.providersNearby} verified providers around you
            </Txt>
            <View className="flex-1" />
            <Txt variant="metaLg" className="font-geist-600 text-blue">
              Day {trip.dayOfTrip} of {trip.tripLength}
            </Txt>
          </View>
        </Rise>

        {/* Emergency button — the largest element on the screen */}
        <Pop delay={60} duration={DURATION.popSlow} className="mt-[18px]">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I need help now. A coordinator answers in under 60 seconds."
            onPress={() => router.push('/triage')}
            className="overflow-hidden rounded-panel-lg active:translate-y-[1px]"
            style={shadows.emergency}
          >
            <Gradient angle={135} colors={['#FF6B57', '#E23B26']} style={{ padding: 22 }}>
              {/* 150px white-at-13% circle bleeding off the top-right */}
              <View className="absolute -right-[30px] -top-[40px] h-[150px] w-[150px] rounded-full bg-white/[0.13]" />
              <View className="flex-row items-center gap-[14px]">
                <View className="h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/[0.18]">
                  <Siren size={24} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Txt variant="cardTitleXl" className="text-on-night">
                    I need help now
                  </Txt>
                  <Txt variant="labelSm" className="mt-[3px] text-white/[0.86]">
                    A coordinator answers in under 60 seconds
                  </Txt>
                </View>
              </View>
            </Gradient>
          </Pressable>
        </Pop>

        {/* Four tiles, 2×2 */}
        <Rise delay={100} duration={DURATION.riseBase}>
          <View className="mt-[10px] flex-row flex-wrap gap-[10px]">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <Pressable
                  key={tile.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${tile.title}. ${tile.sub}`}
                  onPress={() => router.push(tile.href)}
                  style={{ width: '48.4%' }}
                  className="rounded-panel border border-line bg-surface px-[14px] pb-4 pt-[15px]"
                >
                  <View
                    className={`mb-6 h-[30px] w-[30px] items-center justify-center rounded-chip ${tile.well}`}
                  >
                    <Icon size={16} color={tile.tint} strokeWidth={2.2} />
                  </View>
                  <Txt variant="body" className="font-geist-600">
                    {tile.title}
                  </Txt>
                  <Txt variant="metaLg" className="mt-[3px] text-muted-2">
                    {tile.sub}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </Rise>

        {/* Section heading */}
        <View className="mt-[26px] flex-row items-baseline justify-between">
          <Txt variant="section">Nearest verified care</Txt>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/care')}>
            <Txt variant="labelSm" className="font-geist-600 text-blue">
              See all {trip.providersNearby}
            </Txt>
          </Pressable>
        </View>
      </View>

      {/* Horizontal provider carousel */}
      <SlideIn delay={140} duration={DURATION.slideSlow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 6,
            gap: 12,
          }}
        >
          {nearby.map((provider) => {
            const tag = TAG_STYLE[provider.tag];
            return (
              <Pressable
                key={provider.id}
                accessibilityRole="button"
                accessibilityLabel={`${provider.name}, ${provider.type}, ${provider.km} away`}
                onPress={() => router.push(`/provider/${provider.id}`)}
                style={{ width: 236 }}
                className="rounded-panel border border-line bg-surface p-[15px]"
              >
                <View className="flex-row items-center justify-between">
                  <View className={`rounded-tag px-[7px] py-1 ${tag.well}`}>
                    <Txt variant="overlineSm" className={tag.text}>
                      {provider.tag}
                    </Txt>
                  </View>
                  <Txt variant="meta" className="text-muted-2">
                    {provider.km}
                  </Txt>
                </View>
                <Txt variant="cardTitle" className="mt-[11px]">
                  {provider.name}
                </Txt>
                <Txt variant="meta" className="mt-1 text-muted-2">
                  {provider.type}
                </Txt>
                <View className="mt-3 flex-row flex-wrap gap-[6px]">
                  {provider.languages.map((language) => (
                    <View key={language} className="rounded-tag bg-line-soft px-2 py-1">
                      <Txt variant="metaSm" className="text-body-strong">
                        {language}
                      </Txt>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </SlideIn>

      {/* Coordinator card */}
      <View className="px-screen pt-[22px]">
        <View className="overflow-hidden rounded-panel border border-line bg-surface">
          <View className="flex-row items-center gap-[11px] border-b border-divider-soft px-[15px] py-[14px]">
            <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-blue-tint-2">
              <Txt variant="labelSm" className="font-figtree-700 text-blue">
                {coordinator.initials}
              </Txt>
            </View>
            <View className="flex-1">
              <Txt variant="bodySm" className="font-geist-600">
                {coordinator.name}
              </Txt>
              <Txt variant="metaLg" className="text-muted-2">
                {coordinator.role}
              </Txt>
            </View>
            {coordinator.online ? (
              <Txt variant="metaSm" className="font-geist-600 text-green">
                Online
              </Txt>
            ) : null}
          </View>
          <View className="flex-row">
            <Pressable
              accessibilityRole="button"
              className="flex-1 border-r border-divider-soft py-[13px]"
              onPress={() => router.push('/chat')}
            >
              <Txt variant="bodyXs" className="text-center font-geist-600 text-blue">
                Message
              </Txt>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="flex-1 py-[13px]"
              onPress={() => router.push('/call')}
            >
              <Txt variant="bodyXs" className="text-center font-geist-600 text-blue">
                Call helpline
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Check, ChevronLeft, Navigation, Phone, Star } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { OsmMap } from '@/components/OsmMap';
import { Avatar, Button, ListRow } from '@/components/ui';
import { Pop, Rise } from '@/components/motion';
import { shadows } from '@/theme/shadows';
import { DURATION, LOOP } from '@/theme/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { getCostEstimate, getDoctors, getProvider, getReviews } from '@/mocks/api';
import type { CostEstimate, Doctor, Provider, Review } from '@/mocks/types';

/**
 * Provider detail — everything needed to decide, then book.
 *
 * README.md §7. Map header → identity card pulled up over it → three tabs
 * (Overview / Costs / Reviews) → sticky book/call footer.
 *
 * The map header is OpenStreetMap raster tiles composited under the pin — see
 * OsmMap.tsx for why, and for the attribution and tile-host obligations that
 * come with it. It renders identically on iOS, Android and web, needs no API
 * key, and so has no capability check and no stand-in behind it.
 */

/** README.md §7 — the map header's fixed height, shared with the tile grid. */
const MAP_HEIGHT = 238;

/** Tight enough that the pin reads as "this building", not "this district". */
const MAP_ZOOM = 16;

const TABS = ['Overview', 'Costs', 'Reviews'] as const;
type Tab = (typeof TABS)[number];

// ─── Map pin ─────────────────────────────────────────────────────────────────

/**
 * The blue teardrop and its halo.
 *
 * README.md: 34px, `border-radius: 50% 50% 50% 2px`, rotated -45° so the square
 * corner becomes the tip pointing down at the address, over a pulsing
 * `rgba(11,95,255,.16)` disc. The halo pulse is the same opacity cycle as the
 * status dots, so it slows rather than stops under reduce-motion.
 */
function ProviderPin() {
  const reduced = useReduceMotion();
  const haloOpacity = useSharedValue(1);

  useEffect(() => {
    const cycle = reduced ? LOOP.pulseHalo * LOOP.reducedMotionFactor : LOOP.pulseHalo;

    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: cycle / 2 }),
        withTiming(1, { duration: cycle / 2 }),
      ),
      -1,
    );
  }, [haloOpacity, reduced]);

  const halo = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));

  // 34px pin + the prototype's inset:-26px halo = an 86px box.
  return (
    <View className="h-[86px] w-[86px] items-center justify-center">
      <Animated.View className="absolute inset-0 rounded-full bg-blue/[0.16]" style={halo} />
      <Pop duration={DURATION.popSlow}>
        {/* 17 = half of 34 (the three round corners); 2px squares off the tip. */}
        <View
          className="h-[34px] w-[34px] bg-blue"
          style={[
            shadows.mapPin,
            {
              borderRadius: 17,
              borderBottomLeftRadius: 2,
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      </Pop>
    </View>
  );
}

// ─── Map header ──────────────────────────────────────────────────────────────

function MapHeader({ provider }: { provider: Provider }) {
  const router = useRouter();

  /** Hands the address to whichever maps app the platform owns. */
  const openDirections = () => {
    const { latitude, longitude } = provider.coordinate;
    const label = encodeURIComponent(provider.name);
    const url =
      Platform.OS === 'ios'
        ? `maps://?daddr=${latitude},${longitude}&q=${label}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    });
  };

  return (
    <View style={{ height: MAP_HEIGHT }} className="overflow-hidden bg-line">
      {/*
        The pin rides on top of the tiles as an ordinary RN view, so its halo
        animates directly — no native annotation to re-snapshot, which is what
        the marker used to need to keep the pulse alive.
      */}
      <OsmMap
        latitude={provider.coordinate.latitude}
        longitude={provider.coordinate.longitude}
        height={MAP_HEIGHT}
        zoom={MAP_ZOOM}
        accessibilityLabel={`Map showing ${provider.name} at ${provider.address}`}
      >
        <ProviderPin />
      </OsmMap>

      {/*
        Top scrim so the floating controls stay legible over light map tiles.
        `night` (#0B1020) at the README's opacities — .34 held to 22%, gone by
        46%, then a whisper at the bottom edge.
      */}
      <LinearGradient
        colors={[
          'rgba(11,16,32,0.34)',
          'rgba(11,16,32,0.34)',
          'rgba(11,16,32,0)',
          'rgba(11,16,32,0.06)',
        ]}
        locations={[0, 0.22, 0.46, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Floating controls */}
      <View className="absolute left-0 right-0 top-[58px] flex-row items-center justify-between px-screen">
        {router.canGoBack() ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.92] active:bg-white"
          >
            <ChevronLeft size={18} color="#0C1220" />
          </Pressable>
        ) : (
          <View className="h-9 w-9" />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Directions to ${provider.name}`}
          hitSlop={8}
          onPress={openDirections}
          className="h-9 flex-row items-center gap-[6px] rounded-pill bg-white/[0.92] px-[13px] active:bg-white"
        >
          <Navigation size={13} color="#0C1220" strokeWidth={2.2} />
          <Txt variant="labelSm" className="font-geist-600">
            Directions
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Tab bodies ──────────────────────────────────────────────────────────────

function OverviewTab({ provider, doctors }: { provider: Provider; doctors: Doctor[] }) {
  const facts = [
    { key: 'Address', value: provider.address },
    { key: 'Consultation', value: provider.consult },
    { key: 'Languages', value: provider.languages.join(', ') },
    { key: 'Last audited by Sahaya', value: provider.lastAudited },
  ];

  return (
    <View>
      <View className="overflow-hidden rounded-panel border border-line bg-surface">
        {facts.map((fact, i) => (
          <ListRow
            key={fact.key}
            label={fact.key}
            value={fact.value}
            last={i === facts.length - 1}
          />
        ))}
      </View>

      <Txt variant="section" className="mb-[11px] mt-[22px]">
        English-speaking doctors
      </Txt>

      {doctors.length === 0 ? (
        <Txt variant="bodySm" className="text-muted-2">
          No named doctors listed yet. A coordinator will match you on the call.
        </Txt>
      ) : (
        <View className="gap-[9px]">
          {doctors.map((doctor) => (
            <View
              key={doctor.id}
              className="flex-row items-center gap-3 rounded-panel border border-line bg-surface p-[14px]"
            >
              <Avatar initials={doctor.initials} size={40} fontSize={13} />
              <View className="flex-1">
                <Txt variant="bodyMl" className="font-geist-600">
                  {doctor.name}
                </Txt>
                <Txt variant="meta" className="mt-[2px] text-muted-2">
                  {doctor.specialty} · {doctor.languages.join(', ')}
                </Txt>
              </View>
              <Txt variant="meta" className="font-geist-600 text-green">
                {doctor.nextSlot}
              </Txt>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CostsTab({ cost }: { cost: CostEstimate | null }) {
  const router = useRouter();

  if (!cost) return <View className="h-[120px]" />;

  return (
    <View className="rounded-panel border border-line bg-surface p-4">
      <Txt variant="meta" className="text-muted-2">
        Typical visit for your symptoms
      </Txt>
      <View className="mt-[6px] flex-row items-baseline gap-[9px]">
        <Txt variant="display">₹{cost.totalInr.toLocaleString('en-IN')}</Txt>
        <Txt variant="bodyXs" className="text-muted-2">
          ≈ ${cost.totalUsd}
        </Txt>
      </View>
      <Button
        label="See the full breakdown"
        variant="ghost"
        height={44}
        className="mt-[14px]"
        onPress={() => router.push('/cost')}
      />
    </View>
  );
}

/** Five stars, filled up to the review's rating. */
function Stars({ rating }: { rating: number }) {
  return (
    <View
      className="mt-[5px] flex-row gap-[2px]"
      accessibilityLabel={`Rated ${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        // lucide takes hex on `color`/`fill` — the one place raw hex is expected.
        <Star
          key={i}
          size={12}
          color="#F0A020"
          fill={i < rating ? '#F0A020' : 'transparent'}
          strokeWidth={2}
        />
      ))}
    </View>
  );
}

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <Txt variant="bodySm" className="text-muted-2">
        No traveller reviews yet for this provider.
      </Txt>
    );
  }

  return (
    <View className="gap-[10px]">
      {reviews.map((review) => (
        <View key={review.id} className="rounded-panel border border-line bg-surface p-[15px]">
          <View className="flex-row items-center justify-between">
            <Txt variant="bodySm" className="font-geist-600">
              {review.author}
            </Txt>
            <Txt variant="metaLg" className="text-muted-3">
              {review.when}
            </Txt>
          </View>
          <Stars rating={review.rating} />
          <Txt variant="bodySm" className="mt-[9px] text-body-strong">
            {review.body}
          </Txt>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cost, setCost] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  // Screen-local, per CLAUDE.md — nothing about the active tab needs to survive
  // a navigation away from this provider.
  const [tab, setTab] = useState<Tab>('Overview');

  useEffect(() => {
    let alive = true;
    setLoading(true);

    Promise.all([getProvider(id), getDoctors(id), getReviews(id), getCostEstimate()]).then(
      ([p, d, r, c]) => {
        if (!alive) return;
        setProvider(p ?? null);
        setDoctors(d);
        setReviews(r);
        setCost(c);
        setLoading(false);
      },
    );

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <View className="flex-1 bg-bg" />;

  // A deep link can name a provider we no longer carry. Say so rather than
  // rendering a map centred on undefined.
  if (!provider) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-screen">
        <Txt variant="cardHeroSm" className="text-center">
          We could not find that provider
        </Txt>
        <Txt variant="bodySm" className="mt-[10px] text-center text-muted-2">
          It may have been removed from the Sahaya network. A coordinator can
          suggest a verified alternative nearby.
        </Txt>
        <Button
          label="Back to search"
          variant="secondary"
          className="mt-[22px] w-full"
          onPress={() => (router.canGoBack() ? router.back() : router.push('/care'))}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <MapHeader provider={provider} />

        {/* Identity card, pulled 22px up over the map */}
        <Rise duration={DURATION.riseFast} className="-mt-[22px] px-screen">
          <View
            className="rounded-panel-lg border border-line bg-surface p-[18px]"
            style={shadows.panel}
          >
            <View className="flex-row items-center gap-[7px]">
              <View className="h-4 w-4 items-center justify-center rounded-full bg-blue">
                <Check size={10} color="#FFFFFF" strokeWidth={3.4} />
              </View>
              <Txt variant="overline" className="text-blue">
                Sahaya verified
              </Txt>
            </View>

            <Txt variant="cardHeroSm" className="mt-[10px]">
              {provider.name}
            </Txt>
            <Txt variant="bodyXs" className="mt-[5px] text-muted-2">
              {provider.type} · {provider.km} away
            </Txt>

            <View className="mt-[14px] flex-row flex-wrap gap-2">
              {provider.languages.map((language) => (
                <View key={language} className="rounded-tag bg-line-soft px-[9px] py-[5px]">
                  <Txt variant="metaLg" className="font-geist-500 text-body-strong">
                    {language}
                  </Txt>
                </View>
              ))}
            </View>
          </View>
        </Rise>

        {/* Tabs */}
        <View className="mt-[22px] flex-row gap-[22px] border-b border-line-2 px-screen">
          {TABS.map((label) => {
            const active = tab === label;
            return (
              <Pressable
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${label} tab`}
                hitSlop={8}
                onPress={() => setTab(label)}
                className={`border-b-2 pb-[11px] ${active ? 'border-blue' : 'border-transparent'}`}
              >
                <Txt
                  variant="body"
                  className={`font-geist-600 ${active ? 'text-ink' : 'text-muted-3'}`}
                >
                  {label}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        {/*
          Keying on the tab remounts <Rise>, so switching replays the 300ms
          fade-and-rise the README asks for instead of swapping content instantly.
        */}
        <Rise key={tab} duration={DURATION.tabSwitch} className="px-screen pt-[18px]">
          {tab === 'Overview' ? <OverviewTab provider={provider} doctors={doctors} /> : null}
          {tab === 'Costs' ? <CostsTab cost={cost} /> : null}
          {tab === 'Reviews' ? <ReviewsTab reviews={reviews} /> : null}
        </Rise>
      </ScrollView>

      {/* Sticky footer — the two things this screen exists to trigger */}
      <View className="absolute bottom-0 left-0 right-0 flex-row gap-[10px] border-t border-line-2 bg-bg/90 px-screen pb-[46px] pt-[14px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call the Sahaya helpline about this provider"
          onPress={() => router.push('/call')}
          className="h-[52px] w-[52px] items-center justify-center rounded-card border border-line bg-surface active:bg-line-soft"
        >
          <Phone size={19} color="#0B5FFF" strokeWidth={2.2} />
        </Pressable>
        <Button
          label="Book a visit"
          className="flex-1"
          onPress={() => router.push(`/provider/${provider.id}/book`)}
        />
      </View>
    </View>
  );
}

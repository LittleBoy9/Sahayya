import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Star } from 'lucide-react-native';

import { Txt } from '@/components/Txt';
import { Badge, Divider, Pill, ScreenHeader } from '@/components/ui';
import { Rise } from '@/components/motion';
import { SEARCH_FILTERS, useSearch, type SearchFilter } from '@/store';
import { getProviders } from '@/mocks/api';
import type { Provider } from '@/mocks/types';

/**
 * Provider search — "let the traveller do it themselves, with the filters that
 * actually matter to them". README.md §6.
 *
 * The header block (title, search field, filter pills) is pinned above the list
 * rather than scrolling with it, so the filters stay reachable however far down
 * the results the traveller has gone. Query and filters live in the search store
 * because they must survive a trip into a provider detail and back.
 */

/** Every filter is a predicate; a provider must satisfy all the active ones. */
const MATCHERS: Record<SearchFilter, (p: Provider) => boolean> = {
  'English-speaking': (p) => p.languages.includes('English'),
  'Open now': (p) => p.open,
  Cashless: (p) => p.cashless,
  // `type` is a display line ("Hospital · 24×7 emergency"), so match on substring.
  // Hospital and Clinic are deliberately ANDed like every other filter: turning
  // both on is a contradiction, and the empty state is the honest answer.
  'Under 3 km': (p) => p.distanceKm <= 3,
  Hospital: (p) => p.type.toLowerCase().includes('hospital'),
  Clinic: (p) => p.type.toLowerCase().includes('clinic'),
};

export default function SearchScreen() {
  const router = useRouter();
  const query = useSearch((s) => s.query);
  const filters = useSearch((s) => s.filters);
  const setQuery = useSearch((s) => s.setQuery);
  const toggleFilter = useSearch((s) => s.toggleFilter);

  // Null until the first load resolves — otherwise the empty state flashes.
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  // Filtering is live: every keystroke and every pill tap re-derives the list.
  // getProviders() already returns distance-sorted, which is what the meta row claims.
  const results = useMemo(() => {
    const all = providers ?? [];
    const needle = query.trim().toLowerCase();

    return all.filter(
      (p) =>
        filters.every((f) => MATCHERS[f](p)) &&
        (needle === '' || p.name.toLowerCase().includes(needle)),
    );
  }, [providers, filters, query]);

  return (
    <View className="flex-1 bg-bg">
      {/* Sticky header — title, search field, filter rail */}
      <View className="border-b border-line-2 bg-surface px-screen pb-[14px] pt-[58px]">
        <ScreenHeader title="Verified care nearby" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search hospital, clinic or lab"
          // RN takes a colour value here, not a class. This is the `muted-3` token.
          placeholderTextColor="#98A1B2"
          accessibilityLabel="Search hospital, clinic or lab"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          className={`mt-[13px] h-[44px] rounded-card border px-[14px] font-geist text-body-ml text-ink ${
            focused ? 'border-blue bg-surface' : 'border-line bg-bg'
          }`}
        />

        {/* Filter pills. The negative margin cancels the header padding so the
            rail scrolls edge to edge while its first pill still lines up at 20px. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-screen mt-[11px]"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 7 }}
        >
          {SEARCH_FILTERS.map((filter) => (
            <Pill
              key={filter}
              label={filter}
              active={filters.includes(filter)}
              onPress={() => toggleFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      <FlashList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 108 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-[10px]" />}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between pb-[14px] pt-[15px]">
            <Txt variant="labelSm" className="text-muted-2">
              {results.length} of {providers?.length ?? 0} providers
            </Txt>
            <Txt variant="labelSm" className="font-geist-600 text-blue">
              Sorted by distance
            </Txt>
          </View>
        }
        // Held back until the first load resolves, so "nothing matches" is never
        // shown for data that simply has not arrived yet.
        ListEmptyComponent={providers ? <EmptyState onCall={() => router.push('/call')} /> : null}
        renderItem={({ item }) => (
          <ProviderCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
        )}
      />
    </View>
  );
}

// ─── Provider card ───────────────────────────────────────────────────────────

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const status = provider.open ? `Open · ${provider.wait} wait` : 'Opens 8:00 am';
  const languages = provider.languages.join(' · ');

  return (
    <Rise duration={400}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${provider.name}. ${provider.type}. ${provider.km} away. ${status}. Rated ${provider.rating} from ${provider.reviewCount} traveller reviews.`}
        onPress={onPress}
        className="rounded-panel border border-line bg-surface p-4 active:border-blue-border"
      >
        {/* Identity left, distance and live status right */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Txt variant="cardTitleLg">{provider.name}</Txt>
            <Txt variant="labelSm" className="mt-1 text-muted-2">
              {provider.type}
            </Txt>
          </View>
          <View className="shrink-0 items-end">
            <Txt variant="bodySm" className="font-geist-700">
              {provider.km}
            </Txt>
            <Txt
              variant="metaLg"
              className={`mt-[3px] font-geist-500 ${provider.open ? 'text-green' : 'text-muted-3'}`}
            >
              {status}
            </Txt>
          </View>
        </View>

        <Divider className="mt-[13px]" />

        {/* Trust and price signals */}
        <View className="mt-[13px] flex-row items-center gap-[14px]">
          <View className="flex-row items-center gap-1">
            <Star size={12} color="#F0A020" fill="#F0A020" />
            <Txt variant="labelSm" className="font-geist-600">
              {provider.rating}
            </Txt>
          </View>
          <Txt variant="meta" className="text-muted-3">
            {provider.reviewCount} traveller reviews
          </Txt>
          <View className="flex-1" />
          <Badge label={provider.cashless ? 'Cashless' : 'Reimburse'} />
          <Txt variant="bodyXs" className="font-geist-600 text-body-strong">
            {provider.band}
          </Txt>
        </View>

        <Txt variant="meta" className="mt-[11px] text-muted">
          Speaks {languages}
        </Txt>
      </Pressable>
    </Rise>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onCall }: { onCall: () => void }) {
  return (
    <Rise duration={400}>
      <View className="items-center rounded-panel border border-dashed border-dash-border-2 bg-surface px-screen py-10">
        <Txt variant="cardTitle" className="text-center">
          Nothing matches those filters
        </Txt>
        <Txt variant="bodyXs" className="mt-[6px] text-center text-muted-2">
          Loosen a filter, or call the helpline and we will find someone who is open.
        </Txt>
        {/* Not the shared <Button>: README.md specifies a 13.5/600 label on this
            one, which is a size below every Button variant. hitSlop carries the
            43px box up to the 44px minimum. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call the helpline"
          hitSlop={8}
          onPress={onCall}
          className="mt-4 rounded-card bg-blue px-[18px] py-[11px] active:opacity-90"
        >
          <Txt variant="bodySm" className="font-geist-600 text-on-night">
            Call the helpline
          </Txt>
        </Pressable>
      </View>
    </Rise>
  );
}

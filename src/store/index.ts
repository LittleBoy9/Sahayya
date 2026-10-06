import { create } from 'zustand';

import { SEED_MESSAGES } from '@/mocks/content';
import type { Message, PhraseCategory, TriageResult } from '@/mocks/types';

/**
 * Local UI state.
 *
 * Only state that must survive navigation lives here. Anything scoped to a single
 * screen (the triage question index, the booking step, the upload percentage,
 * the active detail tab) stays in that screen's useState — putting it in a store
 * would just make it harder to reset.
 *
 * Server-owned data does not belong here at all; it comes from mocks/api.ts.
 */

// ─── Trip ────────────────────────────────────────────────────────────────────

interface TripState {
  /** Destination chosen during onboarding; drives the provider preload. */
  city: string;
  /**
   * False until onboarding is finished or skipped. Home redirects to
   * /onboarding/0 while this is false, which is what makes the app open on the
   * arrival flow. In production this would be persisted, not in-memory.
   */
  onboarded: boolean;
  setCity: (city: string) => void;
  completeOnboarding: () => void;
}

export const useTrip = create<TripState>((set) => ({
  city: 'New Delhi',
  onboarded: false,
  setCity: (city) => set({ city }),
  completeOnboarding: () => set({ onboarded: true }),
}));

// ─── Triage ──────────────────────────────────────────────────────────────────

interface TriageState {
  /** Option ids, in question order. */
  answers: string[];
  /** Human-readable labels, for the summary table and the coordinator brief. */
  labels: string[];
  result: TriageResult | null;
  answer: (optionId: string, label: string) => void;
  setResult: (result: TriageResult) => void;
  reset: () => void;
}

export const useTriage = create<TriageState>((set) => ({
  answers: [],
  labels: [],
  result: null,
  answer: (optionId, label) =>
    set((s) => ({ answers: [...s.answers, optionId], labels: [...s.labels, label] })),
  setResult: (result) => set({ result }),
  reset: () => set({ answers: [], labels: [], result: null }),
}));

// ─── Case chat ───────────────────────────────────────────────────────────────

interface ChatState {
  messages: Message[];
  draft: string;
  typing: boolean;
  setDraft: (draft: string) => void;
  setTyping: (typing: boolean) => void;
  append: (message: Message) => void;
}

export const useChat = create<ChatState>((set) => ({
  messages: SEED_MESSAGES,
  draft: '',
  typing: false,
  setDraft: (draft) => set({ draft }),
  setTyping: (typing) => set({ typing }),
  append: (message) => set((s) => ({ messages: [...s.messages, message] })),
}));

// ─── Provider search ─────────────────────────────────────────────────────────

export const SEARCH_FILTERS = [
  'English-speaking',
  'Open now',
  'Cashless',
  'Under 3 km',
  'Hospital',
  'Clinic',
] as const;

export type SearchFilter = (typeof SEARCH_FILTERS)[number];

interface SearchState {
  query: string;
  /** README.md: English-speaking and Open now are active by default. */
  filters: SearchFilter[];
  setQuery: (query: string) => void;
  toggleFilter: (filter: SearchFilter) => void;
}

export const useSearch = create<SearchState>((set) => ({
  query: '',
  filters: ['English-speaking', 'Open now'],
  setQuery: (query) => set({ query }),
  toggleFilter: (filter) =>
    set((s) => ({
      filters: s.filters.includes(filter)
        ? s.filters.filter((f) => f !== filter)
        : [...s.filters, filter],
    })),
}));

// ─── Booking ─────────────────────────────────────────────────────────────────

interface BookingState {
  day: string;
  slot: string;
  setDay: (day: string) => void;
  setSlot: (slot: string) => void;
}

export const useBooking = create<BookingState>((set) => ({
  day: 'Today',
  slot: '10:30',
  setDay: (day) => set({ day }),
  setSlot: (slot) => set({ slot }),
}));

// ─── Phrasebook ──────────────────────────────────────────────────────────────

interface PhrasebookState {
  category: PhraseCategory;
  setCategory: (category: PhraseCategory) => void;
}

export const usePhrasebook = create<PhrasebookState>((set) => ({
  category: 'Symptoms',
  setCategory: (category) => set({ category }),
}));

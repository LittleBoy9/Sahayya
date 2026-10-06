import {
  ALLERGY_NOTICE,
  BOOKING_DAYS,
  BOOKING_SLOTS,
  CALL_TRANSCRIPT,
  CLAIM_STEPS,
  COST_ESTIMATE,
  EMERGENCY_CONTACTS,
  ONBOARDING_STEPS,
  PHRASES,
  POLICY,
  PRESCRIPTIONS,
  PROFILE_FACTS,
  QUICK_REPLIES,
  SEED_MESSAGES,
  VISIT_RECORDS,
} from './content';
import { DOCTORS, PROVIDERS, REVIEWS } from './providers';
import { CASE_NUMBER, CITIES, COORDINATOR, GREETING, TRAVELLER, TRIP } from './session';
import { TRIAGE_QUESTIONS } from './triage';
import type {
  Doctor,
  MedicalProfile,
  Message,
  Phrase,
  PhraseCategory,
  Provider,
  Review,
} from './types';

/**
 * The seam between the app and its data.
 *
 * Everything is async and returns plain typed objects, so replacing these bodies
 * with fetch calls (or wrapping them in TanStack Query) is a change to this file
 * alone. Screens must never import from the other mocks/*.ts files directly —
 * always through here — so that when the seam moves, nothing above it does.
 *
 * README.md lists the endpoints these become: provider list with distance and
 * live open/wait status, provider detail with doctors and audited prices, triage
 * submission returning a severity band, the case thread, slot availability,
 * policy lookup, claim upload with OCR, medical profile, visit records, FX rate.
 */

/** Small delay so loading states are exercised rather than skipped. */
const latency = <T,>(value: T, ms = 0): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── Session ─────────────────────────────────────────────────────────────────

export async function getSession() {
  return latency({
    traveller: TRAVELLER,
    trip: TRIP,
    coordinator: COORDINATOR,
    greeting: GREETING,
    caseNumber: CASE_NUMBER,
  });
}

export async function getCities() {
  return latency(CITIES);
}

export async function getOnboardingSteps() {
  return latency(ONBOARDING_STEPS);
}

// ─── Providers ───────────────────────────────────────────────────────────────

/** GET /providers — sorted by distance, as the search meta row claims. */
export async function getProviders(): Promise<Provider[]> {
  return latency([...PROVIDERS].sort((a, b) => a.distanceKm - b.distanceKm));
}

/** The three shown in the Home carousel. */
export async function getNearbyProviders(): Promise<Provider[]> {
  const all = await getProviders();
  return all.slice(0, 3);
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  return latency(PROVIDERS.find((p) => p.id === id));
}

export async function getDoctors(providerId: string): Promise<Doctor[]> {
  return latency(DOCTORS.filter((d) => d.providerId === providerId));
}

export async function getReviews(providerId: string): Promise<Review[]> {
  return latency(REVIEWS.filter((r) => r.providerId === providerId));
}

// ─── Triage ──────────────────────────────────────────────────────────────────

export async function getTriageQuestions() {
  return latency(TRIAGE_QUESTIONS);
}

// ─── Call & chat ─────────────────────────────────────────────────────────────

export async function getCallTranscript() {
  return latency(CALL_TRANSCRIPT);
}

export async function getMessages(): Promise<Message[]> {
  return latency(SEED_MESSAGES);
}

export async function getQuickReplies() {
  return latency(QUICK_REPLIES);
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export async function getAvailability() {
  return latency({ days: BOOKING_DAYS, slots: BOOKING_SLOTS });
}

// ─── Cost ────────────────────────────────────────────────────────────────────

export async function getCostEstimate() {
  return latency(COST_ESTIMATE);
}

// ─── Insurance ───────────────────────────────────────────────────────────────

export async function getPolicy() {
  return latency(POLICY);
}

export async function getClaimSteps() {
  return latency(CLAIM_STEPS);
}

// ─── Phrasebook ──────────────────────────────────────────────────────────────

export async function getPhrases(category?: PhraseCategory): Promise<Phrase[]> {
  return latency(category ? PHRASES.filter((p) => p.category === category) : PHRASES);
}

// ─── Profile & records ───────────────────────────────────────────────────────

export async function getMedicalProfile(): Promise<MedicalProfile> {
  return latency({
    traveller: TRAVELLER,
    facts: PROFILE_FACTS,
    allergyNotice: ALLERGY_NOTICE,
    contacts: EMERGENCY_CONTACTS,
  });
}

export async function getVisitRecords() {
  return latency(VISIT_RECORDS);
}

export async function getPrescriptions() {
  return latency(PRESCRIPTIONS);
}

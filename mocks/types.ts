/**
 * The data contract for the whole app.
 *
 * Screens and stores import these types only — never a concrete mock object. When
 * a real backend arrives, the fixtures in this directory are replaced and the
 * async functions in mocks/api.ts become network calls; nothing in src/ changes.
 *
 * README.md "Data model sketch":
 *   Trip → Case → Message[], Booking, Claim, VisitRecord
 *   Provider and Doctor are reference data. MedicalProfile hangs off the user.
 */

// ─── Reference data ──────────────────────────────────────────────────────────

export type PriceBand = '₹' | '₹₹' | '₹₹₹';

export type ProviderTag = 'Verified' | 'Open now' | 'Cashless';

export interface Provider {
  id: string;
  name: string;
  /** Display line, e.g. "Hospital · 24×7 emergency". */
  type: string;
  /** Pre-formatted for the prototype. A real API returns metres and we format. */
  km: string;
  distanceKm: number;
  tag: ProviderTag;
  languages: string[];
  rating: number;
  reviewCount: number;
  band: PriceBand;
  cashless: boolean;
  open: boolean;
  /** "12 min", or null when closed. */
  wait: string | null;
  address: string;
  /** Pre-formatted consultation fee, e.g. "₹1,200". */
  consult: string;
  coordinate: { latitude: number; longitude: number };
  lastAudited: string;
}

export interface Doctor {
  id: string;
  providerId: string;
  name: string;
  initials: string;
  specialty: string;
  languages: string[];
  /** "10:30 today" */
  nextSlot: string;
}

export interface Review {
  id: string;
  providerId: string;
  /** "Marco, Italy" */
  author: string;
  /** Relative, e.g. "2 weeks ago". */
  when: string;
  /** 0–5, rendered as stars. */
  rating: number;
  body: string;
}

// ─── Trip and case ───────────────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  providerCount: number;
}

export interface Trip {
  id: string;
  city: string;
  /** "Near Hauz Khas" */
  neighbourhood: string;
  dayOfTrip: number;
  tripLength: number;
  providersNearby: number;
}

export interface Coordinator {
  id: string;
  name: string;
  initials: string;
  /** "Your case coordinator · Delhi NCR" */
  role: string;
  region: string;
  online: boolean;
}

export interface Traveller {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  age: number;
  nationality: string;
  passport: string;
}

// ─── Triage ──────────────────────────────────────────────────────────────────

/** Well tint / icon colour token names, resolved to icons in the screen. */
export interface TriageOption {
  id: string;
  label: string;
  sub: string;
  /** Tailwind token names, not hex — see tailwind.config.js. */
  wellClass: string;
  iconClass: string;
  iconName: string;
}

export interface TriageQuestion {
  id: string;
  kicker: string;
  question: string;
  help: string;
  options: TriageOption[];
}

export type SeverityBand = 'emergency' | 'urgent' | 'sameDay' | 'routine';

export interface TriageResult {
  band: SeverityBand;
  /** "URGENT CARE RECOMMENDED" */
  overline: string;
  /** "See a doctor within the next 2 hours" */
  headline: string;
  explanation: string;
  /** "Hospital, same day" */
  suggestedCare: string;
}

// ─── Case chat ───────────────────────────────────────────────────────────────

export type MessageAuthor = 'coordinator' | 'traveller';

/**
 * Structured message payloads. README.md is explicit that the backend should send
 * typed payloads rather than markup, so the renderer switches on `kind`.
 */
export type Message =
  | {
      id: string;
      kind: 'text';
      author: MessageAuthor;
      text: string;
      time: string;
    }
  | {
      id: string;
      kind: 'appointment';
      author: MessageAuthor;
      time: string;
      providerId: string;
      /** "Ashoka Multispeciality · 10:30 · Dr. A. Menon" */
      summary: string;
    };

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface BookingSlot {
  id: string;
  label: string;
}

export interface BookingDay {
  id: string;
  label: string;
}

// ─── Cost ────────────────────────────────────────────────────────────────────

export interface CostLine {
  id: string;
  label: string;
  amountInr: number;
  amountUsd: number;
  /** Share of the total, 0–1, drives the bar width. */
  share: number;
}

export interface CostEstimate {
  providerId: string;
  totalInr: number;
  totalUsd: number;
  coveragePercent: number;
  youPayInr: number;
  lines: CostLine[];
  provenance: string;
  /** Date the FX rate was fetched — README wants this visible on tap. */
  fxDate: string;
}

// ─── Insurance ───────────────────────────────────────────────────────────────

export interface Policy {
  id: string;
  insurer: string;
  policyNumber: string;
  validUntil: string;
  active: boolean;
}

export type ClaimStepState = 'done' | 'active' | 'pending';

export interface ClaimStep {
  id: string;
  label: string;
  state: ClaimStepState;
}

export type UploadState = 'idle' | 'busy' | 'done';

// ─── Phrasebook ──────────────────────────────────────────────────────────────

export type PhraseCategory = 'Symptoms' | 'Allergies' | 'Payment';

export interface Phrase {
  id: string;
  category: PhraseCategory;
  en: string;
  hi: string;
  /** Romanised transliteration, rendered italic. */
  translit: string;
}

// ─── Medical profile ─────────────────────────────────────────────────────────

export interface ProfileFact {
  id: string;
  key: string;
  value: string;
  /** Drives the red allergy notice. */
  critical?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  initials: string;
  /** Relation or phone number. */
  detail: string;
  phone: string;
}

export interface MedicalProfile {
  traveller: Traveller;
  facts: ProfileFact[];
  allergyNotice: string;
  contacts: EmergencyContact[];
}

// ─── Records ─────────────────────────────────────────────────────────────────

export interface VisitRecord {
  id: string;
  date: string;
  providerName: string;
  doctorName: string;
  diagnosis: string;
  /** "₹6,040 · covered" */
  cost: string;
}

export interface Prescription {
  id: string;
  drug: string;
  dose: string;
}

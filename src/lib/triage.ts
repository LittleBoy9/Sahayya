import type { SeverityBand, TriageResult } from '@/mocks/types';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️  CLINICAL STUB — ILLUSTRATIVE ONLY. NOT FOR PATIENT USE.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TODO(clinical-review): This mapping was written to make the prototype
 * navigable. It has NOT been reviewed by a clinician and must not ship in a
 * product that real travellers rely on.
 *
 * README.md is explicit about this:
 *   "Real triage must map answer combinations to severity bands — and the
 *    'send an ambulance' answer must short-circuit the remaining questions and
 *    dispatch immediately. Have this reviewed by a clinician before launch; do
 *    not ship an algorithm invented by a designer or a model."
 *
 * Before launch this needs, at minimum:
 *   - a clinician-authored decision table with a documented evidence base
 *   - a documented escalation path and a named clinical owner
 *   - a bias toward over-triage: the cost of under-calling a sepsis or a cardiac
 *     event is not symmetric with the cost of an unnecessary hospital visit
 *   - audit logging of every triage decision and its inputs
 *   - a server-side implementation, so the logic can be corrected without an
 *     app release
 *
 * Severity is derived in this one file so that replacing it is a single change.
 * No screen may infer severity from raw answers.
 */

/** Answer ids from mocks/triage.ts, in question order. */
export type TriageAnswers = [complaint?: string, duration?: string, mobility?: string];

/**
 * True when the answer requires immediate dispatch and the remaining questions
 * must be skipped. README.md calls this out as a hard requirement.
 */
export function isImmediateDispatch(optionId: string): boolean {
  return optionId === 'ambulance';
}

const RESULTS: Record<SeverityBand, Omit<TriageResult, 'band'>> = {
  emergency: {
    overline: 'Emergency — ambulance dispatching',
    headline: 'Stay where you are. Help is on the way.',
    explanation:
      'A coordinator is dispatching an ambulance to your location now and will stay on the line with you until it arrives. Do not travel yourself.',
    suggestedCare: 'Ambulance, immediate',
  },
  urgent: {
    overline: 'Urgent care recommended',
    headline: 'See a doctor within the next 2 hours',
    explanation:
      'Fever above 39°C with abdominal pain for three days needs blood work the same day. This is common and treatable in Delhi, but it should not wait until tomorrow.',
    suggestedCare: 'Hospital, same day',
  },
  sameDay: {
    overline: 'Same-day visit recommended',
    headline: 'See a doctor today',
    explanation:
      'What you have described should be looked at today rather than left overnight. A coordinator can book you into a clinic near you within the hour.',
    suggestedCare: 'Clinic, same day',
  },
  routine: {
    overline: 'Routine appointment',
    headline: 'Book a visit in the next day or two',
    explanation:
      'This does not look like it needs emergency care. A coordinator can find you a clinic that speaks your language and confirm what it will cost before you go.',
    suggestedCare: 'Clinic, next available',
  },
};

/**
 * ⚠️ STUB. Maps triage answers to a severity band.
 *
 * The rules below are deliberately simple and conservative — they escalate
 * readily and never de-escalate on thin evidence — but they are a placeholder
 * for a clinical decision table, not an approximation of one.
 */
export function computeSeverity(answers: TriageAnswers): TriageResult {
  const [complaint, duration, mobility] = answers;

  let band: SeverityBand;

  if (mobility === 'ambulance') {
    // Cannot walk or speak normally — dispatch, regardless of anything else.
    band = 'emergency';
  } else if (complaint === 'breathing') {
    // Chest and breathing complaints escalate on principle.
    band = 'urgent';
  } else if (complaint === 'fever' && duration !== 'hours') {
    band = 'urgent';
  } else if (mobility === 'assisted') {
    band = 'urgent';
  } else if (complaint === 'injury' || duration === 'days') {
    band = 'sameDay';
  } else if (duration === 'week') {
    band = 'routine';
  } else {
    band = 'sameDay';
  }

  return { band, ...RESULTS[band] };
}

/** Whether the result screen should use the red urgent treatment. */
export function isUrgentBand(band: SeverityBand): boolean {
  return band === 'emergency' || band === 'urgent';
}

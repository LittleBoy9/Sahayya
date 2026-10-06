import type {
  BookingDay,
  BookingSlot,
  ClaimStep,
  CostEstimate,
  EmergencyContact,
  Message,
  Phrase,
  Policy,
  Prescription,
  ProfileFact,
  VisitRecord,
} from './types';

/**
 * ⚠️  INVENTED DATA — NOT FOR PRODUCTION.
 *
 * Copy is final per README.md; the records themselves are fictional. The medical
 * profile in particular is sample data — in production every field here is
 * sensitive personal health data subject to India's DPDP Act, needs field-level
 * encryption, and must never be bundled into the app.
 */

// ─── Case chat ───────────────────────────────────────────────────────────────

export const SEED_MESSAGES: Message[] = [
  {
    id: 'm1',
    kind: 'text',
    author: 'coordinator',
    time: '09:38',
    text: 'Hi Elena — Rhea here, your Sahaya coordinator in Delhi. I have your triage answers. How are you feeling now?',
  },
  {
    id: 'm2',
    kind: 'text',
    author: 'traveller',
    time: '09:39',
    text: 'Fever is still around 39. I can walk but I am worried about the pain on my right side.',
  },
  {
    id: 'm3',
    kind: 'text',
    author: 'coordinator',
    time: '09:40',
    text: 'Understood. Right-side pain with fever needs blood work today. I am holding a 10:30 slot at Ashoka Multispeciality — Dr. Menon speaks fluent English and has treated many travellers.',
  },
  {
    id: 'm4',
    kind: 'appointment',
    author: 'coordinator',
    time: '09:40',
    providerId: 'ashoka',
    summary: 'Ashoka Multispeciality · 10:30 · Dr. A. Menon',
  },
];

export const QUICK_REPLIES = [
  'Where exactly is it?',
  'Is it cashless?',
  'Can you send a car?',
];

/** Prototype scaffolding — replace with real messaging (Supabase Realtime or a websocket). */
export const CANNED_REPLY =
  'Noted — I have added that to your case file and told the clinic ahead of your visit.';

// ─── Helpline call ───────────────────────────────────────────────────────────

export const CALL_TRANSCRIPT = [
  { id: 't1', speaker: 'Rhea:', text: 'I can see your triage answers, Elena. Are you able to get to Saket?' },
  { id: 't2', speaker: 'You:', text: 'Yes, I can take a taxi.' },
  { id: 't3', speaker: 'Rhea:', text: 'Booking you at Ashoka Multispeciality for 10:30. Dr. Menon speaks English.' },
  { id: 't4', speaker: 'Rhea:', text: 'Cashless is approved on your policy — you pay nothing at reception.' },
];

// ─── Booking ─────────────────────────────────────────────────────────────────

export const BOOKING_DAYS: BookingDay[] = [
  { id: 'today', label: 'Today' },
  { id: 'wed', label: 'Wed 19' },
  { id: 'thu', label: 'Thu 20' },
];

export const BOOKING_SLOTS: BookingSlot[] = [
  { id: '0945', label: '09:45' },
  { id: '1030', label: '10:30' },
  { id: '1115', label: '11:15' },
  { id: '1200', label: '12:00' },
  { id: '1430', label: '14:30' },
  { id: '1600', label: '16:00' },
];

// ─── Cost ────────────────────────────────────────────────────────────────────

export const COST_ESTIMATE: CostEstimate = {
  providerId: 'ashoka',
  totalInr: 6040,
  totalUsd: 69,
  coveragePercent: 100,
  youPayInr: 0,
  fxDate: '18 August 2026',
  provenance:
    'These are the audited rates Sahaya negotiated with this hospital in March 2026. If the bill differs by more than 10%, we dispute it for you.',
  lines: [
    { id: 'consult', label: 'Consultation — general physician', amountInr: 1200, amountUsd: 14, share: 0.22 },
    { id: 'bloods', label: 'Blood panel (CBC, CRP, malaria, dengue)', amountInr: 2400, amountUsd: 28, share: 0.44 },
    { id: 'ultrasound', label: 'Abdominal ultrasound', amountInr: 1800, amountUsd: 21, share: 0.33 },
    { id: 'pharmacy', label: 'Pharmacy — 5 day course', amountInr: 640, amountUsd: 7, share: 0.12 },
  ],
};

// ─── Insurance ───────────────────────────────────────────────────────────────

export const POLICY: Policy = {
  id: 'iberia',
  insurer: 'Iberia Assist Global',
  policyNumber: 'IA-882 4417 09',
  validUntil: '02 Sep 2026',
  active: true,
};

export const UPLOAD_FILENAME = 'ashoka-invoice.pdf';
export const UPLOAD_RESULT = '4 items read · ₹6,040 matched your estimate';

/** Step states are derived from the upload state in the screen. */
export const CLAIM_STEPS: Omit<ClaimStep, 'state'>[] = [
  { id: 'received', label: 'Documents received' },
  { id: 'review', label: 'Sahaya review' },
  { id: 'decision', label: 'Insurer decision' },
  { id: 'paid', label: 'Paid direct to hospital' },
];

// ─── Phrasebook ──────────────────────────────────────────────────────────────

export const PHRASES: Phrase[] = [
  {
    id: 'fever',
    category: 'Symptoms',
    en: 'I have had a fever for three days.',
    hi: 'मुझे तीन दिन से बुखार है।',
    translit: 'Mujhe teen din se bukhaar hai.',
  },
  {
    id: 'pain',
    category: 'Symptoms',
    en: 'It hurts here, on the right side.',
    hi: 'यहाँ दर्द है, दाईं तरफ।',
    translit: 'Yahaan dard hai, daayin taraf.',
  },
  {
    id: 'dizzy',
    category: 'Symptoms',
    en: 'I feel dizzy when I stand up.',
    hi: 'खड़े होने पर चक्कर आता है।',
    translit: 'Khade hone par chakkar aata hai.',
  },
  {
    id: 'penicillin',
    category: 'Allergies',
    en: 'I am allergic to penicillin.',
    hi: 'मुझे पेनिसिलिन से एलर्जी है।',
    translit: 'Mujhe penicillin se allergy hai.',
  },
  {
    id: 'injection',
    category: 'Allergies',
    en: 'Please check before giving any injection.',
    hi: 'कोई इंजेक्शन देने से पहले जाँच लें।',
    translit: 'Koi injection dene se pehle jaanch len.',
  },
  {
    id: 'insurance',
    category: 'Payment',
    en: 'My insurance covers this. Here is my card.',
    hi: 'मेरा बीमा यह कवर करता है। यह मेरा कार्ड है।',
    translit: 'Mera bima yah cover karta hai. Yah mera card hai.',
  },
  {
    id: 'receipt',
    category: 'Payment',
    en: 'Can I have an itemised receipt?',
    hi: 'कृपया विस्तृत रसीद दें।',
    translit: 'Kripya vistrit raseed den.',
  },
];

export const PHRASE_CATEGORIES = ['Symptoms', 'Allergies', 'Payment'] as const;

// ─── Medical profile ─────────────────────────────────────────────────────────

export const PROFILE_FACTS: ProfileFact[] = [
  { id: 'blood', key: 'Blood group', value: 'O positive' },
  { id: 'allergies', key: 'Allergies', value: 'Penicillin, shellfish', critical: true },
  { id: 'conditions', key: 'Conditions', value: 'Asthma (mild, exercise-induced)' },
  { id: 'medication', key: 'Daily medication', value: 'Salbutamol inhaler as needed' },
  { id: 'vaccinations', key: 'Vaccinations', value: 'Typhoid, Hep A, Tetanus 2025' },
];

export const ALLERGY_NOTICE =
  'Penicillin allergy is flagged to every provider we book for you, in English and Hindi, before you arrive.';

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'daniel', name: 'Daniel Márquez', initials: 'DM', detail: 'Partner · Madrid', phone: '+34 600 000 000' },
  {
    id: 'consulate',
    name: 'Consulate of Spain, New Delhi',
    initials: 'ES',
    detail: '+91 11 4129 3000',
    phone: '+911141293000',
  },
];

// ─── Visit records ───────────────────────────────────────────────────────────

export const VISIT_RECORDS: VisitRecord[] = [
  {
    id: 'v1',
    date: '18 Aug 2026',
    providerName: 'Ashoka Multispeciality',
    doctorName: 'Dr. A. Menon',
    diagnosis: 'Suspected bacterial infection — awaiting culture',
    cost: '₹6,040 · covered',
  },
  {
    id: 'v2',
    date: '14 Aug 2026',
    providerName: 'Rosewood Care Clinic',
    doctorName: 'Dr. P. Iyer',
    diagnosis: 'Traveller’s diarrhoea, resolved',
    cost: '₹1,340 · covered',
  },
];

export const PRESCRIPTIONS: Prescription[] = [
  { id: 'azithro', drug: 'Azithromycin 500 mg', dose: '1 tablet daily · 5 days' },
  { id: 'para', drug: 'Paracetamol 650 mg', dose: 'As needed, max 4 daily' },
  { id: 'ors', drug: 'ORS sachets', dose: '2 litres daily' },
];

// ─── Onboarding ──────────────────────────────────────────────────────────────

export const ONBOARDING_STEPS = [
  {
    id: 'why',
    title: 'Falling ill far from home should not be a guessing game.',
    body: 'Sahaya connects you to hospitals and clinics we have visited, credentialled and price-checked ourselves.',
    cta: 'How it works',
  },
  {
    id: 'who',
    title: 'One number. A real person. In your language.',
    body: 'Our Delhi, Mumbai and Goa coordinators answer in under a minute, 24 hours a day, and stay on your case until you are discharged.',
    cta: 'Set up my trip',
  },
  {
    id: 'where',
    title: 'Where are you travelling?',
    body: 'We will preload verified providers, prices and your insurance details for that city.',
    cta: 'Enter Sahaya',
  },
];

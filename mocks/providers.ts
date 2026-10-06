import type { Doctor, Provider, Review } from './types';

/**
 * ⚠️  INVENTED DATA — NOT FOR PRODUCTION.
 *
 * README.md: "These names are invented for the prototype. Do not ship placeholder
 * providers." Every record below is fictional, including the ratings, wait times,
 * audited prices and the "Sahaya verified" status. Real records need credentialling,
 * a language audit and a price audit before they can appear in the UI.
 *
 * Coordinates are approximate real Delhi neighbourhood centres so the map renders
 * somewhere plausible.
 */
export const PROVIDERS: Provider[] = [
  {
    id: 'ashoka',
    name: 'Ashoka Multispeciality',
    type: 'Hospital · 24×7 emergency',
    km: '1.4 km',
    distanceKm: 1.4,
    tag: 'Verified',
    languages: ['English', 'Hindi', 'French'],
    rating: 4.8,
    reviewCount: 412,
    band: '₹₹',
    cashless: true,
    open: true,
    wait: '12 min',
    address: 'Block C, Saket, New Delhi',
    consult: '₹1,200',
    coordinate: { latitude: 28.5245, longitude: 77.2066 },
    lastAudited: 'March 2026',
  },
  {
    id: 'rosewood',
    name: 'Rosewood Care Clinic',
    type: 'Walk-in clinic · GP + labs',
    km: '0.8 km',
    distanceKm: 0.8,
    tag: 'Open now',
    languages: ['English', 'Hindi'],
    rating: 4.6,
    reviewCount: 188,
    band: '₹',
    cashless: true,
    open: true,
    wait: '5 min',
    address: 'Hauz Khas Village, New Delhi',
    consult: '₹700',
    coordinate: { latitude: 28.5535, longitude: 77.1943 },
    lastAudited: 'March 2026',
  },
  {
    id: 'meridian',
    name: 'Meridian Diagnostics',
    type: 'Labs & imaging',
    km: '2.1 km',
    distanceKm: 2.1,
    tag: 'Cashless',
    languages: ['English', 'Hindi', 'Spanish'],
    rating: 4.7,
    reviewCount: 301,
    band: '₹₹',
    cashless: true,
    open: false,
    wait: null,
    address: 'Green Park, New Delhi',
    consult: '₹450',
    coordinate: { latitude: 28.5601, longitude: 77.2065 },
    lastAudited: 'March 2026',
  },
  {
    id: 'nirvaan',
    name: 'Nirvaan Health',
    type: 'Hospital · paediatrics',
    km: '3.6 km',
    distanceKm: 3.6,
    tag: 'Verified',
    languages: ['English', 'Hindi', 'German'],
    rating: 4.5,
    reviewCount: 96,
    band: '₹₹₹',
    cashless: false,
    open: true,
    wait: '25 min',
    address: 'Vasant Vihar, New Delhi',
    consult: '₹1,800',
    coordinate: { latitude: 28.5605, longitude: 77.1587 },
    lastAudited: 'March 2026',
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'menon',
    providerId: 'ashoka',
    name: 'Dr. A. Menon',
    initials: 'AM',
    specialty: 'Internal medicine',
    languages: ['English', 'Hindi', 'Malayalam'],
    nextSlot: '10:30 today',
  },
  {
    id: 'bhatt',
    providerId: 'ashoka',
    name: 'Dr. S. Bhatt',
    initials: 'SB',
    specialty: 'Emergency medicine',
    languages: ['English', 'Hindi'],
    nextSlot: '13:00 today',
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'marco',
    providerId: 'ashoka',
    author: 'Marco, Italy',
    when: '2 weeks ago',
    rating: 5,
    body: 'Seen in fifteen minutes. The doctor explained everything in English and the bill matched what Sahaya quoted.',
  },
  {
    id: 'yuki',
    providerId: 'ashoka',
    author: 'Yuki, Japan',
    when: '1 month ago',
    rating: 4,
    body: 'Clean, calm, and someone walked me through the insurance form. Pharmacy is in the same building.',
  },
];

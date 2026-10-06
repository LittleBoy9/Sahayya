import type { City, Coordinator, Traveller, Trip } from './types';

/**
 * ⚠️  INVENTED DATA — NOT FOR PRODUCTION.
 *
 * The signed-in traveller, their trip and their assigned coordinator. In
 * production the greeting derives from device time and a reverse-geocoded city,
 * and the trip day comes from the trip record.
 */

export const TRAVELLER: Traveller = {
  id: 'elena',
  name: 'Elena Márquez',
  firstName: 'Elena',
  initials: 'EM',
  age: 34,
  nationality: 'Spain',
  passport: 'XDA-8841',
};

export const TRIP: Trip = {
  id: 'trip-dl',
  city: 'New Delhi',
  neighbourhood: 'Near Hauz Khas',
  dayOfTrip: 4,
  tripLength: 12,
  providersNearby: 34,
};

export const COORDINATOR: Coordinator = {
  id: 'rhea',
  name: 'Rhea Kapoor',
  initials: 'RK',
  role: 'Your case coordinator · Delhi NCR',
  region: 'Delhi NCR',
  online: true,
};

export const CASE_NUMBER = 'DL-4471';

/** Onboarding step 3 destination picker. */
export const CITIES: City[] = [
  { id: 'delhi', name: 'New Delhi', providerCount: 34 },
  { id: 'mumbai', name: 'Mumbai', providerCount: 41 },
  { id: 'goa', name: 'Goa', providerCount: 19 },
  { id: 'jaipur', name: 'Jaipur', providerCount: 12 },
];

/**
 * Static greeting matching the prototype. Production derives this from device
 * time and the reverse-geocoded city — see README.md, Home screen notes.
 */
export const GREETING = 'Tuesday, 9:41 · New Delhi';

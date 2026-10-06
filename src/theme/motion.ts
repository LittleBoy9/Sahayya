import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens.
 *
 * README.md defines exactly three entrance animations for the whole app —
 * Rise, SlideIn and Pop — and asks that we reuse them rather than inventing new
 * ones. Their implementations live in src/components/motion/. This file holds the
 * shared curve and the timings so no screen hardcodes a duration.
 */

/** The single easing curve used across the app: cubic-bezier(.2, .8, .2, 1). */
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Linear, for progress bars and spinners where the curve would read as a stutter. */
export const LINEAR = Easing.linear;

export const DURATION = {
  /** Rise — 350–600ms depending on how much content is arriving. */
  riseFast: 350,
  riseBase: 450,
  riseSlow: 600,

  /** Slide-in — 340–500ms. */
  slideFast: 340,
  slideBase: 400,
  slideSlow: 500,

  /** Pop — 350–500ms. */
  popFast: 350,
  popBase: 400,
  popSlow: 500,

  /** Tab / content cross-fade on the provider detail screen. */
  tabSwitch: 300,

  /** Triage progress track. */
  progress: 450,

  /** Cost breakdown bars, scaleX 0 → 1. */
  costBar: 700,

  /** Upload progress bar width step. */
  uploadStep: 180,
} as const;

/** Distances for the two directional entrances. */
export const OFFSET = {
  rise: 14,
  slide: 26,
} as const;

/** Looping, meaning-carrying animations. These survive reduce-motion, but slow down. */
export const LOOP = {
  /** Status dots: opacity 1 → .45 → 1. */
  pulse: 2000,
  pulseUrgent: 1600,
  pulseHalo: 2400,
  /** Call rings: scale .7 → 2.1, opacity .55 → 0. */
  ring: 2600,
  ringStagger: [0, 850, 1700],
  /** Chat typing dots. */
  typingDot: 1200,
  typingDotStagger: [0, 180, 360],
  /** Upload spinner. */
  spinner: 800,
  /** OCR shimmer sweep. */
  shimmer: 1200,
  shimmerStagger: [0, 200],
  /** Multiplier applied to looping animations when reduce-motion is on. */
  reducedMotionFactor: 2,
} as const;

/** Timed state transitions driven by the prototype's logic class. */
export const TIMING = {
  /** Call mounts in `dialing`, flips to `live`. */
  callConnect: 2800,
  /** Transcript lines append one at a time. */
  callTranscriptStep: 2600,
  /** Call timer tick. */
  callTick: 1000,
  /** Chat typing indicator before the canned reply. */
  chatTyping: 1600,
  /** Claim upload progress step. */
  uploadTick: 160,
  /** Booking checkmark stroke draw + its delay. */
  checkDraw: 500,
  checkDelay: 180,
} as const;

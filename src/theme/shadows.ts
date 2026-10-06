import { Platform, type ViewStyle } from 'react-native';

/**
 * Shadow tokens.
 *
 * README.md warns that NativeWind's shadow utilities are unreliable across
 * platforms, so every shadow comes from this file via `style={shadows.x}` and is
 * never written inline in a screen.
 *
 * Each token is authored once, as the literal CSS string from the README's shadow
 * table. The two platforms disagree about how to consume it:
 *
 *   - React Native 0.76+ (New Architecture) takes `boxShadow` in CSS syntax and
 *     deprecated the shadowColor/shadowOffset/shadowRadius props in 0.86.
 *   - react-native-web went the other way and only honours the shadow* props.
 *
 * So we parse the CSS once at module load and emit whichever shape the platform
 * actually reads. Authoring stays in exact README values either way.
 */

interface ParsedShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

/** Parses `0 14px 34px rgba(226,59,38,.3)`. */
function parse(css: string): ParsedShadow {
  const match = css.match(
    /^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?\s+rgba?\(([^)]+)\)$/,
  );

  if (!match) throw new Error(`shadows.ts: could not parse "${css}"`);

  const [, x, y, blur, channels] = match;
  const parts = channels.split(',').map((c) => parseFloat(c.trim()));

  return {
    offsetX: parseFloat(x),
    offsetY: parseFloat(y),
    blur: parseFloat(blur),
    color: `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`,
    opacity: parts.length > 3 ? parts[3] : 1,
  };
}

function shadow(css: string): ViewStyle {
  if (Platform.OS !== 'web') return { boxShadow: css };

  // react-native-web path. CSS blur radius is roughly double RN's shadowRadius.
  const { offsetX, offsetY, blur, color, opacity } = parse(css);
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowRadius: blur / 2,
    shadowOpacity: opacity,
  };
}

export const shadows = {
  /** Resting card. */
  card: shadow('0 1px 2px rgba(12,18,32,.04)'),

  /** Raised card — home tiles, provider cards. */
  cardRaised: shadow('0 8px 20px rgba(12,18,32,.06)'),

  /** Raised card, stronger — search results, home carousel. */
  cardRaisedStrong: shadow('0 8px 22px rgba(12,18,32,.07)'),

  /** Elevated panel — the provider identity card over the map. */
  panel: shadow('0 8px 24px rgba(12,18,32,.06)'),

  /** Phrase card, raised. */
  phraseRaised: shadow('0 6px 18px rgba(12,18,32,.06)'),

  /** Blue primary button — onboarding CTA. */
  bluePrimary: shadow('0 8px 24px rgba(11,95,255,.36)'),

  /** Blue primary — booking confirm. */
  bluePrimarySoft: shadow('0 10px 26px rgba(11,95,255,.3)'),

  /** Blue primary — provider detail footer. */
  bluePrimaryQuiet: shadow('0 8px 22px rgba(11,95,255,.28)'),

  /** Chat appointment card. */
  blueTintCard: shadow('0 4px 14px rgba(11,95,255,.08)'),

  /** Red primary — triage "Connect me to a coordinator". */
  redPrimary: shadow('0 10px 26px rgba(226,59,38,.3)'),

  /** Home emergency button. */
  emergency: shadow('0 14px 34px rgba(226,59,38,.3)'),

  /** Call screen avatar. */
  callAvatar: shadow('0 18px 50px rgba(11,95,255,.5)'),

  /** Map pin. */
  mapPin: shadow('0 8px 20px rgba(11,95,255,.5)'),

  /** The "quiet outline" emergency variant, per the prototype's tweak prop. */
  none: shadow('0 1px 2px rgba(12,18,32,.05)'),
} satisfies Record<string, ViewStyle>;

export type ShadowToken = keyof typeof shadows;

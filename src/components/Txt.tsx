import { Text, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

import colors from '@/theme/colors';

/**
 * The app's only text component.
 *
 * Screens pick a semantic role — <Txt variant="cardTitle"> — instead of naming a
 * size, family and tracking. Every role maps to a token in tailwind.config.js,
 * which in turn comes from the type scale in README.md.
 *
 * Weight and colour compose on top via className, because the variant classes are
 * emitted first: <Txt variant="body" className="font-geist-600 text-blue">.
 * If you need a size that isn't here, add a role — don't inline an arbitrary value.
 */

export type TxtVariant =
  // ─ Display (Figtree 800) ─
  | 'hero' // onboarding headline, 38
  | 'costHero' // cost estimate figure, 40
  | 'avatarXl' // call screen initials, 34
  | 'display' // provider detail costs figure, 30
  | 'titleLg' // triage question, 29
  | 'cardHeroLg' // home greeting name, 27
  | 'cardHero' // call name, "You are booked", 26
  | 'cardHeroSm' // provider detail name, triage result, 24
  | 'profileTitle' // medical profile name, 21
  | 'title' // screen titles, 20
  | 'caseNumber' // DL-4471, 19
  // ─ Display (Figtree 700) ─
  | 'cardTitleXl' // emergency button, 19
  | 'cardTitle2xl' // insurer name, 18
  | 'cardTitleLg' // search result name, 17
  | 'recordTitle' // visit record provider, 16.5
  | 'cardTitle' // carousel provider name, 16
  | 'section' // section headings, 15.5
  | 'cardTitleSm' // chat appointment card, 15
  // ─ Body (Geist 400) ─
  | 'bodyLg' // 15.5
  | 'bodyMd' // 15
  | 'bodyMl' // 14.5
  | 'body' // 14
  | 'bodySm' // 13.5
  | 'bodyXs' // 13
  // ─ Buttons (Geist 600) ─
  | 'button' // 16
  | 'buttonSm' // 15.5
  | 'buttonXs' // 14.5
  // ─ Labels (Geist 400) ─
  | 'label' // 13
  | 'labelSm' // 12.5
  | 'labelRelaxed' // 12.5 with a 20px line height, for multi-line inset copy
  // ─ Overlines (uppercase, tracked) ─
  | 'overline' // Geist 700 / 11 / 0.09em
  | 'overlineSm' // Geist 700 / 10.5 / 0.07em
  | 'overlineLg' // Geist 600 / 11.5 / 0.07em
  | 'overlineXs' // Geist 600 / 12 / 0.07em — booking DAY/TIME labels
  // ─ Meta (Geist 400) ─
  | 'meta' // 12
  | 'metaLg' // 11.5
  | 'metaSm' // 11
  | 'metaXs' // 10.5
  // ─ Hindi (Noto Sans Devanagari) ─
  | 'hindiCard' // 400 / 19
  | 'hindiFull'; // 600 / 34

const VARIANTS: Record<TxtVariant, string> = {
  hero: 'font-figtree-800 text-hero tracking-hero',
  costHero: 'font-figtree-800 text-cost-hero tracking-cost-hero',
  avatarXl: 'font-figtree-800 text-avatar-xl',
  display: 'font-figtree-800 text-display tracking-card-hero',
  titleLg: 'font-figtree-800 text-title-lg tracking-title-lg',
  cardHeroLg: 'font-figtree-800 text-card-hero-lg tracking-card-hero',
  cardHero: 'font-figtree-800 text-card-hero tracking-card-hero',
  cardHeroSm: 'font-figtree-800 text-card-hero-sm tracking-card-hero-sm',
  profileTitle: 'font-figtree-800 text-profile-title tracking-title',
  title: 'font-figtree-800 text-title tracking-title',
  caseNumber: 'font-figtree-800 text-card-title-xl tracking-case-number',

  cardTitleXl: 'font-figtree-700 text-card-title-xl tracking-card-title',
  cardTitle2xl: 'font-figtree-700 text-card-title-2xl',
  cardTitleLg: 'font-figtree-700 text-card-title-lg tracking-card-title',
  recordTitle: 'font-figtree-700 text-record-title tracking-card-title-sm',
  cardTitle: 'font-figtree-700 text-card-title tracking-card-title-sm',
  section: 'font-figtree-700 text-section',
  cardTitleSm: 'font-figtree-700 text-card-title-sm',

  bodyLg: 'font-geist text-body-lg',
  bodyMd: 'font-geist text-body-md',
  bodyMl: 'font-geist text-body-ml',
  body: 'font-geist text-body',
  bodySm: 'font-geist text-body-sm',
  bodyXs: 'font-geist text-body-xs',

  button: 'font-geist-600 text-button',
  buttonSm: 'font-geist-600 text-button-sm',
  buttonXs: 'font-geist-600 text-button-xs',

  label: 'font-geist text-label',
  labelSm: 'font-geist text-label-sm',
  labelRelaxed: 'font-geist text-label-relaxed',

  overline: 'font-geist-700 text-overline tracking-overline-wide uppercase',
  overlineSm: 'font-geist-700 text-overline-sm tracking-overline uppercase',
  overlineLg: 'font-geist-600 text-overline-lg tracking-overline uppercase',
  overlineXs: 'font-geist-600 text-overline-xs tracking-overline uppercase',

  meta: 'font-geist text-meta',
  metaLg: 'font-geist text-meta-lg',
  metaSm: 'font-geist text-meta-sm',
  metaXs: 'font-geist text-meta-xs',

  hindiCard: 'font-deva-400 text-hindi-card',
  hindiFull: 'font-deva-600 text-hindi-full',
};

/**
 * Matches a `text-<colour>` utility, as opposed to a `text-<size>` one — both
 * share the prefix, so the only way to tell them apart is to know the palette.
 * The trailing boundary stops `text-body` matching inside `text-body-strong`.
 */
const COLOR_CLASS = new RegExp(
  `(^|\\s)text-(${[...Object.keys(colors), 'white', 'black', 'transparent'].join('|')})(\\/|\\s|$)`,
);

export interface TxtProps extends TextProps {
  variant?: TxtVariant;
  className?: string;
}

/**
 * The default colour is `ink`, but it is only applied when the caller has not
 * supplied one.
 *
 * This has to be conditional rather than a class the caller overrides. Tailwind
 * emits colour utilities in alphabetical order, so `.text-ink` lands after
 * `.text-blue`, `.text-green` and everything else sorting before "ink" — and CSS
 * resolves equal-specificity rules by document order, not by the order they
 * appear in the className string. Baking in `text-ink` unconditionally therefore
 * silently swallowed every blue and green label in the app.
 */
export function Txt({ variant = 'body', className = '', ...rest }: TxtProps) {
  const color = COLOR_CLASS.test(className) ? '' : 'text-ink';

  return <Text className={`${VARIANTS[variant]} ${color} ${className}`} {...rest} />;
}

cssInterop(Text, { className: 'style' });

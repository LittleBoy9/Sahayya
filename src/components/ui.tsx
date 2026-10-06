import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';

import { Txt } from './Txt';
import { shadows } from '@/theme/shadows';

/**
 * Shared primitives.
 *
 * Every screen composes these rather than re-deriving card borders, button
 * heights or well tints. Touch targets follow README.md: primary buttons 52–54px,
 * secondary 48–50px, small icon buttons 34–40px with hitSlop to reach 44px.
 */

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  /** Applies the resting card shadow. Off by default — most cards use a border. */
  raised?: boolean;
}

/**
 * Defaults are applied only when the caller has not supplied their own.
 *
 * Tailwind emits utilities alphabetically and CSS resolves equal-specificity
 * rules by document order, so an unconditional `bg-surface` would beat a
 * caller's `bg-night` no matter where it sat in the className string. Same trap
 * as the colour default in Txt.tsx — see the note there.
 */
export function Card({ children, className = '', raised, style, ...rest }: CardProps) {
  const fill = /(^|\s)bg-/.test(className) ? '' : 'bg-surface';
  const stroke = /(^|\s)border-(?!\d)/.test(className) ? '' : 'border-line';

  return (
    <View
      className={`rounded-panel border ${stroke} ${fill} ${className}`}
      style={[raised ? shadows.card : undefined, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  /** Height in px. Defaults to 52 for primary/danger, 50 for secondary. */
  height?: number;
  className?: string;
  icon?: LucideIcon;
}

const BUTTON_STYLE: Record<ButtonVariant, { box: string; text: string; shadow?: object }> = {
  primary: { box: 'bg-blue', text: 'text-on-night', shadow: shadows.bluePrimaryQuiet },
  danger: { box: 'bg-red', text: 'text-on-night', shadow: shadows.redPrimary },
  dark: { box: 'bg-ink', text: 'text-on-night' },
  secondary: { box: 'border border-line bg-surface', text: 'text-ink' },
  ghost: { box: 'border border-line bg-surface', text: 'text-blue' },
};

export function Button({
  label,
  variant = 'primary',
  height,
  className = '',
  icon: Icon,
  ...rest
}: ButtonProps) {
  const style = BUTTON_STYLE[variant];
  const resolvedHeight = height ?? (variant === 'secondary' || variant === 'ghost' ? 50 : 52);
  const isPrimaryText = variant === 'primary' || variant === 'danger' || variant === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-2 rounded-card active:opacity-90 ${style.box} ${className}`}
      style={[{ height: resolvedHeight }, style.shadow]}
      {...rest}
    >
      {Icon ? <Icon size={17} color={isPrimaryText ? '#FFFFFF' : '#0B5FFF'} /> : null}
      <Txt variant={resolvedHeight >= 52 ? 'button' : 'buttonSm'} className={style.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

// ─── Pill ────────────────────────────────────────────────────────────────────

interface PillProps extends Omit<PressableProps, 'children'> {
  label: string;
  active?: boolean;
  className?: string;
}

/** Filter and category pills. Active is `ink` fill with white text. */
export function Pill({ label, active, className = '', ...rest }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label}
      hitSlop={6}
      className={`rounded-pill border px-3 py-2 ${
        active ? 'border-ink bg-ink' : 'border-line bg-surface'
      } ${className}`}
      {...rest}
    >
      <Txt
        variant="labelSm"
        className={`font-geist-500 ${active ? 'text-on-night' : 'text-body-strong'}`}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string;
  /** Diameter in px. */
  size: number;
  /** Fill class, e.g. "bg-blue-tint-2". */
  className?: string;
  /** Text colour class. */
  textClassName?: string;
  /** Font size in px — Figtree 700 unless `bold` is set. */
  fontSize?: number;
  bold?: boolean;
}

export function Avatar({
  initials,
  size,
  className = 'bg-blue-tint-2',
  textClassName = 'text-blue',
  fontSize,
  bold,
}: AvatarProps) {
  return (
    <View
      className={`items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Txt
        className={`${bold ? 'font-figtree-800' : 'font-figtree-700'} ${textClassName}`}
        style={{ fontSize: fontSize ?? Math.round(size * 0.34) }}
      >
        {initials}
      </Txt>
    </View>
  );
}

// ─── IconWell ────────────────────────────────────────────────────────────────

interface IconWellProps {
  icon: LucideIcon;
  /** Well size in px — 30 on home tiles, 34 on list rows, 44 on the dropzone. */
  size?: number;
  /** Fill class, e.g. "bg-blue-tint". */
  className?: string;
  /** Icon stroke colour — a hex, since lucide takes a colour prop not a class. */
  color: string;
  /** Icon glyph size. Defaults to ~45% of the well. */
  iconSize?: number;
  /** Wells are rounded-chip (7px) at 30px, rounded-card (8px) at 34px+. */
  radiusClassName?: string;
}

export function IconWell({
  icon: Icon,
  size = 34,
  className = 'bg-blue-tint',
  color,
  iconSize,
  radiusClassName = 'rounded-card',
}: IconWellProps) {
  return (
    <View
      className={`shrink-0 items-center justify-center ${radiusClassName} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize ?? Math.round(size * 0.45)} color={color} strokeWidth={2.2} />
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  /** Fill class. */
  className?: string;
  /** Text colour class. */
  textClassName?: string;
  uppercase?: boolean;
}

export function Badge({
  label,
  className = 'bg-blue-tint',
  textClassName = 'text-blue',
  uppercase,
}: BadgeProps) {
  return (
    <View className={`self-start rounded-tag px-2 py-1 ${className}`}>
      <Txt
        variant={uppercase ? 'overlineSm' : 'metaSm'}
        className={`font-geist-600 ${textClassName}`}
      >
        {label}
      </Txt>
    </View>
  );
}

// ─── ListRow ─────────────────────────────────────────────────────────────────

interface ListRowProps {
  label: string;
  value: string;
  /** Omits the bottom divider on the final row. */
  last?: boolean;
}

/** A key/value row inside a bordered card — facts tables, medical profile. */
export function ListRow({ label, value, last }: ListRowProps) {
  return (
    <View
      className={`flex-row justify-between gap-4 px-[15px] py-[14px] ${
        last ? '' : 'border-b border-line-soft'
      }`}
    >
      <Txt variant="bodyXs" className="shrink-0 text-muted-2">
        {label}
      </Txt>
      <Txt variant="bodySm" className="flex-1 text-right font-geist-600">
        {value}
      </Txt>
    </View>
  );
}

// ─── BackButton / ScreenHeader ───────────────────────────────────────────────

export function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  if (!router.canGoBack()) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={10}
      onPress={() => router.back()}
      className={`h-[34px] w-[34px] items-center justify-center rounded-card border border-line bg-surface active:bg-press-grey ${className}`}
    >
      <ChevronLeft size={18} color="#3D4757" />
    </Pressable>
  );
}

interface ScreenHeaderProps {
  title: string;
  /** Optional right-hand slot. */
  right?: ReactNode;
}

/** Back button + screen title, the pattern on 8 of the 13 screens. */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center gap-[11px]">
      <BackButton />
      <Txt variant="title" className="flex-1">
        {title}
      </Txt>
      {right}
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-line-soft ${className}`} />;
}

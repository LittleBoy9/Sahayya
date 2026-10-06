import { useState } from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * Gradients.
 *
 * `expo-linear-gradient` takes start/end as fractions of the box, so passing
 * {0,0}→{1,1} on a wide element yields whatever angle that diagonal happens to be
 * (~102° on the home emergency button) rather than the CSS 135° the design calls
 * for. <Gradient> measures the box and solves for start/end that reproduce a real
 * CSS angle, so the token stays "135deg" as written in README.md.
 */

interface GradientProps extends ViewProps {
  /** CSS angle in degrees: 0 = to top, 90 = to right, 135 = to bottom-right. */
  angle?: number;
  colors: readonly [string, string, ...string[]];
  children?: React.ReactNode;
  className?: string;
}

export function Gradient({
  angle = 135,
  colors,
  children,
  style,
  ...rest
}: GradientProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  // CSS angle → unit direction vector (y down, matching screen space).
  const rad = (angle - 90) * (Math.PI / 180);
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);

  // Scale the vector into the box's aspect ratio so the rendered angle is the
  // CSS angle, then re-centre it on 0.5,0.5.
  const ratio = size.width > 0 && size.height > 0 ? size.width / size.height : 1;
  const vx = dx;
  const vy = dy * ratio;
  const norm = Math.max(Math.abs(vx), Math.abs(vy)) || 1;

  const start = { x: 0.5 - vx / norm / 2, y: 0.5 - vy / norm / 2 };
  const end = { x: 0.5 + vx / norm / 2, y: 0.5 + vy / norm / 2 };

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      onLayout={onLayout}
      style={style}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}

interface GlowProps {
  /** Diameter in px. */
  size: number;
  /** Centre colour, e.g. 'rgba(11,95,255,.55)'. */
  color: string;
  /** Where the colour has fully faded, 0–1. CSS `transparent 68%` → 0.68. */
  stop?: number;
  className?: string;
}

/**
 * A radial glow. RN has no radial gradient, so this is an SVG circle with a
 * radial fill — used for the onboarding corners, the call screen wash and the
 * cost hero. Position it with absolute classes on the wrapper.
 */
export function Glow({ size, color, stop = 0.7, className = '' }: GlowProps) {
  const id = `glow-${color.replace(/\W/g, '')}-${Math.round(stop * 100)}`;

  return (
    <View className={`absolute ${className}`} style={{ width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset={`${stop * 100}%`} stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { LOOP } from '@/theme/motion';

/**
 * A status dot that pulses opacity 1 → .45 → 1.
 *
 * README.md keeps the pulsing dots under reduce-motion because they carry meaning
 * (live, online, urgent) rather than decoration — they only slow down.
 */
interface PulsingDotProps {
  /** Diameter in px. The prototype uses 7px on Home, 9px on the triage result. */
  size?: number;
  /** A background colour class, e.g. "bg-green". */
  className?: string;
  /** Full cycle duration. */
  duration?: number;
}

export function PulsingDot({
  size = 7,
  className = 'bg-green',
  duration = LOOP.pulse,
}: PulsingDotProps) {
  const reduced = useReduceMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    const cycle = reduced ? duration * LOOP.reducedMotionFactor : duration;

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: cycle / 2 }),
        withTiming(1, { duration: cycle / 2 }),
      ),
      -1,
    );
  }, [duration, opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={`rounded-full ${className}`}
      style={[{ width: size, height: size }, style]}
    />
  );
}

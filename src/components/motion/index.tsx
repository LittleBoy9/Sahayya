import { useEffect, type ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { DURATION, EASE, OFFSET } from '@/theme/motion';

/**
 * The three entrance animations, and the only ones the app uses.
 *
 * README.md: "reuse these three across the app rather than inventing new ones".
 *   Rise    — translateY(14px) → 0 + opacity
 *   SlideIn — translateX(26px) → 0 + opacity
 *   Pop     — scale(.92) → 1.02 → 1 + opacity
 *
 * All three collapse to a plain opacity fade under reduce-motion.
 */

interface MotionProps extends ViewProps {
  children?: ReactNode;
  /** Milliseconds before the animation starts. Matches the prototype's stagger. */
  delay?: number;
  /** Override the default duration for this role. */
  duration?: number;
  className?: string;
}

export function Rise({
  children,
  delay = 0,
  duration = DURATION.riseBase,
  ...rest
}: MotionProps) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, [delay, duration, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduced ? [] : [{ translateY: (1 - progress.value) * OFFSET.rise }],
  }));

  return (
    <Animated.View style={style} {...rest}>
      {children}
    </Animated.View>
  );
}

export function SlideIn({
  children,
  delay = 0,
  duration = DURATION.slideBase,
  ...rest
}: MotionProps) {
  const reduced = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));
  }, [delay, duration, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduced ? [] : [{ translateX: (1 - progress.value) * OFFSET.slide }],
  }));

  return (
    <Animated.View style={style} {...rest}>
      {children}
    </Animated.View>
  );
}

export function Pop({
  children,
  delay = 0,
  duration = DURATION.popBase,
  ...rest
}: MotionProps) {
  const reduced = useReduceMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: EASE }));

    if (reduced) {
      scale.value = 1;
      return;
    }

    // 0% scale(.92) → 60% scale(1.02) → 100% scale(1)
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.02, { duration: duration * 0.6, easing: EASE }),
        withTiming(1, { duration: duration * 0.4, easing: EASE }),
      ),
    );
  }, [delay, duration, opacity, scale, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style} {...rest}>
      {children}
    </Animated.View>
  );
}

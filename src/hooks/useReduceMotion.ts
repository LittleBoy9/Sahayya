import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" setting.
 *
 * README.md: the three entrance animations collapse to a plain opacity fade when
 * this is on. The pulsing status dots and the call rings are kept — they carry
 * meaning rather than decoration — but are slowed by LOOP.reducedMotionFactor.
 */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;

    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);

    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

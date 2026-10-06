import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

/**
 * Teaches NativeWind about Reanimated's animated components.
 *
 * Without this, `className` on an <Animated.View> is silently dropped — the props
 * pass through but never become styles, so backgrounds and spacing just don't
 * apply. It fails quietly, which makes it hard to spot; register once here and
 * import this module from the root layout before anything renders.
 */
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });
cssInterop(Animated.Image, { className: 'style' });

export {};

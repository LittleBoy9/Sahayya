import { View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';

import { Txt } from './Txt';

/**
 * "This is not a real service" marker.
 *
 * The app is convincing enough to be mistaken for a working product — it shows
 * a 24/7 emergency button, a named coordinator, a medical profile and an
 * insurance policy, none of which exist. This notice sits on the three screens
 * where that misunderstanding would be most costly:
 *
 *   - Home        — the entry point, and where the emergency button lives
 *   - Call        — the screen that claims a coordinator is answering
 *   - Profile     — the screen that looks like real medical records
 *
 * REMOVE BEFORE ANY REAL RELEASE: delete this file and its three usages. It is
 * deliberately a single component so that is a one-line change per screen.
 */

interface PrototypeNoticeProps {
  /** `dark` for the night-background screens (call, onboarding). */
  tone?: 'light' | 'dark';
  className?: string;
}

export function PrototypeNotice({ tone = 'light', className = '' }: PrototypeNoticeProps) {
  const dark = tone === 'dark';

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Prototype. Sample data only, this is not a real service."
      className={`flex-row items-center gap-2 rounded-chip px-[10px] py-[6px] ${
        dark ? 'bg-white/[0.08]' : 'bg-amber-tint'
      } ${className}`}
    >
      <TriangleAlert size={13} color={dark ? '#F0A020' : '#B67A0A'} strokeWidth={2.4} />
      <Txt
        variant="metaSm"
        className={`font-geist-600 ${dark ? 'text-on-night-3' : 'text-amber-deep'}`}
      >
        Prototype · sample data, not a real service
      </Txt>
    </View>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Txt } from '@/components/Txt';
import { Avatar, Button, Card, ListRow, ScreenHeader } from '@/components/ui';
import { PrototypeNotice } from '@/components/PrototypeNotice';
import { Rise } from '@/components/motion';
import { DURATION } from '@/theme/motion';
import { getMedicalProfile } from '@/mocks/api';
import type { MedicalProfile } from '@/mocks/types';

/**
 * Medical profile — the information a doctor needs in the first thirty seconds.
 *
 * Layout follows README.md §12: identity, facts table, allergy notice, emergency
 * contacts, footer link to visit records.
 *
 * PRODUCTION NOTE — every field rendered on this screen is sensitive personal
 * health data and, under India's DPDP Act, the most sensitive table in the
 * schema. Before this ships against a real backend it needs:
 *   · field-level encryption at rest on the allergy, condition and medication
 *     fields (and in-region storage — never a US/EU bucket);
 *   · explicit, per-share consent before any of it reaches a provider — the
 *     traveller approves the disclosure, the app does not assume it;
 *   · an append-only audit log of every share: who received what, when, and
 *     under which consent grant, readable by the traveller;
 *   · offline and lock-screen availability. This profile is useless if the phone
 *     is dead or the traveller is unconscious, which is exactly when a stranger
 *     needs to read the blood group and the penicillin allergy.
 * The allergy notice below is also a promise the backend has to keep: the
 * booking payload must actually carry allergies to the provider.
 */

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    getMedicalProfile().then(setProfile);
  }, []);

  // openURL rejects when no dialer can handle the scheme (simulator, web harness).
  // Swallowing keeps a failed tap from throwing an unhandled rejection.
  const call = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => undefined);
  }, []);

  if (!profile) return <View className="flex-1 bg-bg" />;

  const { traveller, facts, allergyNotice, contacts } = profile;

  // The red panel is driven by the data, not hardcoded: it appears only while a
  // fact is flagged critical. No critical fact, no notice.
  const hasCriticalFact = facts.some((fact) => fact.critical);

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: 62, paddingBottom: 108 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen">
        <ScreenHeader title="Medical profile" />

        {/* Remove with the prototype notice before any real release. */}
        <PrototypeNotice className="mt-4 self-start" />

        {/* Identity */}
        <Rise duration={DURATION.riseFast}>
          <View className="mt-5 flex-row items-center gap-[14px]">
            <Avatar
              initials={traveller.initials}
              size={62}
              fontSize={21}
              bold
              className="bg-blue"
              textClassName="text-on-night"
            />
            <View className="flex-1">
              <Txt variant="profileTitle">{traveller.name}</Txt>
              <Txt variant="labelSm" className="mt-[3px] text-muted-2">
                {traveller.age} · {traveller.nationality} · passport {traveller.passport}
              </Txt>
            </View>
          </View>
        </Rise>

        {/* Facts table — the thirty-second summary, in the order a clinician reads it */}
        <Rise delay={60} duration={DURATION.riseBase}>
          <Card className="mt-5 overflow-hidden">
            {facts.map((fact, index) => (
              <ListRow
                key={fact.id}
                label={fact.key}
                value={fact.value}
                last={index === facts.length - 1}
              />
            ))}
          </Card>
        </Rise>

        {/* Allergy notice */}
        {hasCriticalFact ? (
          <Rise delay={100} duration={DURATION.riseBase}>
            <View className="mt-3 flex-row items-start gap-[11px] rounded-panel border border-red-border bg-red-tint px-[15px] py-[14px]">
              <View className="h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red">
                <Txt variant="meta" className="font-geist-700 text-on-night">
                  !
                </Txt>
              </View>
              <Txt variant="labelSm" className="flex-1 leading-[20px] text-red-text">
                {allergyNotice}
              </Txt>
            </View>
          </Rise>
        ) : null}

        {/* Emergency contacts — the whole row is the call target, not just the label */}
        <Rise delay={140} duration={DURATION.riseBase}>
          <Txt variant="section" className="mb-[11px] mt-[26px]">
            Emergency contacts
          </Txt>
          <View className="gap-[9px]">
            {contacts.map((contact) => (
              <Pressable
                key={contact.id}
                accessibilityRole="button"
                accessibilityLabel={`Call ${contact.name}, ${contact.detail}`}
                onPress={() => call(contact.phone)}
                className="flex-row items-center gap-3 rounded-panel border border-line bg-surface p-[14px] active:bg-bg"
              >
                <Avatar
                  initials={contact.initials}
                  size={38}
                  fontSize={12.5}
                  className="bg-line-soft"
                  textClassName="text-muted"
                />
                <View className="flex-1">
                  <Txt variant="body" className="font-geist-600">
                    {contact.name}
                  </Txt>
                  <Txt variant="meta" className="mt-[2px] text-muted-2">
                    {contact.detail}
                  </Txt>
                </View>
                <Txt variant="labelSm" className="font-geist-600 text-blue">
                  Call
                </Txt>
              </Pressable>
            ))}
          </View>
        </Rise>

        {/* Footer */}
        <Rise delay={180} duration={DURATION.riseBase}>
          <Button
            label="View my visit records"
            variant="secondary"
            height={52}
            className="mt-[22px]"
            onPress={() => router.push('/records')}
          />
        </Rise>
      </View>
    </ScrollView>
  );
}

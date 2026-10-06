import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Txt } from '@/components/Txt';
import { Button, Divider, ScreenHeader } from '@/components/ui';
import { Rise } from '@/components/motion';
import { DURATION } from '@/theme/motion';
import { getPrescriptions, getVisitRecords } from '@/mocks/api';
import type { Prescription, VisitRecord } from '@/mocks/types';

/**
 * Visit records — "send the traveller home with a medical record their own
 * doctor can read". README.md §13.
 *
 * Everything here is read-only and export-shaped: the visit history the app
 * accumulated in India, the prescription that is still running, and the two ways
 * of getting both out of the app and in front of a doctor at home. No editing,
 * no filtering — the value is that it is already in English and already ordered.
 */

export default function RecordsScreen() {
  const router = useRouter();

  // Null until the first load resolves, so the card stacks don't flash empty.
  const [records, setRecords] = useState<VisitRecord[] | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null);

  useEffect(() => {
    getVisitRecords().then(setRecords);
    getPrescriptions().then(setPrescriptions);
  }, []);

  if (!records || !prescriptions) return <View className="flex-1 bg-bg" />;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: 58, paddingBottom: 108 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-screen">
        {/* Header */}
        <Rise duration={DURATION.riseBase}>
          <ScreenHeader title="Visit records" />
          <Txt variant="bodyXs" className="mt-[10px] text-muted-2">
            Everything in English, ready to hand to your doctor at home.
          </Txt>
        </Rise>

        {/* Visit cards — newest first, as getVisitRecords() returns them */}
        <View className="mt-[18px] gap-[11px]">
          {records.map((record, index) => (
            <Rise key={record.id} delay={index * 60} duration={DURATION.riseFast}>
              <View
                className="rounded-panel border border-line bg-surface p-4"
                accessible
                accessibilityLabel={`Visit on ${record.date}. ${record.providerName}, ${record.doctorName}. ${record.diagnosis}. ${record.cost}.`}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Txt variant="metaLg" className="font-geist-600 text-blue">
                    {record.date}
                  </Txt>
                  <Txt variant="metaLg" className="text-muted-3">
                    {record.cost}
                  </Txt>
                </View>
                <Txt variant="recordTitle" className="mt-[9px]">
                  {record.providerName}
                </Txt>
                <Txt variant="labelSm" className="mt-[3px] text-muted-2">
                  {record.doctorName}
                </Txt>
                {/* The diagnosis is the line a doctor at home actually reads, so
                    it sits below a rule rather than inside the identity block. */}
                <Divider className="mt-3" />
                <Txt variant="bodySm" className="mt-3 text-body-strong">
                  {record.diagnosis}
                </Txt>
              </View>
            </Rise>
          ))}
        </View>

        {/* Current prescription */}
        <Txt variant="section" className="mb-[11px] mt-[26px]">
          Current prescription
        </Txt>
        <Rise delay={80} duration={DURATION.riseFast}>
          <View className="overflow-hidden rounded-panel border border-line bg-surface">
            {prescriptions.map((rx) => (
              <View
                key={rx.id}
                className="flex-row items-center gap-3 border-b border-line-soft px-[15px] py-[14px]"
                accessible
                accessibilityLabel={`${rx.drug}. ${rx.dose}.`}
              >
                <View className="h-2 w-2 shrink-0 rounded-full bg-blue" />
                <View className="flex-1">
                  <Txt variant="body" className="font-geist-600">
                    {rx.drug}
                  </Txt>
                  <Txt variant="meta" className="mt-[2px] text-muted-2">
                    {rx.dose}
                  </Txt>
                </View>
              </View>
            ))}

            {/* Footer action lives inside the card because it acts on the list
                above it, not on the screen. Deliberately inert: a pharmacy finder
                with stock awareness is a fourteenth screen the prototype does not
                include and README.md §13 flags as unscoped — worth scoping before
                build, so there is nothing honest to route to yet. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Find a pharmacy that stocks these"
              accessibilityHint="Pharmacy search is not available yet"
              accessibilityState={{ disabled: true }}
              onPress={() => {}}
              className="w-full items-center py-[14px] active:bg-blue-tint"
            >
              <Txt variant="bodySm" className="font-geist-600 text-blue">
                Find a pharmacy that stocks these
              </Txt>
            </Pressable>
          </View>
        </Rise>

        {/* Footer actions — two equal-width exits for the record */}
        <Rise delay={120} duration={DURATION.riseFast}>
          <View className="mt-5 flex-row gap-[10px]">
            <Button
              label="Download PDF"
              variant="dark"
              height={52}
              className="flex-1"
              // No file layer in the mock build; export belongs to the records
              // endpoint README.md §"Server-owned" lists.
              onPress={() => {}}
            />
            <Button
              label="Email to my GP"
              variant="secondary"
              height={52}
              className="flex-1"
              // Sending it anywhere goes through a coordinator, so the honest
              // destination is the case thread.
              onPress={() => router.push('/chat')}
            />
          </View>
        </Rise>
      </View>
    </ScrollView>
  );
}

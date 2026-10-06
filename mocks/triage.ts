import type { TriageQuestion } from './types';

/**
 * The three triage questions. Copy is final — README.md §3.
 *
 * `iconName` is a lucide icon name; the screen resolves it to a component.
 * `wellClass` / `iconClass` are Tailwind token names so the screen never inlines
 * a hex. The severity these answers produce lives in src/lib/triage.ts, which is
 * a clearly-marked clinical stub.
 */
export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {
    id: 'complaint',
    kicker: 'Question 1 of 3',
    question: 'What is bothering you most right now?',
    help: 'Pick the closest match. A coordinator will confirm the details on the call.',
    options: [
      {
        id: 'fever',
        label: 'Fever, chills or infection',
        sub: 'Temperature, sweating, body ache',
        wellClass: 'bg-red-tint-2',
        iconClass: '#E23B26',
        iconName: 'thermometer',
      },
      {
        id: 'stomach',
        label: 'Stomach or digestive trouble',
        sub: 'Pain, nausea, food poisoning',
        wellClass: 'bg-amber-tint',
        iconClass: '#F0A020',
        iconName: 'activity',
      },
      {
        id: 'injury',
        label: 'Injury or accident',
        sub: 'Fall, cut, sprain, road accident',
        wellClass: 'bg-blue-tint',
        iconClass: '#0B5FFF',
        iconName: 'bandage',
      },
      {
        id: 'breathing',
        label: 'Breathing or chest problem',
        sub: 'Tightness, wheezing, chest pain',
        wellClass: 'bg-red-tint-3',
        iconClass: '#C41F1F',
        iconName: 'wind',
      },
    ],
  },
  {
    id: 'duration',
    kicker: 'Question 2 of 3',
    question: 'How long has this been going on?',
    help: 'Duration changes how quickly you should be seen.',
    options: [
      {
        id: 'hours',
        label: 'Started in the last few hours',
        sub: 'Today',
        wellClass: 'bg-blue-tint',
        iconClass: '#0B5FFF',
        iconName: 'clock',
      },
      {
        id: 'days',
        label: 'One to three days',
        sub: 'Getting worse',
        wellClass: 'bg-amber-tint',
        iconClass: '#F0A020',
        iconName: 'clock',
      },
      {
        id: 'week',
        label: 'Over a week',
        sub: 'Not improving',
        wellClass: 'bg-line-soft',
        iconClass: '#5C6577',
        iconName: 'clock',
      },
    ],
  },
  {
    id: 'mobility',
    kicker: 'Question 3 of 3',
    question: 'Can you walk and speak normally?',
    help: 'This tells us whether you need an ambulance or a clinic visit.',
    options: [
      {
        id: 'self',
        label: 'Yes, I can travel myself',
        sub: 'Taxi or metro is fine',
        wellClass: 'bg-green-tint',
        iconClass: '#0FA958',
        iconName: 'navigation',
      },
      {
        id: 'assisted',
        label: 'I need help getting there',
        sub: 'Arrange transport for me',
        wellClass: 'bg-amber-tint',
        iconClass: '#F0A020',
        iconName: 'users',
      },
      {
        id: 'ambulance',
        label: 'No — send an ambulance',
        sub: 'Immediate dispatch',
        wellClass: 'bg-red-tint-3',
        iconClass: '#E23B26',
        iconName: 'siren',
      },
    ],
  },
];

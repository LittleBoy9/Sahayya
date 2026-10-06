/**
 * The colour palette — the single source of truth, shared by two consumers.
 *
 * 1. tailwind.config.js requires it to generate the utility classes.
 * 2. src/components/Txt.tsx imports it to know which `text-*` classes are
 *    COLOURS rather than font sizes (both share the `text-` prefix).
 *
 * Every value traces to the token tables in README.md. Written as CommonJS
 * because tailwind.config.js is evaluated by Node at build time.
 */
module.exports = {
  ink: '#0C1220',
  'ink-soft': '#1A2333',
  muted: '#5C6577',
  'muted-2': '#7A8496',
  'muted-3': '#98A1B2',
  'muted-4': '#A8B0BE',
  line: '#E4E7EC',
  'line-soft': '#F1F3F7',
  'line-2': '#E9EBEF',
  bg: '#F7F8FA',
  'bg-2': '#FAFBFC',
  surface: '#FFFFFF',
  blue: '#0B5FFF',
  'blue-press': '#0A3FB0',
  'blue-tint': '#EEF3FF',
  'blue-tint-2': '#E8F0FF',
  'blue-border': '#BBD0FF',
  coral: '#FF6B57',
  red: '#E23B26',
  'red-solid': '#D9271A',
  'red-tint': '#FFF4F1',
  'red-border': '#FFD9D1',
  'red-text': '#7A5F5A',
  green: '#0FA958',
  'green-bright': '#4ADE80',
  'green-tint': '#EAF7EF',
  'green-tint-2': '#F3FBF6',
  'green-border': '#BFE7CE',
  amber: '#F0A020',
  'amber-tint': '#FFF6E8',
  violet: '#6B4DE0',
  'violet-tint': '#F4EEFF',
  night: '#0B1020',
  'night-2': '#153A8A',
  'on-night': '#FFFFFF',
  'on-night-2': '#98A6C0',
  'on-night-3': '#8CA0BF',
  'on-night-4': '#7C8FAE',
  'on-night-5': '#5D6E8C',

  // Secondary values the prototype uses that sit outside the README colour table.
  'body-strong': '#3D4757',
  chevron: '#C3CAD6',
  'dash-border': '#C6CEDA',
  'dash-border-2': '#D8DDE6',
  'track-soft': '#E7EAEF',
  'divider-soft': '#EFF1F5',
  'red-deep': '#C41F1F',
  'amber-deep': '#B67A0A',
  'green-deep': '#5C7A66',

  // Named in README prose or the prototype, absent from its colour table.
  'blue-select': '#2C6BFF',
  'blue-select-dot': '#4D8BFF',
  'on-night-6': '#DCE6F5',
  'on-night-7': '#8494AE',
  'on-night-8': '#7C8AA3',
  'red-tint-2': '#FFF0EC',
  'red-tint-3': '#FFEFEF',
  'press-tint': '#F7F9FF',
  'press-grey': '#F4F6FA',
};

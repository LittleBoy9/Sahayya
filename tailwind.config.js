/**
 * Sahaya design tokens — the single source of truth for colour, type and radius.
 *
 * Every value here comes from the "Design Tokens" section of README.md.
 * Screens must reference these tokens by name (bg-blue, text-muted-2, rounded-card)
 * and never inline a raw hex or px value. Shadows live in src/theme/shadows.ts
 * because NativeWind's shadow utilities are unreliable across platforms.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // mocks/ is scanned too: triage option tints are authored as class strings in
  // the fixtures, and Tailwind only emits classes it can see in the content globs.
  content: ['./src/**/*.{js,jsx,ts,tsx}', './mocks/**/*.{js,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Single source of truth, shared with src/components/Txt.tsx — see that file
      // for why the colour NAMES have to be knowable at runtime.
      colors: require('./src/theme/colors.js'),
      fontFamily: {
        // RN needs one family per weight — these match the expo-google-fonts export names.
        'figtree-700': ['Figtree_700Bold'],
        'figtree-800': ['Figtree_800ExtraBold'],
        geist: ['Geist_400Regular'],
        'geist-500': ['Geist_500Medium'],
        'geist-600': ['Geist_600SemiBold'],
        'geist-700': ['Geist_700Bold'],
        'deva-400': ['NotoSansDevanagari_400Regular'],
        'deva-600': ['NotoSansDevanagari_600SemiBold'],
      },
      fontSize: {
        // Named roles from the README type scale, not a generic xs/sm/lg ramp.
        // Sizes the prototype uses that sit outside the README table are named
        // for where they appear.
        hero: ['38px', { lineHeight: '42px' }],          // onboarding headline
        'cost-hero': ['40px', { lineHeight: '44px' }],   // cost estimate figure
        'avatar-xl': ['34px', { lineHeight: '38px' }],   // call screen initials
        display: ['30px', { lineHeight: '35px' }],       // provider detail costs tab
        'title-lg': ['29px', { lineHeight: '34px' }],    // triage question
        'card-hero-lg': ['27px', { lineHeight: '32px' }],// home greeting name
        'card-hero': ['26px', { lineHeight: '31px' }],   // call name, "You are booked"
        'card-hero-sm': ['24px', { lineHeight: '29px' }],// provider name, triage result
        'profile-title': ['21px', { lineHeight: '26px' }],
        title: ['20px', { lineHeight: '24px' }],         // screen titles
        'card-title-xl': ['19px', { lineHeight: '24px' }],// emergency btn, case number
        'card-title-2xl': ['18px', { lineHeight: '23px' }],// insurer name
        'card-title-lg': ['17px', { lineHeight: '21px' }],// search result name
        'record-title': ['16.5px', { lineHeight: '21px' }],
        'card-title': ['16px', { lineHeight: '20px' }],  // carousel provider name
        section: ['15.5px', { lineHeight: '20px' }],     // section headings
        'card-title-sm': ['15px', { lineHeight: '20px' }],// chat appointment card

        'body-lg': ['15.5px', { lineHeight: '25px' }],
        'body-md': ['15px', { lineHeight: '23px' }],
        'body-ml': ['14.5px', { lineHeight: '23px' }],
        body: ['14px', { lineHeight: '22px' }],
        'body-sm': ['13.5px', { lineHeight: '21px' }],
        'body-xs': ['13px', { lineHeight: '20px' }],

        button: ['16px', { lineHeight: '20px' }],
        'button-sm': ['15.5px', { lineHeight: '20px' }],
        'button-xs': ['14.5px', { lineHeight: '19px' }],

        label: ['13px', { lineHeight: '17px' }],
        'label-sm': ['12.5px', { lineHeight: '17px' }],
        'label-relaxed': ['12.5px', { lineHeight: '20px' }],

        overline: ['11px', { lineHeight: '14px' }],
        'overline-sm': ['10.5px', { lineHeight: '14px' }],
        'overline-lg': ['11.5px', { lineHeight: '15px' }],
        'overline-xs': ['12px', { lineHeight: '16px' }],

        meta: ['12px', { lineHeight: '16px' }],
        'meta-lg': ['11.5px', { lineHeight: '16px' }],
        'meta-sm': ['11px', { lineHeight: '15px' }],
        'meta-xs': ['10.5px', { lineHeight: '14px' }],

        'hindi-card': ['19px', { lineHeight: '28.5px' }],
        'hindi-full': ['34px', { lineHeight: '51px' }],
      },
      letterSpacing: {
        hero: '-1px',
        'cost-hero': '-1.2px',
        'title-lg': '-0.7px',
        'card-hero': '-0.6px',
        'card-hero-sm': '-0.5px',
        title: '-0.4px',
        'card-title': '-0.3px',
        'card-title-sm': '-0.2px',
        'case-number': '0.04em',
        policy: '0.05em',
        overline: '0.07em',
        'overline-wide': '0.09em',
        'overline-wider': '0.14em',
      },
      borderRadius: {
        bar: '3px', // progress bars, shimmer placeholders
        tag: '4px',
        badge: '5px',
        chip: '7px',
        card: '8px', // buttons, inputs, cards
        panel: '9px', // elevated cards
        'panel-lg': '10px',
        well: '11px', // 44px upload well
        pill: '999px',
      },
      spacing: {
        screen: '20px', // screen horizontal padding
        'screen-dark': '24px', // dark full-bleed screens
      },
    },
  },
  plugins: [],
};

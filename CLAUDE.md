# Sahaya — traveller medical assistance, India

React Native app built from the design handoff in [README.md](README.md) and the
HTML prototype at [design/Sahaya.dc.html](design/Sahaya.dc.html).

**README.md is the specification.** Colors, typography, spacing, radii, shadows,
copy and animation timings in it are final and intentional. When this file and
README.md disagree, README.md wins.

The prototype is a *reference*, not code to port. Read its markup for layout and
copy, and its `class Component` block for state and behaviour. Its `<sc-for>` /
`<sc-if>` / `{{ }}` runtime does not exist outside the design tool.
`design/ios-frame.jsx` is a browser-only device bezel — discarded, do not
reintroduce it.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Expo SDK 57 (React Native 0.86, React 19.2), New Architecture |
| Language | TypeScript 6, `strict` |
| Routing | `expo-router`, typed routes on, `src/app` |
| Styling | NativeWind 4.2 + Tailwind 3.4 |
| Animation | Reanimated 4.5 |
| State | `zustand` for UI state; mock data via `mocks/api.ts` |
| Lists | `@shopify/flash-list` |
| Maps | OpenStreetMap raster tiles via `expo-image` (`src/components/OsmMap.tsx`) |
| Icons | `lucide-react-native` |
| Gradients | `expo-linear-gradient` + `react-native-svg` for radial glows |
| Fonts | `@expo-google-fonts/*` via `expo-font` |

Everything above runs in **Expo Go** — no development build is needed.

### Deviations from README.md, and why

- **Reanimated 4, not 3.** SDK 57 ships 4.5; 3 is not available on this SDK.
- **No `moti`.** It was suggested for simple entrance animations, but the three
  wrappers in `src/components/motion/` cover that, and moti's Reanimated 4
  support is unclear. One less dependency.
- **No TanStack Query yet.** With mocks only it adds a provider tree and cache
  config that buys nothing. `mocks/api.ts` is already async, so wrapping it later
  touches one file. Add it when a real backend lands.
- **Onboarding is `/onboarding/[step]`, not `/(onboarding)/[step]`.** A route
  group leaves `[step]` at the root, where it swallows `/cost`, `/call` and
  friends. A real path segment avoids the collision.

## Token rules

**No screen may contain a raw hex, a raw font size, or a raw shadow.** Three
places own those values:

1. **[src/theme/colors.js](src/theme/colors.js)** — the 57-colour palette, shared
   by `tailwind.config.js` (to generate classes) and `Txt.tsx` (to tell a
   `text-<colour>` class apart from a `text-<size>` one). Add colours here only.
   **[tailwind.config.js](tailwind.config.js)** — 40 named font sizes, letter
   spacing, radii. Every value traces to README.md's token tables.
2. **[src/theme/shadows.ts](src/theme/shadows.ts)** — each shadow authored once as
   the literal CSS string from README.md, parsed per-platform.
3. **[src/theme/motion.ts](src/theme/motion.ts)** — the single easing curve
   `cubic-bezier(.2,.8,.2,1)`, all durations, all loop timings.

Type is applied through [`<Txt variant>`](src/components/Txt.tsx), never by naming
a size. Weight and colour compose via `className`:

```tsx
<Txt variant="cardTitle">Ashoka Multispeciality</Txt>
<Txt variant="body" className="font-geist-600 text-blue">Message</Txt>
```

If a needed size or colour is missing, **add a token** — do not inline an
arbitrary value. Radii use the named scale: `rounded-tag` (4), `rounded-chip` (7),
`rounded-card` (8), `rounded-panel` (9), `rounded-panel-lg` (10), `rounded-pill`.

### Two platform traps, already solved — don't undo them

- **`className` is silently dropped on `Animated.View`.** No error, no warning,
  styles just don't apply. [src/theme/interop.ts](src/theme/interop.ts) registers
  the `cssInterop` that fixes it, and the root layout imports it. Any new
  animated component needs registering there too.
- **Shadows differ by platform.** RN 0.86 deprecated `shadow*` in favour of
  `boxShadow`; react-native-web only honours `shadow*`. `shadows.ts` emits the
  right shape per platform from one authored CSS string. Always go through it.
- **A default colour class silently beats the caller's.** Tailwind emits colour
  utilities alphabetically and CSS resolves equal-specificity rules by document
  order — not by the order classes appear in a `className` string. So a baked-in
  `text-ink` overrode every `text-blue` and `text-green` in the app, and rendered
  them black. [`Txt`](src/components/Txt.tsx) and [`Card`](src/components/ui.tsx)
  now apply their defaults only when the caller has not supplied one. Any new
  primitive with a default colour, fill or border must do the same.
- **Tailwind only generates classes it can see.** The content globs cover
  `./src/**` *and* `./mocks/**`, because the triage option tints are authored as
  class strings in the fixtures.

## Animation

Exactly three entrance animations, in `src/components/motion/`:

- **`<Rise>`** — translateY 14→0 + opacity. Screen and card entrances.
- **`<SlideIn>`** — translateX 26→0 + opacity. Sequential content.
- **`<Pop>`** — scale .92→1.02→1 + opacity. Confirmations, things arriving.

Reuse these rather than inventing new ones. All three collapse to a plain opacity
fade under reduce-motion (`useReduceMotion`). Pulsing dots and the call rings are
kept because they carry meaning — they slow by `LOOP.reducedMotionFactor`.

## Data

All mock data lives in [`/mocks`](mocks/), reached **only** through
[`mocks/api.ts`](mocks/api.ts). Screens must not import `mocks/providers.ts` and
friends directly — the point of the seam is that swapping in a real backend
touches `api.ts` alone.

Every fixture is invented, including provider names, ratings, audited prices,
policy numbers and the medical profile. **None of it is seed data.** README.md:
"Do not ship placeholder providers."

## Prototype marker

[`PrototypeNotice`](src/components/PrototypeNotice.tsx) renders "Prototype ·
sample data, not a real service" on Home, Call and Medical profile — the three
screens most likely to be mistaken for a working service. **Delete the file and
its three usages before any real release**; it is one component precisely so that
removal is trivial.

## Safety-critical

- **Triage severity is a clinical decision, not UI logic.**
  [src/lib/triage.ts](src/lib/triage.ts) is a marked stub carrying
  `TODO(clinical-review)`. It must not ship without a clinician-authored decision
  table, a documented escalation path and a named clinical owner. No screen may
  infer severity from raw answers — it comes from `computeSeverity` only.
- The "send an ambulance" answer short-circuits to the `emergency` band.
- **Medical data is the most sensitive table in the schema.** India's DPDP Act
  applies. In production: in-region storage, field-level encryption on
  allergy/condition fields, explicit consent before sharing with a provider, an
  audit log of every share. Never store policy documents on the device.
- **"Sahaya verified" and the 10% bill-dispute promise are operational
  commitments with legal exposure.** The copy ships as specified in README.md;
  the company must be able to defend the definition before launch.

## Commands

```bash
npx expo start          # dev server; scan the QR with Expo Go
npx tsc --noEmit        # typecheck — must be clean before any commit
npx expo export --platform ios   # verify it bundles
npx expo start --web    # browser harness for quick visual checks
```

### Builds

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview   # installable APK
```

`eas.json` profiles: `preview` (internal APK / ad-hoc iOS), `development`
(dev-client), `production` (store). Bundle IDs are `com.sahaya.app` on both
platforms — change them before any real release.

### Maps

The provider header is **OpenStreetMap tiles**, not a native map engine —
[src/components/OsmMap.tsx](src/components/OsmMap.tsx) computes the slippy-tile
grid for a coordinate and renders it as plain images, with the pin composited on
top in React Native. `react-native-maps` was removed: the header never pans or
zooms, so a whole native map engine was only painting tiles.

This means no Google Maps API key, no billing account, and the same real map on
iOS, Android **and web** — there is no placeholder or capability check any more.

Two obligations travel with the tiles, and neither is optional:

- **"© OpenStreetMap" must stay visible.** It is an ODbL licence term. It sits
  26px up because the identity card is pulled 22px over the header — if that
  overlap changes, move the credit, don't drop it.
- **`tile.openstreetmap.org` is a donated service, not a CDN.** Its usage policy
  rules out heavy or commercial app traffic. Fine at prototype volume (4 tiles
  per provider screen, disk-cached, client identified by `User-Agent`). **Before
  launch, point `TILE_URL` at a paid host** — MapTiler, Stadia and Carto all
  serve the same `{z}/{x}/{y}` scheme, so it is a one-line change.

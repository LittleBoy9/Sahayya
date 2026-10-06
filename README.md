# Handoff: Sahaya — Traveller Medical Assistance App

## Overview

Sahaya is a mobile app for a private travel-assistance company operating in India. It serves international travellers and domestic tourists from other states who fall ill in an unfamiliar city and don't know which hospital or clinic to visit, whether anyone there speaks their language, or what treatment will cost.

The product answers those three questions and adds a human: a 24/7 helpline staffed by local case coordinators who triage the caller, book them into a credentialled provider, confirm insurance, and stay on the case until discharge.

The prototype covers 13 screens across four flows:

1. **Arrival** — onboarding and trip setup
2. **Get help** — home, symptom triage, helpline call, case chat
3. **Find care** — provider search, provider detail, booking, cost estimate
4. **Admin** — insurance and claims, phrasebook, medical profile, visit records

The showpiece flow is *panic → triage → connected to a coordinator*: home screen emergency button → three triage questions → severity recommendation → auto-dialing call screen that transitions to a live call with a running timer and a staged transcript.

## About the Design Files

The files in `design/` are **design references created in HTML**. They are prototypes that show intended look and behaviour. They are **not production code to copy directly**.

`Sahaya.dc.html` is a single-file streaming component built for a design tool. It uses a custom template runtime (`<sc-for>`, `<sc-if>`, `{{ holes }}`) that does not exist outside that tool. Do not try to port the runtime. Read it as a specification: the markup gives exact layout, colors, type and copy; the `class Component` logic block at the bottom gives the state model, the data, and the interaction behaviour.

`ios-frame.jsx` is only a device bezel used to present the screens in a browser. It is a presentation artifact — discard it entirely. On device, the OS provides the status bar and home indicator.

The task is to **recreate these designs in a real React Native codebase** using the stack below.

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, shadows, copy and animation timings are all final and intentional. Recreate the UI to match. Where a value is given as an exact hex or px below, use it.

The one deliberate exception: any place the prototype draws a shape as a placeholder for an icon (a small rounded square inside a circle, a rotated pin, a checkmark) is standing in for a real icon. Replace those with a proper icon set — `lucide-react-native` is the recommended choice. The prototype also uses a CSS-drawn abstract street grid as a map placeholder on the provider detail screen; replace it with a real map.

## Recommended Stack

Decided with the user. Written for Claude Code to follow.

**App**
- Expo (React Native), TypeScript, managed workflow
- `expo-router` — file-based routing; mirrors the screen structure below
- `nativewind` for styling, with the design tokens below configured in `tailwind.config.js`
- `react-native-reanimated` v3 (+ `moti` for the simpler entrance animations)
- `@shopify/flash-list` for the provider list
- `react-native-maps` for the provider detail map
- `@tanstack/react-query` for server state; `zustand` for local UI state

**Native capability**
- `expo-location` — nearest verified providers, distance sort
- `expo-camera` + `expo-document-picker` — claim and invoice upload
- `expo-notifications` — booking reminders, claim status changes
- `expo-linking` / CallKit for the helpline dial-out
- `expo-localization` — device language drives the phrasebook direction

**Backend**
- Supabase (Postgres, auth, storage) in a Mumbai region, or Node/Fastify + Postgres on Fly.io in `bom`
- Telephony: Exotel for domestic Indian legs, Twilio for international inbound
- India's DPDP Act applies to the medical data in this app. Keep patient records in-region, encrypt allergy/condition fields at rest, and treat the medical profile as the most sensitive table in the schema.

**Project bootstrapping**

Create `CLAUDE.md` at the repo root containing the stack list above, the design tokens section of this document, and a rule that all screens use the shared token scale rather than ad-hoc values.

## Design Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0C1220` | Primary text, dark buttons |
| `ink-soft` | `#1A2333` | Dark button hover |
| `muted` | `#5C6577` | Body copy on light |
| `muted-2` | `#7A8496` | Secondary text, labels |
| `muted-3` | `#98A1B2` | Tertiary text, disabled |
| `muted-4` | `#A8B0BE` | Timestamps |
| `line` | `#E4E7EC` | Default border |
| `line-soft` | `#F1F3F7` | Internal dividers, chip fill |
| `line-2` | `#E9EBEF` | Section borders |
| `bg` | `#F7F8FA` | Screen background |
| `bg-2` | `#FAFBFC` | Inset panel |
| `surface` | `#FFFFFF` | Cards |
| `blue` | `#0B5FFF` | Primary action, brand |
| `blue-press` | `#0A3FB0` | Primary pressed |
| `blue-tint` | `#EEF3FF` | Blue icon wells, selected slot |
| `blue-tint-2` | `#E8F0FF` | Avatar fill |
| `blue-border` | `#BBD0FF` | Hovered card border |
| `coral` | `#FF6B57` | Emergency gradient start |
| `red` | `#E23B26` | Emergency, urgent severity |
| `red-solid` | `#D9271A` | Emergency alt treatment |
| `red-tint` | `#FFF4F1` | Urgent panel fill |
| `red-border` | `#FFD9D1` | Urgent panel border |
| `red-text` | `#7A5F5A` | Copy inside urgent panels |
| `green` | `#0FA958` | Online, open now, covered |
| `green-bright` | `#4ADE80` | Coverage figure on dark |
| `green-tint` | `#EAF7EF` | Green icon wells |
| `green-tint-2` | `#F3FBF6` | Upload success panel |
| `green-border` | `#BFE7CE` | Upload success border |
| `amber` | `#F0A020` | Caution severity, review stars |
| `amber-tint` | `#FFF6E8` | Amber icon wells |
| `violet` | `#6B4DE0` | Phrasebook accent |
| `violet-tint` | `#F4EEFF` | Phrasebook icon well |
| `night` | `#0B1020` | Dark screens (onboarding, call, cost hero) |
| `night-2` | `#153A8A` | Insurance card gradient start |
| `on-night` | `#FFFFFF` | Text on dark |
| `on-night-2` | `#98A6C0` | Body copy on dark |
| `on-night-3` | `#8CA0BF` | Secondary on dark |
| `on-night-4` | `#7C8FAE` | Labels on dark |
| `on-night-5` | `#5D6E8C` | Tertiary on dark |

Gradients:
- Emergency button: `linear-gradient(135deg, #FF6B57, #E23B26)`
- Call avatar: `linear-gradient(150deg, #1B6BFF, #0A3FB0)`
- Insurance card: `linear-gradient(135deg, #153A8A, #0B1020)`
- Dark screen glow: `radial-gradient(circle at 50% 32%, rgba(11,95,255,.28), transparent 62%)`

### Typography

Two families.

- **Figtree** — display. Headings, numbers, names, brand. Weights 700 and 800. Negative tracking.
- **Geist** — UI. Body, labels, buttons, inputs. Weights 400/500/600.
- **Noto Sans Devanagari** — Hindi phrase text only. Weights 400/500/600.

Load via `expo-font`. All three are on Google Fonts.

| Role | Family / weight | Size | Tracking | Notes |
|---|---|---|---|---|
| Hero (onboarding) | Figtree 800 | 38 | -1px | line-height 1.1 |
| Cost hero figure | Figtree 800 | 40 | -1.2px | |
| Screen title (large) | Figtree 800 | 29 | -0.7px | triage question |
| Card hero | Figtree 800 | 26–27 | -0.5px | call name, booked confirmation |
| Screen title | Figtree 800 | 20 | -0.4px | search, cost, records headers |
| Card title | Figtree 700 | 16–17 | -0.2 to -0.3px | provider names |
| Section heading | Figtree 700 | 15.5 | — | "Line by line", "Emergency contacts" |
| Body | Geist 400 | 13.5–15.5 | — | line-height 1.55–1.65 |
| Button | Geist 600 | 15.5–16 | — | |
| Label / row key | Geist 400–500 | 12.5–13 | — | `muted-2` |
| Overline | Geist 600–700 | 10.5–11.5 | 0.07–0.14em | uppercase |
| Meta / timestamp | Geist 400 | 11–12 | — | `muted-3` / `muted-4` |
| Hindi phrase (card) | Noto Sans Devanagari 400 | 19 | — | `blue`, line-height 1.5 |
| Hindi phrase (full-screen) | Noto Sans Devanagari 600 | 34 | — | white on `blue`, line-height 1.5 |

Apply `text-wrap: pretty` equivalents by keeping line lengths generous; RN has no direct equivalent, so avoid manual line breaks.

### Spacing, radius, elevation

- Screen horizontal padding: **20px** (24px on dark full-bleed screens)
- Card padding: **14–18px**
- Gap between stacked cards: **9–11px**
- Section top margin: **22–26px**
- Radius: **4px** (tags) · **7px** (small buttons, chips) · **8px** (buttons, inputs, cards) · **9–10px** (elevated cards, panels) · **999px** (filter pills) · **50%** (avatars)
- Border: `1px solid line` default; `1.5px dashed #C6CEDA` for the upload dropzone
- Shadows:
  - card resting `0 1px 2px rgba(12,18,32,.04)`
  - card hover `0 8px 20px rgba(12,18,32,.06)` → `0 8px 22px rgba(12,18,32,.07)`
  - elevated panel `0 8px 24px rgba(12,18,32,.06)`
  - blue primary `0 8px 24px rgba(11,95,255,.36)`
  - red primary `0 10px 26px rgba(226,59,38,.3)`
  - emergency card `0 14px 34px rgba(226,59,38,.3)`
  - call avatar `0 18px 50px rgba(11,95,255,.5)`

Note: RN needs these translated to `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` on iOS and `elevation` on Android. Nativewind's shadow utilities are unreliable across platforms — define a small `shadows.ts` and use it.

### Touch targets

Every interactive element in the prototype is at least 44px in its smaller dimension. Primary buttons are 52–54px tall, secondary 48–50px, small icon buttons 34–40px (these sit inside larger padded rows, so their effective hit area meets 44px — enforce that with `hitSlop`).

## Screens

Screen order below matches the nav rail in the prototype. Route names are suggestions for `expo-router`.

---

### 1. Onboarding — `/(onboarding)/[step]`

**Purpose:** Explain what Sahaya is, then capture the destination city so providers, prices and insurance can be preloaded.

**Layout:** Full-bleed `night` background. Two decorative radial glows: blue 420px circle bleeding off the top-right, coral 360px circle bleeding off the bottom-left. Content is a vertical flex: brand lockup, headline, body, spacer, (city picker on step 3), progress dots, primary button, skip link. Padding `120px 28px 40px`.

**Three steps.** Copy is final:

1. "Falling ill far from home should not be a guessing game." / "Sahaya connects you to hospitals and clinics we have visited, credentialled and price-checked ourselves." / CTA "How it works"
2. "One number. A real person. In your language." / "Our Delhi, Mumbai and Goa coordinators answer in under a minute, 24 hours a day, and stay on your case until you are discharged." / CTA "Set up my trip"
3. "Where are you travelling?" / "We will preload verified providers, prices and your insurance details for that city." / CTA "Enter Sahaya"

**Brand lockup:** 30px rounded square (radius 8) in `blue`, white "S" in Figtree 800/16, next to "Sahaya" in Figtree 800/19 white.

**City picker (step 3 only):** four rows — New Delhi (34 providers), Mumbai (41), Goa (19), Jaipur (12). Each row: 8px dot, city name (Geist 500/15 white), provider count right-aligned (12px `#8494AE`). Selected row gets `rgba(11,95,255,.16)` fill, `#2C6BFF` border, `#4D8BFF` dot. Unselected: `rgba(255,255,255,.05)` fill, `rgba(255,255,255,.12)` border, `rgba(255,255,255,.3)` dot.

**Progress dots:** three 3px-tall bars, flex 1 each, 6px gap. Filled `blue` up to and including the current step, otherwise `rgba(255,255,255,.16)`. 300ms color transition.

**Skip:** "Skip setup" text button, `#7C8AA3`, goes straight to Home.

**Animation:** content block enters `translateY(14px) → 0` with opacity, 600ms `cubic-bezier(.2,.8,.2,1)`. City picker enters on the same curve at 500ms with a 50ms delay.

---

### 2. Home — `/(tabs)/index`

**Purpose:** The context-aware entry point. Tells the traveller where they are and what is around them, then offers one enormous escape hatch.

**Layout:** `bg` background, 62px top padding (below status bar), 20px sides.

**Components, top to bottom:**

- **Greeting row.** "Tuesday, 9:41 · New Delhi" (Geist 12.5, `muted-2`) above "Elena" (Figtree 800/27, -0.6px). Right: 42px circular avatar button, white fill, `line` border, "EM" in Figtree 700/14 `blue`. Taps to Medical profile. *In production, derive the greeting from device time and reverse-geocoded city.*
- **Location strip.** White card, `line` border, radius 8, padding `10px 12px`. Green 7px dot pulsing (opacity 1 → .45 → 1, 2s, infinite), "Near Hauz Khas · 34 verified providers around you" (12.5, `#3D4757`), right-aligned "Day 4 of 12" (11.5, 600, `blue`). Trip day comes from the trip record.
- **Emergency button.** The largest element on the screen. Full width, 22px padding, radius 10, coral→red gradient, emergency shadow. A 150px white-at-13% circle bleeds off the top-right. Inside: 52px circle at `rgba(255,255,255,.18)` holding the icon, then "I need help now" (Figtree 700/19 white, -0.3px) and "A coordinator answers in under 60 seconds" (12.5, `rgba(255,255,255,.86)`). Taps to Triage. Enter animation: scale 0.92 → 1.02 → 1 with opacity, 500ms, 60ms delay. Press: `translateY(1px)`.
- **Four tiles**, 2×2 grid, 10px gap. Each: white card, `line` border, radius 9, padding `15px 14px 16px`, a 30px tinted icon well at top with 24px of space below it, then title (14/600) and subtitle (11.5, `muted-2`).
  - "Find a clinic" / "Filter by language & price" — blue well → Search
  - "What will it cost?" / "Real prices, before you go" — green well → Cost
  - "Insurance & claims" / "Cashless approved" — amber well → Insurance
  - "Talk to the doctor" / "Hindi phrases, spoken" — violet well → Phrasebook
- **"Nearest verified care"** section heading (Figtree 700/15.5) with "See all 34" link (12.5/600 `blue`).
- **Horizontal provider carousel.** 236px-wide cards, 12px gap, 20px side padding. Each: status tag (10.5/700 uppercase, tinted by tag type), distance right-aligned, provider name (Figtree 700/16), type (12, `muted-2`), then language chips (11px, `line-soft` fill, radius 4). Enters with `translateX(26px) → 0`, 500ms, 140ms delay.
- **Coordinator card.** White card. Header row: 34px "RK" avatar (`blue-tint-2` fill), "Rhea Kapoor" (13.5/600), "Your case coordinator · Delhi NCR" (11.5, `muted-2`), "Online" (11/600 `green`). Two-column footer split by a 1px divider: "Message" → Chat, "Call helpline" → Call. Both 13/600 `blue`.

**Tab bar:** the prototype does not draw one because the nav rail replaces it. In production add a five-tab bar: Home · Care (search) · Chat · Records · Profile. 84px tall including safe area, `surface` background with a hairline top border, active tint `blue`, inactive `muted-3`.

---

### 3. Symptom triage — `/triage`

**Purpose:** Three questions that produce a severity recommendation and pre-brief the coordinator, so the traveller does not have to explain themselves twice.

**Layout:** White background. Header row: 34px back button, then a 4px progress track (fill `blue`, width animates over 450ms `cubic-bezier(.2,.8,.2,1)`), then "n/3" counter (12/600 `muted-2`).

**Question state.** Overline (11/700 uppercase `blue`, e.g. "Question 1 of 3"), question (Figtree 800/29, -0.7px, line-height 1.16), helper (14, `muted-2`), then option rows.

Each option row: white, `line` border, radius 8, 16px padding, 13px gap. A 34px tinted well with an 11px icon, then label (15/600) and sub (12, `muted-2`) stacked, then a `#C3CAD6` chevron. Hover: border `blue`, fill `#F7F9FF`. Press: `scale(.99)`.

Below the options, pinned to the bottom: a dashed escape hatch — "Skip questions — call a coordinator now", `#FAFBFC` fill, `#D8DDE6` dashed border; hover turns the border coral and text red.

**The three questions and their options** (well tint / icon color in parentheses):

1. *"What is bothering you most right now?"* — helper "Pick the closest match. A coordinator will confirm the details on the call."
   - Fever, chills or infection / "Temperature, sweating, body ache" (red tint)
   - Stomach or digestive trouble / "Pain, nausea, food poisoning" (amber tint)
   - Injury or accident / "Fall, cut, sprain, road accident" (blue tint)
   - Breathing or chest problem / "Tightness, wheezing, chest pain" (`#FFEFEF` / `#C41F1F`)
2. *"How long has this been going on?"* — helper "Duration changes how quickly you should be seen."
   - Started in the last few hours / "Today" (blue)
   - One to three days / "Getting worse" (amber)
   - Over a week / "Not improving" (grey)
3. *"Can you walk and speak normally?"* — helper "This tells us whether you need an ambulance or a clinic visit."
   - Yes, I can travel myself / "Taxi or metro is fine" (green)
   - I need help getting there / "Arrange transport for me" (amber)
   - No — send an ambulance / "Immediate dispatch" (red)

Each question slides in from the right (`translateX(26px) → 0`, 340ms).

**Result state.** Urgent panel: `red-tint` fill, `red-border` border, radius 10, 20px padding. Pulsing 9px red dot + "URGENT CARE RECOMMENDED" overline, then "See a doctor within the next 2 hours" (Figtree 800/24) and an explanatory paragraph in `red-text`. Below it a four-row summary table (Main complaint / Duration / Mobility / Suggested care) reflecting the actual answers. Two CTAs: "Connect me to a coordinator" (red, 54px) and "Browse clinics myself" (outlined, 50px).

**Production note.** The prototype hardcodes the urgent outcome. Real triage must map answer combinations to severity bands — and the "send an ambulance" answer must short-circuit the remaining questions and dispatch immediately. Have this reviewed by a clinician before launch; do not ship an algorithm invented by a designer or a model.

---

### 4. Helpline call — `/call`

**Purpose:** The moment the product justifies itself. Show that a real person is coming, then show what they are doing for you.

**Layout:** `night` background, radial blue glow centred at 50%/32%. Vertical flex, padding `70px 24px 40px`.

**Two states, automatic.** Mounts in `dialing`; transitions to `live` after **2800ms**.

*Dialing:* overline "Sahaya helpline · Delhi NCR", name "Rhea Kapoor" (Figtree 800/26 white), sub "Connecting you to a coordinator…", footer "Average answer time today: 34 seconds".

*Live:* overline becomes "Connected · MM:SS" counting up every second. Sub becomes "Case coordinator · speaking English". Footer becomes "Recorded for your case file · tap red to end".

**Avatar and rings.** Centred 200px square. Three concentric 1.5px `rgba(11,95,255,.5)` rings, each animating `scale(.7) → scale(2.1)` with opacity `.55 → 0` over 2600ms on an infinite loop, staggered by 0s / 850ms / 1700ms. Centre: 124px circle, blue gradient, "RK" in Figtree 800/34 white.

**Live transcript (live only).** `rgba(255,255,255,.06)` panel, radius 10. Green dot + "LIVE TRANSCRIPT" overline. Lines append one at a time every **2600ms**, each entering with the standard rise. Speaker prefix in 600 weight `#7C8FAE`, text in `#DCE6F5`. The four lines:
1. Rhea: "I can see your triage answers, Elena. Are you able to get to Saket?"
2. You: "Yes, I can take a taxi."
3. Rhea: "Booking you at Ashoka Multispeciality for 10:30. Dr. Menon speaks English."
4. Rhea: "Cashless is approved on your policy — you pay nothing at reception."

**Action chips (live only).** Three equal buttons, `rgba(255,255,255,.05)` fill: "Booking held" → Booking, "View clinic" → Detail, "Cost estimate" → Cost. These are the coordinator pushing things into the app while talking.

**Controls.** Three 62px circles: mute (rounded square icon), message → Chat (circle icon), end call (`red` fill) → Home.

**Production note.** Replace the simulated transition with real call state from the telephony SDK, and the transcript with either live ASR or the coordinator's typed notes. If neither is available at launch, drop the transcript rather than faking it — but keep the ring animation and the connecting/connected states, which are the reassurance the screen exists to deliver.

---

### 5. Case chat — `/chat`

**Purpose:** Asynchronous continuation of the call. The case coordinator sends the traveller things they will need at the clinic.

**Layout:** `bg` background, column flex. Sticky translucent header (`rgba(247,248,250,.86)` + 14px blur, hairline bottom border): back button, 36px "RK" avatar, name + "Online · case #DL-4471" (`green`), "Call" button on the right.

**Message list.** 10px gap. Day divider: "Today · encrypted, kept in your case file" (11, `muted-3`, centred). Bubbles max 78% width, radius 10, 12/14px padding, 14px text at 1.55 line-height. Outbound: `blue` fill, white text, right-aligned. Inbound: white fill, `line` border, `ink` text, left-aligned. Timestamp below each bubble (10.5, `muted-4`), aligned to the bubble side. Each bubble enters with a 350ms rise.

**Seed conversation** (final copy):
- Rhea 09:38 — "Hi Elena — Rhea here, your Sahaya coordinator in Delhi. I have your triage answers. How are you feeling now?"
- Elena 09:39 — "Fever is still around 39. I can walk but I am worried about the pain on my right side."
- Rhea 09:40 — "Understood. Right-side pain with fever needs blood work today. I am holding a 10:30 slot at Ashoka Multispeciality — Dr. Menon speaks fluent English and has treated many travellers."
- Rhea 09:40 — **appointment card**

**Appointment card bubble.** A distinct message type, not a text bubble. White fill, `blue-border` border, radius 9, blue-tinted shadow. Overline "APPOINTMENT HELD" (10.5/700 `blue`), then "Ashoka Multispeciality · 10:30 · Dr. A. Menon" (Figtree 700/15), then "Confirm booking →" (12/600 `blue`). Taps through to Booking. Build this as a proper structured-message renderer — the backend should send typed message payloads (`text` | `appointment` | `document` | `cost_estimate`), not markup.

**Sending.** Type and submit (Enter or the send button) appends the outbound bubble, clears the field, shows a typing indicator for **1600ms**, then appends: "Noted — I have added that to your case file and told the clinic ahead of your visit." Replace with real messaging (Supabase Realtime or a websocket) — the canned reply is prototype scaffolding.

**Typing indicator.** 52px-wide white card, three 6px `blue` dots each animating `translateY(0 → -4px → 0)` with opacity `.4 → 1 → .4` over 1200ms, staggered 0 / 180ms / 360ms.

**Quick replies.** Horizontal scroll of pill buttons above the composer: "Where exactly is it?", "Is it cashless?", "Can you send a car?". Tapping one fills the composer rather than sending — the traveller can edit before sending.

**Composer.** 40px attach button, text input (`line` border, radius 8, focus border `blue`), 40px `blue` send button.

---

### 6. Provider search — `/(tabs)/care`

**Purpose:** Let the traveller do it themselves, with the filters that actually matter to them.

**Layout:** Sticky white header block: back button + "Verified care nearby" (Figtree 800/20), a 44px search input (`bg` fill, `line` border; on focus fill white and border `blue`, placeholder "Search hospital, clinic or lab"), then a horizontally scrolling filter pill row.

**Filter pills:** English-speaking · Open now · Cashless · Under 3 km · Hospital · Clinic. Default active: **English-speaking** and **Open now**. Active pill: `ink` fill, white text. Inactive: white fill, `line` border, `#3D4757` text. Radius 999, `8px 12px` padding, 12.5px.

**Result meta row:** "n of m providers" (12.5, `muted-2`) left, "Sorted by distance" (12.5/600 `blue`) right.

**Provider card.** White, `line` border, radius 9, 16px padding. Top row: name (Figtree 700/17) + type (12.5, `muted-2`) on the left; distance (13.5/700) + status on the right, where status is "Open · 12 min wait" in `green` or "Opens 8:00 am" in `muted-3`. Divider, then a meta row: "★ 4.8" (12.5/600), "412 traveller reviews" (12, `muted-3`), spacer, cashless badge (11/600 `blue` on `blue-tint`, radius 4) or "Reimburse", price band ("₹" / "₹₹" / "₹₹₹", 13/600). Bottom line: "Speaks English · Hindi · French" (12, `muted`). Hover: `blue-border`, lift 2px, hover shadow.

**Empty state.** Dashed-border card: "Nothing matches those filters" (Figtree 700/16) / "Loosen a filter, or call the helpline and we will find someone who is open." / blue "Call the helpline" button.

**Sample data** (four providers — replace with real, audited records):

| Name | Type | Distance | Tag | Languages | Rating | Reviews | Band | Cashless | Open | Wait | Address | Consult |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ashoka Multispeciality | Hospital · 24×7 emergency | 1.4 km | Verified | English, Hindi, French | 4.8 | 412 | ₹₹ | yes | yes | 12 min | Block C, Saket, New Delhi | ₹1,200 |
| Rosewood Care Clinic | Walk-in clinic · GP + labs | 0.8 km | Open now | English, Hindi | 4.6 | 188 | ₹ | yes | yes | 5 min | Hauz Khas Village, New Delhi | ₹700 |
| Meridian Diagnostics | Labs & imaging | 2.1 km | Cashless | English, Hindi, Spanish | 4.7 | 301 | ₹₹ | yes | no | — | Green Park, New Delhi | ₹450 |
| Nirvaan Health | Hospital · paediatrics | 3.6 km | Verified | English, Hindi, German | 4.5 | 96 | ₹₹₹ | no | yes | 25 min | Vasant Vihar, New Delhi | ₹1,800 |

These names are invented for the prototype. Do not ship placeholder providers.

---

### 7. Provider detail — `/provider/[id]`

**Purpose:** Everything needed to decide, then book.

**Layout:**

- **238px map header.** Replace the prototype's CSS street grid with `react-native-maps`, centred on the provider, non-interactive until tapped. Keep the treatment: a subtle top gradient scrim (`rgba(11,16,32,.34)` fading out by 46%), a blue teardrop pin (34px, `border-radius: 50% 50% 50% 2px`, rotated -45°) with a pulsing `rgba(11,95,255,.16)` halo. Floating controls at 58px from the top: back button left, "Directions" pill right, both `rgba(255,255,255,.92)` with blur.
- **Identity card**, pulled up 22px over the map. White, radius 10, elevated shadow. "SAHAYA VERIFIED" overline with a small blue check dot, provider name (Figtree 800/24, -0.6px), "Hospital · 24×7 emergency · 1.4 km away" (13, `muted-2`), then language chips.
- **Tabs:** Overview · Costs · Reviews. 14/600, active `ink` with a 2px `blue` underline, inactive `muted-3`. 22px gap. Content fades and rises 300ms on switch.
- **Overview tab.** Facts table: Address / Consultation / Languages / "Last audited by Sahaya — March 2026". Then "English-speaking doctors": rows with a 40px initials avatar, name (14.5/600), "Internal medicine · English, Hindi, Malayalam" (12, `muted-2`), and next slot in `green` 12/600. Sample: Dr. A. Menon (internal medicine, 10:30 today), Dr. S. Bhatt (emergency medicine, 13:00 today).
- **Costs tab.** A summary card: "Typical visit for your symptoms", ₹6,040 (Figtree 800/30), ≈ $69, and a "See the full breakdown" button → Cost screen.
- **Reviews tab.** Cards with reviewer + country, relative date, amber stars, and body copy. Both sample reviews mention the things this product is judged on — speed, language, bill accuracy, insurance help.
- **Sticky footer.** Translucent, hairline top border. A 52px square call button next to a full-width "Book a visit" primary.

---

### 8. Booking — `/provider/[id]/book`

**Purpose:** Confirm a held slot in as few taps as possible.

**Picking state:** header, then a "HELD FOR YOU" inset card naming the provider and address. "DAY" label + three equal 46px day pills (Today / Wed 19 / Thu 20; selected `ink` fill, white text). "TIME" label + a 3-column grid of 46px slot buttons (09:45, 10:30, 11:15, 12:00, 14:30, 16:00; selected `blue-tint` fill with `blue` border and text). Default selection: Today, 10:30. Then an interpreter row — green well, "Interpreter on standby" / "Free · joins by phone if needed", "Added" in `green`. Bottom CTA reads back the selection: "Confirm Today · 10:30 · Dr. A. Menon".

**Confirmed state:** centred success. 96px `green-tint` circle with a checkmark that draws itself (stroke-dashoffset 34 → 0 over 500ms, 180ms delay) inside a 500ms scale-pop. "You are booked" (Figtree 800/26), the slot line and provider, then an inset card: "Show your Sahaya case number at reception. Rhea has sent the clinic your triage notes, allergies and insurance approval." with the case number "DL-4471" in Figtree 800/19. CTAs: "What will this cost?" (primary) and "Change time" (outlined, returns to picking).

Add to production: calendar write, a reminder notification, and a "get me there" handoff to Uber/Ola with the address prefilled.

---

### 9. Cost estimate — `/cost`

**Purpose:** Remove the fear of an unknown bill. This is the screen that differentiates the product.

**Layout:**

- **Dark hero card.** `night` fill, radius 10, blue radial glow bleeding from the top-right. "ESTIMATED TOTAL AT ASHOKA MULTISPECIALITY" overline, "₹6,040" (Figtree 800/40, -1.2px, white) with "≈ $69" beside it. Divider, then two figures side by side: "Insurance covers — 100%" (`green-bright`) and "You pay at the desk — ₹0" (white).
- **"Line by line"** — each row is a label + amount + USD equivalent, with a 6px progress bar beneath showing that line's share of the total. Bars animate `scaleX(0 → 1)` from the left over 700ms `cubic-bezier(.2,.8,.2,1)`, fill `blue`, track `#E7EAEF`.

| Line | ₹ | ≈ $ | Share |
|---|---|---|---|
| Consultation — general physician | 1,200 | 14 | 22% |
| Blood panel (CBC, CRP, malaria, dengue) | 2,400 | 28 | 44% |
| Abdominal ultrasound | 1,800 | 21 | 33% |
| Pharmacy — 5 day course | 640 | 7 | 12% |

- **Provenance note.** "These are the audited rates Sahaya negotiated with this hospital in March 2026. If the bill differs by more than 10%, we dispute it for you." This claim is the reason a traveller trusts the number. Only ship it if the company will actually honour it.
- CTA: "Check my insurance".

USD conversion should come from a live rate, cached daily, with the rate date visible on tap.

---

### 10. Insurance & claim — `/insurance`

**Purpose:** Prove coverage before treatment, then get the claim moving without paperwork.

**Layout:**

- **Policy card.** `night-2 → night` gradient, radius 10. "TRAVEL POLICY" overline, "Iberia Assist Global" (Figtree 700/18 white), "ACTIVE" badge (`green-bright` fill, `night` text, 11/700). Below: Policy no. "IA-882 4417 09" and Valid until "02 Sep 2026".
- **Upload, three states.**
  - *Idle:* dashed dropzone, 34px vertical padding. 44px `blue-tint` well with an upload glyph, "Photograph or attach a document" (14.5/600), "PDF or photo · we read the itemisation for you". Hover turns the border `blue` and the fill `#F7F9FF`.
  - *Busy:* white card. 22px spinner (2.5px ring, `blue` top, 800ms linear infinite), "Reading ashoka-invoice.pdf…", live percentage in `blue`. A 6px progress bar with a 180ms linear width transition. Below it two shimmer placeholder lines (`linear-gradient(90deg,#F1F3F7,#E4E7EC,#F1F3F7)`, 320px background-size, sweeping over 1200ms, second line 62% width with a 200ms delay) standing in for the OCR result being extracted.
  - *Done:* `green-tint-2` panel with `green-border`. Green check circle, "ashoka-invoice.pdf", "4 items read · ₹6,040 matched your estimate". Enters with a 350ms scale-pop.
- **Claim status stepper.** Four steps with connected dots: Documents received · Sahaya review · Insurer decision · Paid direct to hospital. Dot `green` when done, `blue` when active, `#D8DDE6` when pending, with a 300ms color transition; pending labels in `muted-3`. Connector: 1.5px `#E7EAEF`, 34px tall.
- CTA: "Ask Rhea about this claim" → Chat.

Production: real upload to storage, OCR/line-item extraction server-side, and claim status driven by insurer webhooks. Never store policy documents on the device.

---

### 11. Phrasebook — `/phrasebook`

**Purpose:** Get the traveller through the consultation when the doctor's English runs out — or when the pharmacist's does.

**Layout:** Header "Say it in Hindi", helper "Tap a phrase to show it full-screen to your doctor or pharmacist." Category pills: Symptoms · Allergies · Payment (`ink` fill when active).

**Phrase card.** White, `line` border, radius 9, 16px padding. English (14.5/600 `ink`), Hindi below in Noto Sans Devanagari 19px `blue`, then italic transliteration (12.5, `muted-2`).

**Content** (final):

*Symptoms*
- "I have had a fever for three days." / मुझे तीन दिन से बुखार है। / *Mujhe teen din se bukhaar hai.*
- "It hurts here, on the right side." / यहाँ दर्द है, दाईं तरफ। / *Yahaan dard hai, daayin taraf.*
- "I feel dizzy when I stand up." / खड़े होने पर चक्कर आता है। / *Khade hone par chakkar aata hai.*

*Allergies*
- "I am allergic to penicillin." / मुझे पेनिसिलिन से एलर्जी है। / *Mujhe penicillin se allergy hai.*
- "Please check before giving any injection." / कोई इंजेक्शन देने से पहले जाँच लें। / *Koi injection dene se pehle jaanch len.*

*Payment*
- "My insurance covers this. Here is my card." / मेरा बीमा यह कवर करता है। यह मेरा कार्ड है। / *Mera bima yah cover karta hai. Yah mera card hai.*
- "Can I have an itemised receipt?" / कृपया विस्तृत रसीद दें। / *Kripya vistrit raseed den.*

**Show-to-doctor overlay.** Tapping a phrase covers the screen with `blue`. "SHOW THIS TO THE DOCTOR" overline in `rgba(255,255,255,.6)`, the Hindi in Noto Sans Devanagari 600/34 white, the English below in `rgba(255,255,255,.72)`, and a "Done" button. Enters with a 300ms scale-pop. In production also force maximum screen brightness and prevent sleep while it is open, and add text-to-speech playback.

Language pairs should follow the destination and the device locale — Hindi for Delhi, but Marathi, Konkani, Tamil and Bengali for other regions. The three categories should extend to Directions and Pharmacy.

---

### 12. Medical profile — `/(tabs)/profile`

**Purpose:** The information a doctor needs in the first thirty seconds, kept current and shareable.

**Layout:** Header, then identity: 62px `blue` avatar with white initials, "Elena Márquez" (Figtree 800/21), "34 · Spain · passport XDA-8841" (12.5, `muted-2`).

**Facts table.** Blood group — O positive · Allergies — Penicillin, shellfish · Conditions — Asthma (mild, exercise-induced) · Daily medication — Salbutamol inhaler as needed · Vaccinations — Typhoid, Hep A, Tetanus 2025.

**Allergy notice.** `red-tint` panel, `red-border`, red "!" badge: "Penicillin allergy is flagged to every provider we book for you, in English and Hindi, before you arrive." This is a promise the backend has to keep — the booking payload must carry allergies to the provider.

**Emergency contacts.** Rows with a 38px initials avatar, name (14/600), relation or number (12, `muted-2`), and a "Call" affordance. Samples: Daniel Márquez (Partner · Madrid), Consulate of Spain, New Delhi (+91 11 4129 3000).

**Footer:** "View my visit records".

Production: every field here is sensitive personal health data. Field-level encryption, explicit consent before sharing with a provider, and an audit log of every share. Make the whole profile available offline and on the lock screen — it is useless if the phone is dead or the traveller is unconscious.

---

### 13. Visit records — `/(tabs)/records`

**Purpose:** Send the traveller home with a medical record their own doctor can read.

**Layout:** Header "Visit records", helper "Everything in English, ready to hand to your doctor at home."

**Visit cards.** Date (11.5/600 `blue`) + cost/coverage (11.5, `muted-3`) on one row, provider (Figtree 700/16.5), doctor (12.5, `muted-2`), then a divider and the diagnosis line (13.5, `#3D4757`). Samples: 18 Aug 2026, Ashoka Multispeciality, Dr. A. Menon, "Suspected bacterial infection — awaiting culture", ₹6,040 covered · 14 Aug 2026, Rosewood Care Clinic, Dr. P. Iyer, "Traveller's diarrhoea, resolved", ₹1,340 covered.

**Current prescription.** Rows with a blue dot, drug name (14/600) and dose (12, `muted-2`): Azithromycin 500 mg — 1 tablet daily · 5 days; Paracetamol 650 mg — as needed, max 4 daily; ORS sachets — 2 litres daily. Footer button inside the card: "Find a pharmacy that stocks these".

**Footer actions.** "Download PDF" (`ink` fill) and "Email to my GP" (outlined).

The pharmacy link implies a fourteenth screen the prototype does not include — a pharmacy finder with stock awareness. Worth scoping before build.

---

## Interactions & Behaviour Summary

| Trigger | Behaviour |
|---|---|
| Onboarding CTA | Advance step; on step 3 enter the app at Home |
| "Skip setup" | Straight to Home |
| Home emergency button | → Triage |
| Triage option tap | Record answer, advance; after 3 answers show the result |
| Triage "skip questions" | → Call |
| Result "Connect me" | → Call |
| Call mount | `dialing`; after 2800ms → `live` |
| Call live | Timer +1s per second; transcript line appended every 2600ms up to 4 lines |
| Call end (red) | → Home |
| Chat send (button or Enter) | Append outbound, clear input, typing indicator 1600ms, append reply |
| Chat quick reply | Fill the composer, do not send |
| Chat appointment card | → Booking |
| Search filter pill | Toggle; list filters live on open/cashless/query; empty state when nothing matches |
| Provider card | → Detail (sets the active provider) |
| Detail tab | Switch content with a 300ms rise |
| "Book a visit" | → Booking |
| Booking confirm | → Confirmed state with the checkmark draw |
| "Change time" | Back to picking, selection preserved |
| Upload dropzone | `idle` → `busy`, progress +7–16% every 160ms → `done` at 100% |
| Phrase card | Full-screen overlay; "Done" closes |
| Back button | Pop the navigation history stack |

**Standard animations** (reuse these three across the app rather than inventing new ones):
- **Rise** — `translateY(14px) → 0` + opacity, 350–600ms, `cubic-bezier(.2,.8,.2,1)`. Screen and card entrances.
- **Slide-in** — `translateX(26px) → 0` + opacity, 340–500ms, same curve. Sequential content (triage questions, carousels).
- **Pop** — `scale(.92) → 1.02 → 1` + opacity, 350–500ms. Confirmations and things arriving.

Respect `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled` by collapsing all three to a plain opacity fade. Keep the pulsing status dots and the call rings — they carry meaning — but slow them.

## State Model

From the prototype's logic class. Translate to zustand slices plus react-query for anything server-owned.

| State | Type | Purpose |
|---|---|---|
| `screen`, `hist` | string, string[] | Prototype's own router — replace with expo-router |
| `onbStep` | 0–2 | Onboarding step |
| `city` | string | Destination; drives provider preload |
| `tIdx`, `tAns` | number, string[] | Triage position and answers |
| `call` | `'dialing' \| 'live'` | Call phase |
| `secs`, `tsIdx` | number | Call timer, transcript position |
| `chat`, `draft`, `typing` | Message[], string, boolean | Conversation |
| `q`, `filters` | string, string[] | Search query and active filters |
| `provider` | Provider | Active provider for detail/booking/cost |
| `detailTab` | `'Overview' \| 'Costs' \| 'Reviews'` | |
| `bookStep`, `day`, `slot` | 0–1, string, string | Booking |
| `upload`, `pct` | `'idle' \| 'busy' \| 'done'`, number | Claim upload |
| `lang`, `phraseCat`, `bigPhrase` | string, string, Phrase \| null | Phrasebook |

**Server-owned, needs endpoints:** provider list with distance and live open/wait status · provider detail with doctors and audited price list · triage submission returning a severity band · case thread (realtime) · slot availability and booking · policy lookup and coverage check · claim upload with OCR result and status · medical profile · visit records and prescriptions · FX rate.

**Data model sketch:** `Trip` (city, dates) → `Case` (trip, triage result, coordinator, status) → `Message[]`, `Booking`, `Claim`, `VisitRecord`. `Provider` and `Doctor` are reference data with `languages[]`, `audited_prices[]`, `cashless_insurers[]`, `last_audited_at`. `MedicalProfile` hangs off the user, encrypted.

## Prototype Tweak Props

The design file exposes four props for demo purposes. They are not product features — don't port them.

- `startScreen` — which screen to open on
- `showNav` — hides the presentation sidebar
- `currency` — "INR + USD" or "INR only" (the underlying question *is* real: decide whether to always show the traveller's home currency)
- `emergencyStyle` — three treatments for the home emergency button: coral gradient (shipped), solid red, quiet outline. Worth A/B testing; the quiet variant may reduce accidental taps at the cost of findability.

## Assets

**None to hand over.** The prototype has no images. Everything is CSS.

You will need to source:
- **Icon set** — `lucide-react-native`. The prototype's abstract shapes mark where icons belong.
- **Fonts** — Figtree, Geist, Noto Sans Devanagari, all from Google Fonts via `expo-font`.
- **Map** — `react-native-maps` (Google provider is the practical choice in India).
- **Brand** — the "S" lockup is a placeholder. Replace with real brand assets.
- **Photography** — provider cards and detail headers would benefit from real clinic exteriors. The traveller is looking for a building they have never seen; a photo of the entrance is genuinely useful. Not in the prototype.

## Files

- `design/Sahaya.dc.html` — all 13 screens, the state model and the data. Read the template for layout and styling, the `class Component` block at the end for behaviour.
- `design/ios-frame.jsx` — presentation-only device bezel. Discard.

Open `Sahaya.dc.html` in a browser to click through the prototype before building.

## Suggested Build Order

1. Scaffold Expo + expo-router + nativewind, tokens in `tailwind.config.js`, `shadows.ts`, fonts loaded, `CLAUDE.md` written.
2. Primitives: Card, Button (3 variants), Pill, ListRow, Overline, Avatar, Badge, the three animation wrappers.
3. Static screens against mock data: Home, Search, Provider detail, Medical profile, Records.
4. Stateful flows: Triage, Booking, Phrasebook.
5. Real-time: Call, Chat.
6. Backend integration, then Insurance and Cost against live data.
7. Native capability: location, camera, notifications, dialing.
8. Accessibility pass — dynamic type, screen reader labels, reduced motion, offline medical profile.

## Two Things To Settle Before Building

1. **Triage is a clinical decision, not a UI flow.** The severity logic needs clinical sign-off and a documented escalation path. The prototype's version is illustrative only.
2. **"Verified" needs a definition the company can defend.** The prototype claims credentialling, language capability and audited pricing, with a bill-dispute promise attached. Each of those is an operational commitment with legal exposure. Fix the definition before it appears in the UI.

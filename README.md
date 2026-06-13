# QuestionPro · Office Requests

Monorepo for the office help-request PWA. See the **[design handoff](#handoff-office-request-notification-system-with-forward-request)** below for product/UX spec, [`plan.md`](./plan.md) for the implementation plan, and GitHub issues for the build phases.

## Stack

- **Web** (`apps/web`) — Vite + React 19 + TypeScript PWA
- **API** (`apps/api`) — NestJS 10
- **Shared** (`packages/shared`) — domain types + constants used by both
- **DB** — PostgreSQL (Docker)
- **Monorepo** — pnpm workspaces

## Prerequisites

- Node ≥ 20, pnpm ≥ 11, Docker + Docker Compose

## Development setup

```bash
pnpm install            # install all workspaces
cp .env.example .env    # then fill in secrets (Google OAuth, FCM, …)

pnpm db:up              # start PostgreSQL (docker)
pnpm dev                # build shared, then run api + web concurrently
```

- Web: http://localhost:5173
- API: http://localhost:3000 (health check: `/health`)
- Vite proxies `/api` and `/sse` → API, so the app is single-origin in dev.

> If port `5432` is taken by a local Postgres, set `POSTGRES_PORT` in `.env` (e.g. `5433`).

## Useful scripts

| Command | What |
|---------|------|
| `pnpm dev` | Run shared (watch) + api + web together |
| `pnpm build` | Build shared, api, web |
| `pnpm build:shared` | Build only `@office/shared` |
| `pnpm db:up` / `pnpm db:down` | Start / stop PostgreSQL |

## Layout

```
apps/web        Vite React PWA (employee / staff / admin shells)
apps/api        NestJS API (auth, requests, assignment, sse, push, reminders, admin)
packages/shared Types + constants (TYPES, LOCATIONS, icon maps)
docker-compose.yml  Postgres (dev)
```

---

# Handoff: Office Request Notification System (with Forward Request)

## Overview

This is an internal **office help-request system**. Anyone in the office (the *requester*) raises a request — tea/coffee, a snack, office supplies, printer/IT help, or general assistance — from a web app. The moment it's sent, the targeted **office helper** receives an instant push notification on their phone and a card appears in their task list. The helper accepts the request, works on it, and marks it done. The requester watches live status (Sent → Accepted → Completed).

The headline feature of this handoff is **Forward request**: when a new request arrives, the helper can either **Accept** it or **Forward** it to another helper if they're busy. Forwarding reassigns the request to the chosen helper, who then sees it on their own phone tagged "Forwarded by".

The product is **bilingual**: the staff-facing phone UI is **Bangla-first with English subtitles**; the requester web app is English-first. Keep all strings translatable.

---

## About the Design Files

The files in this bundle are **design references created in HTML** — an interactive prototype showing the intended look, copy, and behavior. **They are not production code to copy directly.**

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native Android/iOS, etc.) using its established components, state management, and styling patterns. If no codebase exists yet, choose the most appropriate stack for the product and implement the designs there.

In particular:

- The prototype simulates **two devices on one screen** (a desktop browser for the requester, an Android phone for the helper) purely for demonstration. In production these are **two separate surfaces**: a web/desktop app for requesters and a mobile app (or mobile-web/PWA) for helpers. Build them as such.
- The phone "device frame" and browser "window chrome" in the prototype are demo scaffolding — **do not** reproduce the bezels/traffic-lights; build the actual screens.
- Real-time delivery (push notification, live status) is faked with in-memory state and a chime. In production this needs a backend with push notifications (FCM/APNs) and live updates (WebSocket/SSE/polling).

## Fidelity

**High-fidelity (hifi).** Colors, typography, spacing, copy, and interactions are final and intentional. Recreate the UI faithfully using the codebase's existing component library, mapping the tokens below to its equivalents. This product uses the **QuestionPro design system** (Wick UI) — if the target codebase already has it, use those components (`WuButton`, `WuCard`, `WuChip`, etc.); otherwise reproduce the tokens listed under **Design Tokens**.

---

## Roles & Domain Model

**Actors**

- **Requester** — raises requests. Demo user: *Tanvir Ahmed*.
- **Office helper** (staff) — receives, accepts, forwards, and completes requests. Demo helpers:
  - *Karim* (Bangla: করিম, initial ক, brand color `#1B87E6`)
  - *Jamal* (Bangla: জামাল, initial জ, brand color `#227700`)

**Request object**

```
{
  id,
  type,         // 'tea' | 'snack' | 'supply' | 'printer' | 'help' | 'other'
  requester,    // display name
  note,         // free text + comma-separated quick-option tokens
  urg,          // 'normal' | 'urgent'
  loc,          // location id
  assignee,     // helper id, or null = "anyone available"
  status,       // 'new' | 'progress' | 'done'
  forwardedBy,  // helper id who forwarded it (set on forward), else absent
  acceptedBy, acceptedAt,
  doneBy, doneAt,
  createdAt
}
```

**Helper availability** — per helper, one of: `available` (উপলব্ধ, green `#227700`), `busy` (ব্যস্ত, amber `#9F6000`), `away` (অনুপস্থিত, gray `#9B9B9B`).

**Request types** (icon = Google Material Symbols Rounded name; in production use the Wick `wm-*` icon font equivalent):


| key     | icon          | English           | Bangla           | tile bg / fg          |
| ------- | ------------- | ----------------- | ---------------- | --------------------- |
| tea     | `local_cafe`  | Tea / coffee      | চা / কফি         | `#FEEFB3` / `#9F6000` |
| snack   | `tapas`       | Chanachur makha   | চানাচুর মাখা     | `#FFE2C2` / `#B5651D` |
| supply  | `inventory_2` | Office supplies   | অফিস সামগ্রী     | `#CCF0FF` / `#215694` |
| printer | `print`       | Printer / IT help | প্রিন্টার / আইটি | `#E1F0FB` / `#1B87E6` |
| help    | `handyman`    | Assistance        | সহায়তা          | `#DFF2BF` / `#227700` |
| other   | `add_circle`  | Something else    | অন্যান্য         | `#F5F5F5` / `#545E6B` |


Each type carries a list of **quick-option chips** that pre-fill the note (e.g. tea → "No sugar / Milk tea / Green tea"; printer → "Paper jam / Out of toner / Not printing"). See `TYPES` in the prototype's logic class for the full lists.

---

## Screens / Views

### A. Requester web app

**A1 — Dashboard** (`requests.questionpro.internal/orders`)

- **Purpose:** requester creates requests and tracks them.
- **Layout:** solid dark-blue app header (`#1B3380`, 56px tall) over a light-gray content canvas (`#F5F5F5`-ish), max content width ~1440px, page padding ~24–28px.
- **Components, top to bottom:**
  1. **Header:** product mark + "QuestionPro · Office Requests" (white text); right side "Install app" outline pill + avatar circle (`TA`, electric-blue fill).
  2. **Title block:** "Office requests" (Heading-01, 32/40), subtitle "Manage and track everything you've asked the office team for." (gray `#545E6B`).
  3. **Success toast** (conditional): green pair — text `#227700` on `#DFF2BF`, 1px `#BFE08F` border, 8px radius, `check_circle` icon. Auto-dismisses ~4.2s after sending.
  4. **Stat grid:** 4 white cards (1px `#D8D8D8`, 10px radius, 16px padding) — Open / In progress / Completed / Avg. response. Big number 36/44 dark-blue, tiny qualifier gray.
  5. **Office team card:** lists each helper with avatar, name, "Office helper" sublabel, and an availability chip (soft bg + deep text + colored dot). Header shows "N of M available now".
  6. **Make a request:** 3-column grid of category tiles (icon tile 46px @ 11px radius + EN/BN labels). Hover: border → electric blue + small shadow. Click opens the **Create modal**.
  7. **Today's requests:** request rows (see row spec below) + "See all →" link to the All-requests view.

**A2 — All requests view**

- Sticky white header: back button (38px, 9px radius, 1px border), "All requests" (Heading-02, 24/32), "Your complete request history · N total".
- Filter pills row: All / Waiting / In progress / Completed (active = electric-blue text on `#EEF6FE` with electric-blue border; inactive = gray on white).
- Rows grouped by day with uppercase gray day labels (Today / Yesterday / date). Empty state: inbox icon + "No requests match this filter".

**Requester request row** (used in A1 and A2)

- White card, 1px `#D8D8D8`, 10px radius, 16px padding, flex row.
- Left: type icon tile. Middle: type name (Heading-04, 16/24, medium), meta line (location · note · time, gray 13px), assignment line with electric-blue person icon — "For " or "For anyone available".
- Right: status chip — Waiting (`#FEEFB3`/`#9F6000`), In progress (`#CCF0FF`/`#215694`), Completed (`#DFF2BF`/`#227700`); 4px radius.
- Below: a **3-step progress tracker** — Sent / Accepted / Completed. Done steps = green `#227700` filled dot with `check`; current step = white dot with 2px electric-blue ring + `more_horiz`; future = gray dot. Connecting lines turn green as steps complete. Each step shows a clock time when reached.

### B. Create-request modal

- Centered modal, 460px wide, white, 16px radius, large soft shadow `0 10px 40px rgba(27,51,128,.15)`, scrim `rgba(26,26,26,.45)`.
- **Header:** type icon tile + "New request" (Heading-03) + " · " + close button.
- **Body fields:**
  - **Where should it go?** — `<select>` of locations (3F · Dev desk, 4F · Meeting room, Reception, 2F · Pantry).
  - **Assign to** — option buttons: "Anyone available" (groups icon) + one per helper (person icon + colored avatar + availability status line). Selected = electric-blue border + `#EEF6FE` fill.
  - **How soon?** — two buttons: Normal (`schedule`, electric-blue when active) / Urgent (`priority_high`, red `#CC0000` when active, `#FFF1F1` fill).
  - **Quick options** (conditional on type) — chips that toggle into the note; selected chip = electric-blue border/fill + `check` icon, unselected = `add` icon.
  - **Note** — textarea, auto-filled by quick options, free-text editable.
- **Footer:** Cancel (outline neutral) + Send request (primary, `send` icon). On send: creates the request, shows the success toast, fires a push notification + chime to the assignee's phone (or to "anyone" if unassigned), shakes the phone, switches the phone to the New tab.

### C. Helper phone app (Bangla-first)

**Persistent chrome (top → bottom):**

1. **Helper switcher** (demo only — lets you view either helper's phone): pill buttons per helper with mini avatar + name. *In production this is just the logged-in helper; drop the switcher.*
2. **Phone header** (dark-blue): greeting "শুভেচ্ছা, " + "আজকের অনুরোধ" (Today's requests) + a **notification bell** with a red unread count badge (`#CC0000`).
3. **My availability** control: three segmented buttons — উপলব্ধ / ব্যস্ত / অনুপস্থিত (Available / Busy / Away). Active = that status's soft bg + deep color + border + dot.
4. **Tabs:** নতুন (New) / চলছে (In progress) / সম্পন্ন (Completed), each with a count badge. Active tab = electric-blue fill, white text.
5. **List** of request cards for the active tab, filtered to what's visible to this helper (see Visibility rules).

**Helper request card**

- White, 1px `#D8D8D8`, 14px radius, subtle shadow; a **5px left stripe** colored red `#CC0000` when urgent (else transparent).
- Top row: type icon tile (54px @ 13px radius) + Bangla type name (20/24, medium) + status pill (নতুন/জরুরি/চলছে/সম্পন্ন) ; below it the English type name and an **assignee chip** ("→ " on `#E1F0FB`/`#1B87E6`, or "যে কেউ · Anyone" on gray).
- Detail lines (gray-lead, with icons): location (`location_on`), note (`sticky_note_2`, conditional), **forwarded-by line** (`forward`, electric-blue, conditional — " থেকে · Forwarded by "), time ago + requester (`schedule`).
- **Action area** (varies by status — this is the core of the Forward feature):
  - **status = new** → a **two-button row**:
    - **Accept** — `check_circle`, electric-blue `#1B87E6` filled, white text. Label "গ্রহণ করুন / Accept" (or "গ্রহণ / Claim & accept" when the request is unassigned/"anyone"). Each button: `flex:1`, min-height 54px, 12px radius, icon 22px + two-line label (16/19 medium over 11/13 @ 0.85 opacity sub).
    - **Forward** — `forward`, white background, 1px `#D8D8D8` border, electric-blue text. Label "ফরওয়ার্ড / Forward". Hover: `#F5F9FE` bg + electric-blue border.
  - **status = new, Forward tapped** → the buttons are replaced by an **inline Forward picker** (see below).
  - **status = progress** → single full-width **Mark as done** button — `task_alt`, green `#227700` filled, "সম্পন্ন করুন / Mark as done".
  - **status = done** → static "সম্পন্ন · Completed" confirmation band (green pair, `task_alt`).

**Forward picker (inline, within the card)** — the new UI:

- Separated from the card body by a top hairline (`#EEEEEE`), 13px top padding, vertical stack.
- Header row: label "কাকে দেবেন? · Forward to" with a `forward` icon, plus a small close (✕) button that cancels back to the two buttons.
- One **target row per other helper** (everyone except the current helper): 1px-bordered white button, 11px radius, containing — avatar (36px, helper's color, initial) + name (Bangla 16/19 medium) + " · Office helper" sublabel + an **availability status chip** (soft bg + deep text + dot: Available/Busy/Away). Hover: electric-blue border + `#F7FBFE` bg.
- Empty fallback: "কোনো অন্য সহায়ক নেই · No other helpers".
- Tapping a target **forwards** the request to that helper.

**Confirmation banner** — after a successful forward, a banner appears at the top of the list: `forward_to_inbox` icon on `#E1F0FB` / 1px `#BBD9F2`, two lines "-কে পাঠানো হয়েছে" / "Forwarded to ", auto-dismiss ~3.8s.

**D. Push notification (heads-up)** — when a new request targets this helper: a floating card slides in at the top of the phone (animation `qp-notif-in`, 0.38s, plus a pulsing ring on the app glyph). Shows app name, "now", type icon, "নতুন অনুরোধ · New request", " — ", and two buttons: **দেখুন · View** (outline) and **গ্রহণ · Accept** (electric-blue). Auto-dismisses after ~7s. A two-tone chime plays (Web Audio, 784→1175 Hz). *(The notification currently offers View/Accept; Forward lives in the list card. Optional enhancement: add Forward here too.)*

---

## Interactions & Behavior

**Create → notify flow:** Send request → append request (`status:'new'`) → success toast on web → push notification + chime on the assignee's phone (or any helper if unassigned) → phone shakes (`qp-shake`, ~0.55s) → phone switches to New tab.

**Accept:** sets `status:'progress'`, `acceptedBy = current helper`, `acceptedAt = now`; dismisses the matching notification; clears any open forward picker. The card moves to the In-progress tab; the requester's tracker advances to "Accepted".

**Forward (new feature):**

1. Tap **Forward** on a new card → that card enters "forwarding" mode (`forwardingId = request.id`), showing the picker; other cards are unaffected.
2. Tap **✕** or switch tab/helper → cancels (`forwardingId = null`).
3. Tap a **target helper** →
  - `request.assignee = targetId`, `request.forwardedBy = current helper`.
  - `forwardingId = null`; dismiss the matching notification if any.
  - Show the confirmation banner ("Forwarded to ") for ~3.8s.
  - The request leaves the current helper's list and appears on the **target helper's** New tab, showing the "Forwarded by " line. The requester's web row updates "For " automatically.
4. Forwarding does **not** change status (stays `new`) or urgency; the target still Accepts/Forwards/—.

**Complete:** sets `status:'done'`, `doneBy`, `doneAt`; card moves to Completed; tracker reaches "Completed".

**Availability:** changing the segmented control sets the current helper's status; reflected in the web Office-team card, the Assign-to options, and the Forward-picker target rows.

**Visibility rules (what shows on a given helper's phone):**

- New tab: requests with `status:'new'` AND (`assignee == thisHelper` OR `assignee == null`).
- In-progress tab: `status:'progress'` AND `acceptedBy == thisHelper`.
- Completed tab: `status:'done'` AND `doneBy == thisHelper`.
- New-tab sort: urgent first, then oldest-first. In-progress: by `acceptedAt`. Completed: most-recently-done first.

**Motion:** restrained — short fades/slides (~150–250ms), the notification slide-in, the shake, and the pulsing ring. No bounces or decorative loops.

**Responsive / i18n:** phone UI is Bangla-first with English subtitles; keep strings translatable and layouts direction-agnostic (the design system is RTL-aware). Numbers in the phone UI are rendered in Bangla digits (০–৯) for counts and "time ago".

---

## State Management

Needed state (the prototype keeps it all in one component; map to your store/services):

- `requests[]` — the request objects above (source of truth; back with an API + real-time updates in production).
- `availability` — map of helperId → `available|busy|away`.
- `activeStaff` — *demo only* (which helper's phone is shown); in production = the authenticated helper.
- `phoneTab` — `new|progress|done`.
- `**forwardingId`** — id of the request currently showing its Forward picker, or null (drives the picker open/close; reset on accept, forward, tab switch, helper switch).
- `**phoneToast**` — `{bn, en}` for the forward confirmation banner, or null (auto-clears ~3.8s).
- `notif` — the active heads-up notification payload, or null (auto-clears ~7s).
- `toast` — web success toast text (auto-clears ~4.2s).
- `createType`, `locSel`, `urg`, `note`, `assignee` — Create-modal form state.
- `webView` (`dashboard|all`), `allFilter` — requester web navigation.
- `now` — ticking clock (1s interval) for live "time ago" / elapsed.

**Data/back-end requirements (production):** persist requests; push notifications to the assignee (and to all eligible helpers when `assignee == null`); real-time status sync so the requester's tracker and every helper's list stay current; on forward, re-target the push to the new assignee.

---

## Design Tokens

**Brand**

- Dark blue `#1B3380` (app header, strong text, primary surfaces)
- Electric blue `#1B87E6` (primary buttons, links, interactive, selected)
- Amber `#F5A300` (upgrade/payment CTAs only — not used in this feature)

**Grays** (warm-neutral ramp): lead text `#545E6B`, `#9B9B9B` (disabled/away), borders `#D8D8D8` (default), `#E8E8E8`/`#EEEEEE` (dividers / sidebar), surfaces `#F5F5F5`. Black text `#1A1A1A`.

**Semantic notification pairs** (deep text / soft bg):

- Success `#227700` / `#DFF2BF`
- Warning (busy/in-progress) `#9F6000` / `#FEEFB3`
- Info (forwarded/assignee) `#215694` (or `#1B87E6`) / `#E1F0FB` / `#CCF0FF`
- Danger (urgent) `#CC0000` / `#FFBABA` / `#FFF1F1`

**Typography** — **Fira Sans** only; weights **300 / 400 / 500** (no bold). Scale: Display-01 48/56 (300), Display-02 40/48 (400), Heading-01 32/40 (400), Heading-02 24/32 (400), Heading-03 18/32 (500), Heading-04 16/24 (500), body/subtitle/**button** all 400. Body color `#545E6B`.

**Spacing** — minimal 0/1/2/4px (hairlines), baseline 8/12/16/24/32px (most padding/gaps), large 40→104px (section separation). Most component padding lands on 8/12/16.

**Radii** — chips/small inputs 2–4px; default buttons/cards/dropdowns 6–8px; modals/large panels 12–16px; pill 9999px (avatars, chips, segmented buttons). Helper cards 14px; action buttons 12px; target rows 11px.

**Elevation** — flat-with-border at rest; small shadow for dropdowns/popovers; modal `0 10px 40px rgba(27,51,128,.15)`; notification `0 14px 36px rgba(27,51,128,.30)`. Shadows tinted toward brand blue, never hard black.

**Focus** — 3px translucent electric-blue ring; 2px electric-blue active/selected outline.

---

## Assets

- **Icons:** prototype uses **Google Material Symbols Rounded** (CDN) as a stand-in. Names used: `local_cafe, tapas, inventory_2, print, handyman, add_circle, check_circle, forward, forward_to_inbox, task_alt, schedule, priority_high, location_on, sticky_note_2, notifications, person, groups, close, arrow_back, arrow_forward, deployed_code, install_mobile, send, restart_alt, inbox`. **In production, map these to QuestionPro's proprietary Wick icon font (`wm-`* / `wc-*`).**
- **Font:** Fira Sans (Google Fonts in the prototype; use the licensed Fira Sans in production).
- **Logo:** "QP" placeholder mark — replace with the real QuestionPro wordmark/logo.
- No photography or raster images are used.
- The chime is generated at runtime via Web Audio (no audio file).

---

## Files

In this bundle (design references — recreate, don't ship as-is):

- `Office Request System.dc.html` — the full interactive prototype (markup + logic). The Forward feature lives in: the helper request-card action area, the inline Forward picker, and the `forward()` / `startForward()` / `cancelForward()` methods + `forwardingId` / `phoneToast` state and the `phoneRequests` view-model in the logic class.
- `android-frame.jsx`, `browser-window.jsx` — demo-only device/window chrome (do not reproduce in production).
- `support.js` — the prototype's runtime; not part of the design.

To explore the prototype's behavior, open `Office Request System.dc.html` in a browser: create a request, then on a helper's phone tap **Forward** on a new card, pick the other helper, and switch phones to see it arrive tagged "Forwarded by …".
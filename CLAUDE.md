# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

QuestionPro Office Requests — an internal office help-request PWA. Employees raise requests (tea, snacks, supplies, printer/IT, assistance); office staff get instant push + an in-app card, then accept / **forward** / complete. Employees watch live status (Sent → Accepted → Completed). Staff UI is **Bangla-first with English subtitles**; employee UI is English-first. All copy must stay translatable.

## Commands

```bash
pnpm install            # all workspaces
cp .env.example .env     # fill secrets before running api features that need them
pnpm db:up               # start PostgreSQL (docker); db:down to stop
pnpm dev                 # build shared, then run api (:3000) + web (:5173) concurrently
pnpm build               # build shared → api → web
pnpm build:shared        # rebuild only @office/shared (do this after editing it)
```

- API health: `GET http://localhost:3000/health`. Web dev server proxies `/api` and `/sse` → API, so the app is single-origin.
- If port `5432` is taken by a local Postgres, set `POSTGRES_PORT` in `.env` (compose maps `${POSTGRES_PORT:-5432}:5432`).
- Per-app: `pnpm --filter @office/web <script>`, `pnpm --filter @office/api <script>`.
- **No test runner is wired yet.** When adding one, document the single-test invocation here.

## Architecture

pnpm-workspace monorepo, three packages:

- **`packages/shared`** (`@office/shared`) — domain types + hardcoded v1 constants used by both apps. Single source of truth for `User`/`Request` shapes, enums, `LOCATIONS`, `TYPES` (request-type labels/colors/quick-chips), `AVAILABILITY_COLORS`, `STAFF_BRAND_PALETTE`, and the icon name maps (`REQUEST_TYPE_ICONS`, `UI_ICONS`).
- **`apps/api`** (`@office/api`) — NestJS 10. Planned modules (plan §12): `auth, users, requests, assignment, sse, push, reminders, admin`. Single origin serves API + SSE + static PWA in production.
- **`apps/web`** (`@office/web`) — Vite + React 19 PWA. Role shells live under `src/shells/{employee,staff,admin}` (added per phase). shadcn/ui + Tailwind v4.

Data flow: web → REST + SSE → NestJS → PostgreSQL. Assignment router decides push targets; reminders run on a cron. See `plan.md` §2 (architecture) and §13 (API sketch).

### Critical conventions & gotchas

- **`@office/shared` emits ESM** — relative imports inside it **must** use explicit `.js` extensions (`export * from "./types.js"`). `tsc` does not add them and native Node ESM resolution fails without them. Rebuild shared (`pnpm build:shared`) after any change before apps pick it up.
- **Design tokens** live in `apps/web/src/index.css` as a Tailwind v4 `@theme` block, mapped 1:1 from README §Design Tokens. shadcn semantic names (`--color-primary` = electric blue `#1B87E6`, etc.) sit on top. Do not hardcode hex in components — use the tokens.
- **Icons** are tree-shaken local SVG components (no CDN). `apps/web/scripts/gen-icons.mjs` vendors Material Symbols Rounded glyphs from `@material-symbols/svg-400` into `src/icons/material-symbols/`. Use `<Icon name="..."/>` / `<TypeIcon type="..."/>` (`src/components/Icon.tsx`). The **swap point** to a different icon set is `ICON_REGISTRY` in `src/icons/material-symbols/index.ts`. To add an icon: add its name to `ICON_NAMES` in the codegen script and re-run it. Beware: `SVGProps` carries an optional `name` — spread props *before* `name={...}` so it isn't clobbered.
- **DB layer uses Prisma** (chosen over TypeORM).
- **Bangla** glyphs currently render via system-font fallback (Fira Sans has no Bengali subset). Revisit before the staff UI (Phase 3) if rendering is poor.

## Reference docs (local-only, gitignored)

Not committed — keep these locally; they are the build's source of truth:

- `plan.md` — implementation plan: phases, API sketch, domain model, assignment logic, env vars, decisions log.
- `Office Request System.dc.html` — interactive prototype. **Canonical** for `TYPES` constant, exact Bangla copy, forward flow, chime, animations.
- `README.md` — design handoff (tokens, screen specs §A/B/C/D, motion) + dev quickstart.

When a value is ambiguous, the prototype wins for copy/behavior, README for visual tokens, plan for architecture.

## Workflow

Work is tracked as GitHub issues (`khairul-anik-qp/qpbd-office`, 23 issues across Phase 0–6). One issue per branch: `phase-N/issue-M-slug` off `main` → implement → verify acceptance criteria → commit with `Closes #M` → PR → squash-merge `--delete-branch` → sync main.

- **`gh` is old (2.4.0)** — no `gh label` subcommand. Manage labels via `gh api repos/<repo>/labels`.
- Commit messages: keep the body short; end with the `Co-Authored-By` trailer. (Long heredoc bodies passed inline to the shell have failed silently here — prefer concise messages.)
- Verify UI changes in a real browser (Chrome DevTools MCP) against the README spec before merging — past acceptance checks confirmed exact values like the modal shadow `0 10px 40px rgba(27,51,128,.15)`.

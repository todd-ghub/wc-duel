# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build`. Type errors fail the build (there is no separate lint/test step).
- `npm run preview` — serve the production build locally.
- `npm run fetch` — call football-data.org and rewrite `public/data/matches.json`. Reads `FOOTBALL_DATA_AK` from `.env`. Use `npm run fetch:ci` in CI (no `--env-file`).
- There is no test suite. Verify scoring changes by re-running `npm run fetch` (or hand-editing `public/data/matches.json`) and exercising the UI.

The build base path is controlled by `VITE_BASE` (defaults to `/`); GitHub Actions sets it to `/<repo>/` for project Pages.

## Architecture

**No backend at runtime.** The football-data.org API key never reaches the browser. Two paths can refresh the data file the app reads:

1. `scripts/fetch-data.mjs` runs server-side (locally or in the GitHub Action on a `*/10` cron) and commits/deploys `public/data/matches.json`.
2. Optional AWS SAM stack in `infra/` runs a Lambda every 3 minutes that writes `matches.json` to a public S3 bucket. The client points at it via the build-time `VITE_DATA_URL` env var (see `src/lib/useData.ts`).

`useData` hydrates from `localStorage` first, then revalidates over the network, polls every 60s, and refetches on `visibilitychange`. A Workbox service worker (`vite-plugin-pwa`) layers `NetworkFirst` over `matches.json` and `CacheFirst` over team crests so the app works offline.

**Data flow.** `fetch-data.mjs` trims the football-data.org payload to the exact shape in `src/lib/types.ts` (`DataFile` → `Match[]`). The client never sees the raw API. The scoring engine in `src/lib/scoring.ts` is pure: it takes `Match[]` and returns per-team and per-owner standings + per-match contributions for History.

**Game configuration is centralized.** `src/config.ts` is the only file users editing their own game should touch:
- `OWNERS` — two-element tuple of `OwnerConfig` (id, label, optional short badge, color gradient). Labels default to `VITE_PLAYER1_NAME` / `VITE_PLAYER2_NAME`.
- `DRAFT` — TLA list per owner.

`src/data/teams.ts` joins `config.ts` with the canonical 48-team field in `src/data/field.ts` to produce `DRAFT`, `DRAFT_BY_TLA`, and `OWNER_IDS`. In dev it logs console errors for unassigned / duplicated / unknown TLAs. The `Owner` type is derived from the `OWNERS` ids — referencing players anywhere outside `config.ts`/`teams.ts` uses these ids, never display names.

> Note: `OWNERS[].id` and the keys of `DRAFT` must match. If you rename owner ids in `config.ts`, update the `DRAFT` keys too (the file currently uses `Player1`/`Player2` for ids and `PLAYER1`/`PLAYER2` for draft keys — bring them into sync before relying on type safety).

**Scoring rules.** Implemented in `src/lib/scoring.ts` and specified in `RULES.md`. Key points:
- `multiplierForRankDiff` maps the signed differential `myRank − opponentRank` to a bonus tier; only the lower-ranked underdog (positive diff) earns a bonus.
- `Base = ResultPts + CleanSheetPts + 0.15·GoalsFor − 0.10·GoalsAgainst`. Final is `Base · (1 + multiplier)` when positive, else `0` (no negatives).
- `isScorable` gates everything: status must be `FINISHED`, both TLAs in `DRAFT_BY_TLA`, and both scores present. Knockout TBDs are silently ignored until teams are assigned.

**UI shell.** `src/App.tsx` is a single-page PWA with a `TabBar` switching between four screens (`Dashboard`, `Schedule`, `Teams`, `History`) under `src/screens/`. Shared atoms live in `src/components/`. Styling is Tailwind v4 via `@tailwindcss/vite`; animations use `motion/react`.

## Env vars

- `FOOTBALL_DATA_AK` — server-side only; required for `npm run fetch` and the Lambda.
- `VITE_DATA_URL` — optional absolute URL for `matches.json` (e.g. the S3 endpoint). When unset, the client loads the bundled file.
- `VITE_PLAYER1_NAME`, `VITE_PLAYER2_NAME` — optional display names; keeps real names out of the committed config.
- `VITE_BASE` — set by the deploy workflow for project Pages; leave unset locally.

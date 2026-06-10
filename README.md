# WC Duel 2026 🏆

A little installable phone app for a two-player World Cup watch game. The whole
48-team field is split between two players; each team earns points based on how
it performs, and the app keeps the running tally and shows who's ahead. Scoring
rules live in [RULES.md](RULES.md).

- **Scoreboard** — total points per player, who's leading, and live games.
- **Schedule** — every upcoming match, grouped by day, with kickoff times.
- **Teams** — all 48 teams and the points each has banked, grouped by player.
- **History** — every finished match; tap one to see exactly how points were scored.

Built as an installable PWA (Add to Home Screen on iPhone/Android), works offline
once opened, and runs entirely on free hosting — no server to maintain.

___
Custom
---

## Quick start

```bash
npm install
cp .env.example .env        # then add your football-data.org API key (see below)
npm run fetch               # pull the latest fixtures/scores into public/data/matches.json
npm run dev                 # open the printed http://localhost URL
```

`npm run build && npm run preview` serves the production build the same way it
runs in the cloud.

### Get a football-data.org API key

Scores come from [football-data.org](https://www.football-data.org). The free tier
is enough for this app.

1. Register at <https://www.football-data.org/client/register>.
2. Copy the API token from the confirmation email / your account page.
3. Put it in `.env`:
   ```
   FOOTBALL_DATA_AK=your_key_here
   ```

The key is only ever used **server-side** (the fetch script and CI). It is never
shipped to the browser — see [How scores work](#how-scores-work-no-backend).

---

## Set up your own game

Everything you'd want to change lives in **one file**: [`src/config.ts`](src/config.ts).
You shouldn't need to touch any TypeScript types, CSS, or components.

### 1. The two players

```ts
export const OWNERS = [
  { id: "PLAYER1", label: import.meta.env.VITE_PLAYER1_NAME ?? "Player 1", color: ["#3b82f6", "#6366f1"] },
  { id: "PLAYER2", label: import.meta.env.VITE_PLAYER2_NAME ?? "Player 2", color: ["#2dd4bf", "#10b981"] },
] as const satisfies readonly [OwnerConfig, OwnerConfig];
```

- `id` — a stable internal key; never shown to users. Leave as `PLAYER1`/`PLAYER2` or rename.
- `label` — the display name. By default it reads from `.env` so real names stay
  out of committed code. Set them in `.env`:
  ```
  VITE_PLAYER1_NAME=Alex
  VITE_PLAYER2_NAME=Sam
  ```
  (Or just hard-code the `label` string if you don't care about that.)
- `color` — the `[from, to]` gradient that is the player's visual identity.
- `short` *(optional)* — the one-letter badge on match cards. Omitted by default,
  so it falls back to the display name's initial.

### 2. Draft the teams

```ts
export const DRAFT: Record<Owner, string[]> = {
  PLAYER1: ["POR", "BRA", "NED", /* … */],
  PLAYER2: ["FRA", "ESP", "ARG", /* … */],
};
```

List every team's three-letter code (TLA) under whichever player drafted it. The
full TLA ↔ country list (with FIFA ranks) is in [`src/data/field.ts`](src/data/field.ts)
— that's fixed tournament data you don't need to edit. In dev mode the app logs a
clear console error if any team is **unassigned, duplicated, or unknown**, so
setup typos are easy to catch.

> FIFA ranks (used for the underdog bonus multiplier in [RULES.md](RULES.md)) are
> the pre-tournament values and live in `src/data/field.ts`.

---

## How scores work (no backend)

football-data.org doesn't allow direct calls from a browser (CORS), so a tiny Node
script ([`scripts/fetch-data.mjs`](scripts/fetch-data.mjs)) calls the API
**server-side** and writes a trimmed `public/data/matches.json`. The app reads that
JSON and does all the points math in the browser ([`src/lib/scoring.ts`](src/lib/scoring.ts)).
**The API key is never shipped to the browser** — it lives in `.env` locally and as
a secret in CI.

There are two ways to keep the JSON fresh; pick one:

- **GitHub Action (default, ~10 min)** — re-runs the fetch on a schedule and
  redeploys. Good enough for most.
- **AWS SAM pipeline (optional, ~3 min)** — a serverless stack in [`infra/`](infra)
  publishes `matches.json` to S3 every 3 minutes. After deploying it, point the app at
  the stack's S3 URL via the `VITE_DATA_URL` setting (see
  [Where match data comes from](#where-match-data-comes-from) below). Full deploy
  steps are in [`infra/README.md`](infra/README.md). Stays within the AWS free tier.

If you set neither, the app simply serves whatever `matches.json` was bundled at
build time (re-run `npm run fetch` and rebuild to refresh).

### Where match data comes from

The app decides at **build time** where to load `matches.json` from
([`src/lib/useData.ts`](src/lib/useData.ts)):

- **`VITE_DATA_URL` set** → fetches from that absolute URL (e.g. the AWS S3 live
  endpoint).
- **unset (default)** → uses the bundled `data/matches.json` shipped with the build.

It's the **same variable name everywhere** — set it wherever your build runs:

| Where you build | Set this |
| :-- | :-- |
| Local dev / `npm run build` | `VITE_DATA_URL` in `.env` |
| GitHub Pages (Actions) | repo **variable** `VITE_DATA_URL` (Settings → Secrets and variables → Actions → **Variables**) |
| Netlify / Vercel / Cloudflare / AWS Amplify | build env var `VITE_DATA_URL` |

The value is the AWS SAM stack's **`DataUrl`** output, e.g.
`https://<stack>-databucket-xxxx.s3.<region>.amazonaws.com/matches.json`. See
[`infra/README.md`](infra/README.md) for how to get it.

---

## Deploy

### Option A — GitHub Pages (free, recommended)

1. Create a GitHub repo and push this project to the `main` branch.
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FOOTBALL_DATA_AK` · Value: your football-data.org key.
3. *(Optional)* add repository **variables** for `VITE_PLAYER1_NAME` /
   `VITE_PLAYER2_NAME` (and `VITE_DATA_URL` if using the AWS pipeline) so the
   deployed build shows real names without committing them.
4. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
5. The [deploy workflow](.github/workflows/deploy.yml) builds on every push and on
   a schedule (to refresh scores). Your app lands at
   `https://<your-username>.github.io/<repo>/`.

> Scheduled GitHub Actions only run on a repo with activity in the last 60 days,
> and the free tier may delay a cron run by a few minutes. You can always hit the
> refresh button in the app or re-run the workflow manually.

### Option B — Netlify / Vercel / Cloudflare Pages

Any static host works. Build command `npm run build`, output directory `dist`. Add
`FOOTBALL_DATA_AK` (and any `VITE_*` vars) as environment variables, and run
`npm run fetch` as part of the build (or rely on the AWS pipeline + `VITE_DATA_URL`)
so the bundled scores are current.

### Install on your phone

Open the deployed URL in Safari (iPhone) or Chrome (Android) → Share / menu →
**Add to Home Screen**. It installs like a native app, full-screen, with offline
support.

---

## Notes

- Pre-match betting odds are shown when available, but they're paywalled on the
  free football-data.org tier, so they usually won't appear.
- Knockout fixtures show as **TBD** until the bracket fills in; they start scoring
  automatically once real teams are assigned.

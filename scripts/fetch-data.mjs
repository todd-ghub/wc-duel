#!/usr/bin/env node
// Server-side fetcher for the World Cup 2026 watch game.
//
// Runs locally (`npm run fetch`, reads .env) or in CI (`npm run fetch:ci`, reads
// the FOOTBALL_DATA_AK secret). It pulls the full WC fixture list from
// football-data.org, trims it to the fields the app needs, and writes
// public/data/matches.json. The API key never reaches the browser bundle.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.FOOTBALL_DATA_AK;
if (!KEY) {
  console.error(
    "Missing FOOTBALL_DATA_AK. Set it in .env (local) or as a repo secret (CI).",
  );
  process.exit(1);
}

const API = "https://api.football-data.org/v4/competitions/WC/matches";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/data/matches.json",
);

function normalizeOdds(odds) {
  if (!odds || typeof odds.homeWin !== "number") return null;
  return { home: odds.homeWin, draw: odds.draw, away: odds.awayWin };
}

function normalizeTeam(t) {
  return {
    tla: t?.tla ?? null,
    name: t?.name ?? "TBD",
    crest: t?.crest ?? null,
  };
}

function normalizeMatch(m) {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    stage: m.stage,
    group: m.group ?? null,
    home: normalizeTeam(m.homeTeam),
    away: normalizeTeam(m.awayTeam),
    scoreHome: m.score?.fullTime?.home ?? null,
    scoreAway: m.score?.fullTime?.away ?? null,
    odds: normalizeOdds(m.odds),
  };
}

async function main() {
  const res = await fetch(API, { headers: { "X-Auth-Token": KEY } });
  if (!res.ok) {
    console.error(`football-data.org responded ${res.status}: ${res.statusText}`);
    console.error(await res.text());
    process.exit(1);
  }
  const raw = await res.json();
  const matches = (raw.matches ?? []).map(normalizeMatch);
  const season = raw.matches?.[0]?.season ?? raw.competition?.currentSeason ?? {};

  const out = {
    fetchedAt: new Date().toISOString(),
    season: {
      startDate: season.startDate ?? "2026-06-11",
      endDate: season.endDate ?? "2026-07-19",
      currentMatchday: season.currentMatchday ?? null,
    },
    matches,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  const live = matches.filter((m) => ["IN_PLAY", "PAUSED"].includes(m.status)).length;
  console.log(
    `Wrote ${matches.length} matches (${finished} finished, ${live} live) -> ${OUT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

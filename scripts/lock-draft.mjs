#!/usr/bin/env node
// Locks the draft for this repo. On the very first build (or any build where
// draft.lock.json is missing) we randomly pick which player picks first in
// the snake draft, run the draft against the rank lists in src/config.ts, and
// freeze the result to draft.lock.json. The lock is committed back to main by
// the deploy workflow, so every subsequent build reads the same result — the
// draft survives unrelated code changes and rebuilds.
//
// To re-roll the draft, delete draft.lock.json and re-run this script (or just
// push: CI will regenerate it).

import { readFile, writeFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK = resolve(ROOT, "draft.lock.json");
const CONFIG = resolve(ROOT, "src/config.ts");
const FIELD = resolve(ROOT, "src/data/field.ts");

const exists = async (p) => {
  try { await access(p); return true; } catch { return false; }
};

if (await exists(LOCK)) {
  console.log("draft.lock.json present — draft is locked, not regenerating.");
  process.exit(0);
}

const config = await readFile(CONFIG, "utf8");

// Parse `export const NAME ... = [ "ABC", "DEF", ... ]` from config.ts. We
// avoid importing the TS file so this script stays plain Node — running before
// tsc/vite, with no extra tooling.
function parseRanks(name) {
  const m = config.match(new RegExp(`${name}[^=]*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) {
    console.error(`Could not find ${name} in src/config.ts`);
    process.exit(1);
  }
  return [...m[1].matchAll(/"([A-Z]{3})"/g)].map((x) => x[1]);
}

// FIFA-rank-ordered TLA list (best team first), used as the default when a
// player hasn't set their own ranking.
const fieldSource = await readFile(FIELD, "utf8");
const FIFA_ORDER = [...fieldSource.matchAll(/tla:\s*"([A-Z]{3})"/g)].map((x) => x[1]);
if (FIFA_ORDER.length !== 48) {
  console.error(`Expected 48 teams in FIELD; found ${FIFA_ORDER.length}`);
  process.exit(1);
}

function resolveRanks(name) {
  const ranks = parseRanks(name);
  if (ranks.length === 0) {
    console.log(`${name} is empty — defaulting to FIFA-rank order.`);
    return FIFA_ORDER;
  }
  if (ranks.length !== 48) {
    console.error(`${name} must list either 0 (use FIFA default) or 48 teams; got ${ranks.length}`);
    process.exit(1);
  }
  return ranks;
}

const p1Ranks = resolveRanks("PLAYER1_RANKS");
const p2Ranks = resolveRanks("PLAYER2_RANKS");

// Random starter: 0 = Player1 picks first, 1 = Player2 picks first.
const starterIdx = Math.random() < 0.5 ? 0 : 1;

// Snake draft. Pick i goes to side ((round + within + starterIdx) % 2), so
// with starterIdx=0 the order is P1, P2, P2, P1, P1, P2, … and with
// starterIdx=1 it flips to P2, P1, P1, P2, P2, P1, … Each player takes their
// highest-ranked team that hasn't been picked yet.
const sides = [
  { ranks: p1Ranks, ptr: 0, picks: [] },
  { ranks: p2Ranks, ptr: 0, picks: [] },
];
const taken = new Set();
const nextFor = (side) => {
  const s = sides[side];
  while (s.ptr < s.ranks.length) {
    const tla = s.ranks[s.ptr++];
    if (!taken.has(tla)) return tla;
  }
  return null;
};
for (let i = 0; i < p1Ranks.length; i++) {
  const round = Math.floor(i / 2);
  const within = i % 2;
  const side = (round + within + starterIdx) % 2;
  const pick = nextFor(side);
  if (!pick) break;
  sides[side].picks.push(pick);
  taken.add(pick);
}

const lock = {
  starter: starterIdx === 0 ? "Player1" : "Player2",
  lockedAt: new Date().toISOString(),
  p1Teams: sides[0].picks,
  p2Teams: sides[1].picks,
};

await writeFile(LOCK, JSON.stringify(lock, null, 2) + "\n");
console.log(
  `Wrote draft.lock.json: starter=${lock.starter}, ` +
    `P1=${lock.p1Teams.length} P2=${lock.p2Teams.length}`,
);

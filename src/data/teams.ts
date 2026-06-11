// Derives the playable draft from your game setup (../config) joined with the
// canonical field (./field). You normally don't edit this file — change the
// owners or the draft in ../config, or the team data in ./field.

import {
  OWNERS as OWNER_LIST,
  DRAFT as DRAFT_BY_OWNER,
  PLAYER1_RANKS,
  PLAYER2_RANKS,
  type Owner,
  type OwnerConfig,
} from "../config";
import { FIELD, FIELD_BY_TLA } from "./field";

export type { Owner };
export { flagEmoji } from "./field";

export interface DraftTeam {
  tla: string;
  name: string;
  owner: Owner;
  rank: number;
}

/** The two owner ids in setup order. `OWNER_IDS[0]` is the left/first side. */
export const OWNER_IDS = OWNER_LIST.map((o) => o.id) as [Owner, Owner];

/** Display label + short badge per owner. */
export const OWNERS: Record<Owner, { label: string; short: string }> =
  Object.fromEntries(
    (OWNER_LIST as readonly OwnerConfig[]).map((o) => [
      o.id,
      { label: o.label, short: o.short ?? o.label[0]?.toUpperCase() ?? "?" },
    ]),
  ) as Record<Owner, { label: string; short: string }>;

/** Which owner drafted each TLA, inverted from the per-owner lists in config. */
const OWNER_OF: Record<string, Owner> = {};
for (const id of OWNER_IDS) {
  for (const tla of DRAFT_BY_OWNER[id]) OWNER_OF[tla] = id;
}

export const DRAFT: DraftTeam[] = FIELD.map((t) => ({
  tla: t.tla,
  name: t.name,
  owner: OWNER_OF[t.tla],
  rank: t.rank,
}));

export const DRAFT_BY_TLA: Record<string, DraftTeam> = Object.fromEntries(
  DRAFT.map((t) => [t.tla, t]),
);

// Dev-only sanity check: each rank list is a permutation of the 48-team field,
// and the resulting DRAFT assigns every team to exactly one owner.
if (import.meta.env?.DEV) {
  const checkRanks = (label: string, ranks: readonly string[]) => {
    if (ranks.length === 0) return; // empty = fall back to FIFA order in scripts/lock-draft.mjs
    const seen = new Map<string, number>();
    for (const tla of ranks) {
      seen.set(tla, (seen.get(tla) ?? 0) + 1);
      if (!FIELD_BY_TLA[tla]) console.error(`[config] ${label} has unknown TLA "${tla}" (not in field.ts)`);
    }
    for (const [tla, n] of seen) if (n > 1) console.error(`[config] ${label} lists "${tla}" ${n} times — each team must appear once`);
    for (const t of FIELD) if (!seen.has(t.tla)) console.error(`[config] ${label} is missing ${t.tla} (${t.name}) — every team must be ranked`);
  };
  checkRanks("PLAYER1_RANKS", PLAYER1_RANKS);
  checkRanks("PLAYER2_RANKS", PLAYER2_RANKS);

  const seen = new Map<string, number>();
  for (const id of OWNER_IDS) for (const tla of DRAFT_BY_OWNER[id]) seen.set(tla, (seen.get(tla) ?? 0) + 1);
  for (const [tla, n] of seen) if (n > 1) console.error(`[config] DRAFT assigns "${tla}" to ${n} owners`);
  for (const t of FIELD) if (!seen.has(t.tla)) console.error(`[config] DRAFT is missing ${t.tla} (${t.name})`);
}

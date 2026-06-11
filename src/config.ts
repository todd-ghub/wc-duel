// ─────────────────────────────────────────────────────────────────────────────
//  GAME SETUP — this is the only file you need to edit to run your own game.
// ─────────────────────────────────────────────────────────────────────────────
//
//  The app splits the 48-team World Cup field between two "owners" who earn
//  points from their teams' results (see RULES.md for the scoring). To make it
//  yours, change the two owners below and reorder each player's ranking.
//
//  1. OWNERS  — the two players: a stable `id`, a display `label`, a one-letter
//     `short` badge, and a `color` gradient [from, to] used for their side.
//     The ids are generic (Player1 / Player2) and the display names default to
//     "Player 1" / "Player 2". To show real names without putting them in code,
//     set VITE_PLAYER1_NAME / VITE_PLAYER2_NAME in your (gitignored) .env.
//  2. RANKINGS — each player ranks ALL 48 teams by TLA, favorite first. Leave
//     a ranking empty (`[]`) to fall back to the FIFA-rank order from
//     src/data/field.ts (best team first). On the very first build,
//     scripts/lock-draft.mjs reads these rankings, picks a random starter,
//     runs a snake draft (pick order P1,P2,P2,P1,P1,… or flipped if Player2
//     starts — each player takes their highest-ranked team still available),
//     and freezes the result to draft.lock.json. After that the lock file is
//     the source of truth: editing these arrays no longer changes the draft.
//     To re-roll, delete draft.lock.json and rebuild.
//
//  Nothing else in the app references the players by name — rename freely.

import lock from "../draft.lock.json";

export interface OwnerConfig {
  /** Stable internal key. Any short string; never shown to users. */
  id: string;
  /** Shown in the UI. */
  label: string;
  /** One-letter badge on match cards. Optional — defaults to the label's initial. */
  short?: string;
  /** Gradient endpoints [from, to] as CSS colors — the owner's visual identity. */
  color: [from: string, to: string];
}

export const OWNERS = [
  {
    id: "Player1",
    label: import.meta.env.VITE_PLAYER1_NAME || "Player 1",
    color: ["#3b82f6", "#6366f1"],
  },
  {
    id: "Player2",
    label: import.meta.env.VITE_PLAYER2_NAME || "Player 2",
    color: ["#2dd4bf", "#10b981"],
  },
] as const satisfies readonly [OwnerConfig, OwnerConfig];

/** The owner ids, derived from OWNERS — used as the owner key throughout the app. */
export type Owner = (typeof OWNERS)[number]["id"];

// Each player ranks all 48 teams, favorite first. The snake draft below
// processes picks alternately (P1, P2, P2, P1, P1, …) and each player takes
// their highest-ranked team that hasn't been picked yet. The seed lists below
// place each player's currently-drafted teams first, so re-running the draft
// reproduces the existing assignment — start editing from there.
export const PLAYER1_RANKS: readonly string[] = [
  "ESP","FRA","BRA","ARG","ENG","POR","GER","NED","NOR","JPN",
  "USA","MEX","CRO","CZE","MAR","ECU","SUI","URY","SEN","COL",
  "BEL","TUR", "AUT","KOR",
  "SWE","CIV", "CAN","PAR","EGY","ALG","IRN","AUS","SCO","GHA",
  "TUN","BIH","COD", "PAN","UZB","QAT","KSA","CPV","JOR","RSA",
  "IRQ","NZL","CUW","HAI"
];

// Empty = use FIFA-rank order from src/data/field.ts (best team first).
export const PLAYER2_RANKS: readonly string[] = [
  "ENG","ESP","FRA","BEL","POR","BRA","ARG","USA","NOR","NED",
  "MAR","GER","ECU","CRO","COL","TUR","SEN","MEX","URY","JPN",
  "SUI","IRN","AUT","KOR",
  "AUS","ALG","EGY","CAN","PAN","CIV","SWE","PAR","CZE","SCO",
  "TUN","COD","UZB","QAT","IRQ","RSA", "KSA","JOR","BIH","CPV",
  "GHA","CUW","HAI","NZL"
];

/** Frozen draft from draft.lock.json. The starter is chosen at random on the
 *  first build; every build after that reads the same lock file. */
export const DRAFT: Record<Owner, string[]> = {
  [OWNERS[0].id]: lock.p1Teams,
  [OWNERS[1].id]: lock.p2Teams,
} as Record<Owner, string[]>;

/** Which player picked first in the snake draft. Useful for display. */
export const DRAFT_STARTER: Owner = lock.starter as Owner;

// ─────────────────────────────────────────────────────────────────────────────
//  GAME SETUP — this is the only file you need to edit to run your own game.
// ─────────────────────────────────────────────────────────────────────────────
//
//  The app splits the 48-team World Cup field between two "owners" who earn
//  points from their teams' results (see RULES.md for the scoring). To make it
//  yours, change the two owners below and draft the teams between them.
//
//  1. OWNERS  — the two players: a stable `id`, a display `label`, a one-letter
//     `short` badge, and a `color` gradient [from, to] used for their side.
//     The ids are generic (PLAYER1 / PLAYER2) and the display names default to
//     "Player 1" / "Player 2". To show real names without putting them in code,
//     set VITE_PLAYER1_NAME / VITE_PLAYER2_NAME in your (gitignored) .env.
//  2. DRAFT   — list every team's TLA under whichever owner drafted it. The full
//     TLA ↔ country list lives in src/data/field.ts. Every team must be assigned
//     to exactly one owner (the app checks this at startup and logs any
//     unassigned / duplicated / unknown codes in dev).
//
//  Nothing else in the app references the players by name — rename freely.

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
    id: "PLAYER1",
    label: import.meta.env.VITE_PLAYER1_NAME || "Player 1",
    color: ["#3b82f6", "#6366f1"],
  },
  {
    id: "PLAYER2",
    label: import.meta.env.VITE_PLAYER2_NAME || "Player 2",
    color: ["#2dd4bf", "#10b981"],
  },
] as const satisfies readonly [OwnerConfig, OwnerConfig];

/** The owner ids, derived from OWNERS — used as the owner key throughout the app. */
export type Owner = (typeof OWNERS)[number]["id"];

// Draft: each owner's teams by TLA. See src/data/field.ts for the country list.
export const DRAFT: Record<Owner, string[]> = {
  PLAYER1: [
    "POR", "BRA", "NED", "MAR", "BEL", "GER", "CRO", "COL", "USA", "JPN",
    "SUI", "IRN", "ECU", "AUT", "KOR", "CIV", "SWE", "CZE", "COD", "KSA",
    "BIH", "GHA", "HAI",
  ],
  PLAYER2: [
    "FRA", "ESP", "ARG", "ENG", "SEN", "MEX", "URY", "TUR", "AUS", "ALG",
    "EGY", "CAN", "NOR", "PAN", "PAR", "SCO", "TUN", "UZB", "QAT", "IRQ",
    "RSA", "JOR", "CPV", "CUW", "NZL",
  ],
};

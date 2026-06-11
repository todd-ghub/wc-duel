// The rules engine. Implements RULES.md exactly:
//   Base = ResultPts + CleanSheetPts + 0.15*GoalsFor - 0.10*GoalsAgainst
//   Multiplier from the FIFA rank gap between the two teams in the match.
//   Final = Base > 0 ? Base * (1 + Multiplier) : 0   (capped at zero, no negatives)

import { DRAFT, DRAFT_BY_TLA, OWNER_IDS, type Owner } from "../data/teams";
import type { Match } from "./types";

const WIN_PTS = 3;
const DRAW_PTS = 1;
const GOAL_FOR_PTS = 0.15;
const GOAL_AGAINST_PTS = 0.1;
const CLEAN_SHEET_PTS = 0.5;

/**
 * Maps the signed FIFA rank differential (team rank − opponent rank) to a bonus
 * multiplier (RULES.md §2). A smaller rank number is a better team, so only the
 * lower-ranked underdog gets a positive differential and can earn a bonus; a
 * favorite's differential is negative and lands in the Base (0%) slot.
 */
export function multiplierForRankDiff(diff: number): number {
  if (diff <= 10) return 0;
  if (diff <= 18) return 0.15;
  if (diff <= 26) return 0.25;
  if (diff <= 34) return 0.4;
  if (diff <= 42) return 0.6;
  if (diff <= 50) return 0.8;
  return 1.0;
}

export interface TeamMatchScore {
  result: "W" | "D" | "L";
  resultPts: number;
  cleanSheet: boolean;
  cleanSheetPts: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsForPts: number;
  goalsAgainstPts: number;
  base: number;
  rankDiff: number;
  multiplier: number;
  /** Final points earned, capped at zero. */
  final: number;
}

/** A match is scorable only if it's final, both teams are in our draft, and we have a score. */
export function isScorable(m: Match): boolean {
  return (
    m.status === "FINISHED" &&
    m.scoreHome != null &&
    m.scoreAway != null &&
    m.home.tla != null &&
    m.away.tla != null &&
    m.home.tla in DRAFT_BY_TLA &&
    m.away.tla in DRAFT_BY_TLA
  );
}

function isLiveScorable(m: Match): boolean {
  return (
    (m.status === "IN_PLAY" || m.status === "PAUSED") &&
    m.scoreHome != null &&
    m.scoreAway != null &&
    m.home.tla != null &&
    m.away.tla != null &&
    m.home.tla in DRAFT_BY_TLA &&
    m.away.tla in DRAFT_BY_TLA
  );
}

/** Compute one team's points from one finished match. `side` is whose perspective.
 *  Pass `{ includeInPlay: true }` to also score live IN_PLAY/PAUSED matches. */
export function scoreTeamInMatch(
  m: Match,
  side: "home" | "away",
  opts?: { includeInPlay?: boolean },
): TeamMatchScore | null {
  const ok = opts?.includeInPlay ? (isScorable(m) || isLiveScorable(m)) : isScorable(m);
  if (!ok) return null;
  const isHome = side === "home";
  const gf = (isHome ? m.scoreHome : m.scoreAway) as number;
  const ga = (isHome ? m.scoreAway : m.scoreHome) as number;
  const myTla = (isHome ? m.home.tla : m.away.tla) as string;
  const oppTla = (isHome ? m.away.tla : m.home.tla) as string;

  const myRank = DRAFT_BY_TLA[myTla].rank;
  const oppRank = DRAFT_BY_TLA[oppTla].rank;
  // Signed: positive means we're the lower-ranked underdog (bonus-eligible);
  // negative means we're the favorite (no bonus).
  const rankDiff = myRank - oppRank;
  const multiplier = multiplierForRankDiff(rankDiff);

  const result: "W" | "D" | "L" = gf > ga ? "W" : gf === ga ? "D" : "L";
  const resultPts = result === "W" ? WIN_PTS : result === "D" ? DRAW_PTS : 0;
  const cleanSheet = ga === 0;
  const cleanSheetPts = cleanSheet ? CLEAN_SHEET_PTS : 0;
  const goalsForPts = gf * GOAL_FOR_PTS;
  const goalsAgainstPts = ga * GOAL_AGAINST_PTS;

  const base = resultPts + cleanSheetPts + goalsForPts - goalsAgainstPts;
  const final = base > 0 ? base * (1 + multiplier) : 0;

  return {
    result,
    resultPts,
    cleanSheet,
    cleanSheetPts,
    goalsFor: gf,
    goalsAgainst: ga,
    goalsForPts,
    goalsAgainstPts,
    base,
    rankDiff,
    multiplier,
    final,
  };
}

export interface TeamStanding {
  tla: string;
  name: string;
  owner: Owner;
  rank: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  points: number;
}

export interface OwnerStanding {
  owner: Owner;
  points: number;
  played: number;
  teams: TeamStanding[];
}

/** A single team's contribution within a specific match, for the history view. */
export interface MatchContribution {
  tla: string;
  side: "home" | "away";
  score: TeamMatchScore;
}

export interface ScoredMatch {
  match: Match;
  contributions: MatchContribution[];
}

/** Roll up every finished match into per-team and per-owner standings. */
export function computeStandings(matches: Match[]): {
  owners: Record<Owner, OwnerStanding>;
  teams: Record<string, TeamStanding>;
} {
  const teams: Record<string, TeamStanding> = {};
  for (const t of DRAFT) {
    teams[t.tla] = {
      tla: t.tla,
      name: t.name,
      owner: t.owner,
      rank: t.rank,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      cleanSheets: 0,
      points: 0,
    };
  }

  for (const m of matches) {
    if (!isScorable(m)) continue;
    for (const side of ["home", "away"] as const) {
      const tla = (side === "home" ? m.home.tla : m.away.tla) as string;
      const sc = scoreTeamInMatch(m, side);
      if (!sc) continue;
      const t = teams[tla];
      t.played += 1;
      if (sc.result === "W") t.wins += 1;
      else if (sc.result === "D") t.draws += 1;
      else t.losses += 1;
      t.goalsFor += sc.goalsFor;
      t.goalsAgainst += sc.goalsAgainst;
      if (sc.cleanSheet) t.cleanSheets += 1;
      t.points += sc.final;
    }
  }

  const owners = Object.fromEntries(
    OWNER_IDS.map((id): [Owner, OwnerStanding] => [
      id,
      { owner: id, points: 0, played: 0, teams: [] },
    ]),
  ) as Record<Owner, OwnerStanding>;
  for (const t of Object.values(teams)) {
    const o = owners[t.owner];
    o.teams.push(t);
    o.points += t.points;
    o.played += t.played;
  }
  for (const o of Object.values(owners)) {
    o.teams.sort((a, b) => b.points - a.points || a.rank - b.rank);
  }
  return { owners, teams };
}

/** Points currently being earned in live (IN_PLAY/PAUSED) matches, per owner. */
export function computeLiveOwnerPoints(matches: Match[]): Record<Owner, number> {
  const result = Object.fromEntries(
    OWNER_IDS.map((id): [Owner, number] => [id, 0]),
  ) as Record<Owner, number>;
  for (const m of matches) {
    if (m.status !== "IN_PLAY" && m.status !== "PAUSED") continue;
    for (const side of ["home", "away"] as const) {
      const tla = side === "home" ? m.home.tla : m.away.tla;
      if (!tla || !(tla in DRAFT_BY_TLA)) continue;
      const sc = scoreTeamInMatch(m, side, { includeInPlay: true });
      if (!sc) continue;
      const owner = DRAFT_BY_TLA[tla].owner;
      result[owner] += sc.final;
    }
  }
  return result;
}

/** Finished matches with per-team contributions, newest first — for the History tab. */
export function scoredMatches(matches: Match[]): ScoredMatch[] {
  const out: ScoredMatch[] = [];
  for (const m of matches) {
    if (!isScorable(m)) continue;
    const contributions: MatchContribution[] = [];
    for (const side of ["home", "away"] as const) {
      const tla = (side === "home" ? m.home.tla : m.away.tla) as string;
      const score = scoreTeamInMatch(m, side);
      if (score) contributions.push({ tla, side, score });
    }
    out.push({ match: m, contributions });
  }
  out.sort((a, b) => +new Date(b.match.utcDate) - +new Date(a.match.utcDate));
  return out;
}

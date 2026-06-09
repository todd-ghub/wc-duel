// Normalized shapes the app consumes. The fetch script trims football-data.org's
// payload down to exactly these fields so the client bundle never sees the API.

export type MatchStatus =
  | "TIMED"
  | "SCHEDULED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

export interface MatchTeam {
  tla: string | null;
  name: string;
  crest: string | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  stage: string;
  group: string | null;
  home: MatchTeam;
  away: MatchTeam;
  scoreHome: number | null;
  scoreAway: number | null;
  /** Pre-match win/draw/win odds if the API exposes them; usually null on free tier. */
  odds: { home: number; draw: number; away: number } | null;
}

export interface DataFile {
  /** ISO timestamp the data was fetched (server-side). */
  fetchedAt: string;
  season: { startDate: string; endDate: string; currentMatchday: number | null };
  matches: Match[];
}

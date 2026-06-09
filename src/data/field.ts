// The canonical WC2026 field — the 48 qualified teams with their official
// pre-tournament FIFA ranks (used for the bonus multiplier, see RULES.md) and
// ISO country codes for flag rendering. This is fixed tournament data and is
// identical for every deployment, so you should NOT need to edit it.
//
// To set up your own game (owners + who drafts which teams) edit src/config.ts.
//
// Keyed by the football-data.org three-letter code (TLA) so live match data
// joins cleanly. `name` is the canonical spelling from our rules sheet.

export interface FieldTeam {
  tla: string;
  name: string;
  rank: number;
  /** ISO 3166-1 alpha-2 for the emoji flag; null when an override is used. */
  iso2: string | null;
}

export const FIELD: FieldTeam[] = [
  { tla: "FRA", name: "France", rank: 1, iso2: "FR" },
  { tla: "ESP", name: "Spain", rank: 2, iso2: "ES" },
  { tla: "ARG", name: "Argentina", rank: 3, iso2: "AR" },
  { tla: "ENG", name: "England", rank: 4, iso2: null },
  { tla: "POR", name: "Portugal", rank: 5, iso2: "PT" },
  { tla: "BRA", name: "Brazil", rank: 6, iso2: "BR" },
  { tla: "NED", name: "Netherlands", rank: 7, iso2: "NL" },
  { tla: "MAR", name: "Morocco", rank: 8, iso2: "MA" },
  { tla: "BEL", name: "Belgium", rank: 9, iso2: "BE" },
  { tla: "GER", name: "Germany", rank: 10, iso2: "DE" },
  { tla: "CRO", name: "Croatia", rank: 11, iso2: "HR" },
  { tla: "COL", name: "Colombia", rank: 13, iso2: "CO" },
  { tla: "SEN", name: "Senegal", rank: 14, iso2: "SN" },
  { tla: "MEX", name: "Mexico", rank: 15, iso2: "MX" },
  { tla: "USA", name: "United States", rank: 16, iso2: "US" },
  { tla: "URY", name: "Uruguay", rank: 17, iso2: "UY" },
  { tla: "JPN", name: "Japan", rank: 18, iso2: "JP" },
  { tla: "SUI", name: "Switzerland", rank: 19, iso2: "CH" },
  { tla: "IRN", name: "IR Iran", rank: 21, iso2: "IR" },
  { tla: "TUR", name: "Türkiye", rank: 22, iso2: "TR" },
  { tla: "ECU", name: "Ecuador", rank: 23, iso2: "EC" },
  { tla: "AUT", name: "Austria", rank: 24, iso2: "AT" },
  { tla: "KOR", name: "South Korea", rank: 25, iso2: "KR" },
  { tla: "AUS", name: "Australia", rank: 27, iso2: "AU" },
  { tla: "ALG", name: "Algeria", rank: 28, iso2: "DZ" },
  { tla: "EGY", name: "Egypt", rank: 29, iso2: "EG" },
  { tla: "CAN", name: "Canada", rank: 30, iso2: "CA" },
  { tla: "NOR", name: "Norway", rank: 31, iso2: "NO" },
  { tla: "PAN", name: "Panama", rank: 33, iso2: "PA" },
  { tla: "CIV", name: "Côte d'Ivoire", rank: 34, iso2: "CI" },
  { tla: "SWE", name: "Sweden", rank: 38, iso2: "SE" },
  { tla: "PAR", name: "Paraguay", rank: 40, iso2: "PY" },
  { tla: "CZE", name: "Czechia", rank: 41, iso2: "CZ" },
  { tla: "SCO", name: "Scotland", rank: 43, iso2: null },
  { tla: "TUN", name: "Tunisia", rank: 44, iso2: "TN" },
  { tla: "COD", name: "DR Congo", rank: 46, iso2: "CD" },
  { tla: "UZB", name: "Uzbekistan", rank: 50, iso2: "UZ" },
  { tla: "QAT", name: "Qatar", rank: 55, iso2: "QA" },
  { tla: "IRQ", name: "Iraq", rank: 57, iso2: "IQ" },
  { tla: "RSA", name: "South Africa", rank: 60, iso2: "ZA" },
  { tla: "KSA", name: "Saudi Arabia", rank: 61, iso2: "SA" },
  { tla: "JOR", name: "Jordan", rank: 63, iso2: "JO" },
  { tla: "BIH", name: "Bosnia & Herzegovina", rank: 65, iso2: "BA" },
  { tla: "CPV", name: "Cabo Verde", rank: 69, iso2: "CV" },
  { tla: "GHA", name: "Ghana", rank: 74, iso2: "GH" },
  { tla: "CUW", name: "Curaçao", rank: 82, iso2: "CW" },
  { tla: "HAI", name: "Haiti", rank: 83, iso2: "HT" },
  { tla: "NZL", name: "New Zealand", rank: 85, iso2: "NZ" },
];

export const FIELD_BY_TLA: Record<string, FieldTeam> = Object.fromEntries(
  FIELD.map((t) => [t.tla, t]),
);

/** Sub-national flags the regional-indicator trick can't produce from an ISO2. */
const FLAG_OVERRIDES: Record<string, string> = {
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

/** Emoji flag from a TLA, used as a lightweight fallback before crests load. */
export function flagEmoji(tla: string): string {
  if (FLAG_OVERRIDES[tla]) return FLAG_OVERRIDES[tla];
  const iso = FIELD_BY_TLA[tla]?.iso2;
  if (!iso) return "🏳️";
  return String.fromCodePoint(
    ...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

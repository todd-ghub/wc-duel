import { motion } from "motion/react";
import type { DataFile } from "../lib/types";
import { OWNERS, OWNER_IDS, type Owner } from "../data/teams";
import { PLAYER1_RANKS, PLAYER2_RANKS } from "../config";
import { FIELD } from "../data/field";
import { computeStandings, type TeamStanding } from "../lib/scoring";
import { fmtPts } from "../lib/format";
import { Flag } from "../components/Flag";
import { OWNER_THEME } from "../components/owner";

const CREST_BY_TLA = new Map<string, string | null>();

export type TeamSort = "rank" | "pts" | "playerRank";
export type TeamFilter = Owner | "ALL";

// Each owner's effective pre-draft ranking list. An empty list in config.ts
// means "use FIFA order" (same fallback the lock-draft script applies), so we
// mirror that here. Used by the "Player Rank" sort.
const FIFA_ORDER = FIELD.map((t) => t.tla);
const OWNER_RANKS: Record<Owner, readonly string[]> = {
  [OWNER_IDS[0]]: PLAYER1_RANKS.length > 0 ? PLAYER1_RANKS : FIFA_ORDER,
  [OWNER_IDS[1]]: PLAYER2_RANKS.length > 0 ? PLAYER2_RANKS : FIFA_ORDER,
} as Record<Owner, readonly string[]>;

function playerRankOf(t: TeamStanding): number {
  const idx = OWNER_RANKS[t.owner].indexOf(t.tla);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

function OwnerBadge({ owner }: { owner: Owner }) {
  const theme = OWNER_THEME[owner];
  const short = OWNERS[owner].short ?? OWNERS[owner].label[0];
  return (
    <div
      className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: theme.gradient }}
    >
      {short}
    </div>
  );
}

function TeamLine({ t, rankInList }: { t: TeamStanding; rankInList: number }) {
  const crest = CREST_BY_TLA.get(t.tla) ?? null;
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
      <OwnerBadge owner={t.owner} />
      <span className="w-4 text-center text-[12px] font-semibold text-white/30 tabular-nums">
        {rankInList}
      </span>
      <Flag tla={t.tla} crest={crest} size={30} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{t.name}</div>
        <div className="text-[11px] text-white/45">
          FIFA #{t.rank} · {t.wins}W {t.draws}D {t.losses}L · {t.goalsFor}-{t.goalsAgainst}
          {t.cleanSheets > 0 && ` · ${t.cleanSheets} CS`}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[17px] font-bold tabular-nums">{fmtPts(t.points)}</div>
        <div className="text-[10px] uppercase tracking-wide text-white/35">
          {t.played} {t.played === 1 ? "game" : "games"}
        </div>
      </div>
    </div>
  );
}

function PillTabs<T extends string>({
  layoutId,
  tabs,
  value,
  onChange,
}: {
  layoutId: string;
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="glass flex gap-1 rounded-2xl p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="relative flex-1 rounded-xl py-2 text-[13px] font-semibold"
        >
          {value === t.key && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-xl bg-white/10"
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          )}
          <span className={`relative ${value === t.key ? "text-white" : "text-white/50"}`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function TeamControls({
  sort,
  onSortChange,
  filter,
  onFilterChange,
}: {
  sort: TeamSort;
  onSortChange: (s: TeamSort) => void;
  filter: TeamFilter;
  onFilterChange: (f: TeamFilter) => void;
}) {
  const sortTabs: { key: TeamSort; label: string }[] = [
    { key: "pts", label: "Points" },
    { key: "rank", label: "FIFA Rank" },
    { key: "playerRank", label: "Player Rank" },
  ];
  const filterTabs: { key: TeamFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    ...OWNER_IDS.map((id) => ({ key: id as TeamFilter, label: OWNERS[id].label })),
  ];
  return (
    <div className="space-y-2">
      <PillTabs layoutId="teamsort" tabs={sortTabs} value={sort} onChange={onSortChange} />
      <PillTabs layoutId="teamfilter" tabs={filterTabs} value={filter} onChange={onFilterChange} />
    </div>
  );
}

export function Teams({
  data,
  sort,
  filter,
}: {
  data: DataFile;
  sort: TeamSort;
  filter: TeamFilter;
}) {
  for (const m of data.matches) {
    if (m.home.tla && m.home.crest) CREST_BY_TLA.set(m.home.tla, m.home.crest);
    if (m.away.tla && m.away.crest) CREST_BY_TLA.set(m.away.tla, m.away.crest);
  }

  const { teams } = computeStandings(data.matches);

  const sorted = Object.values(teams)
    .filter((t) => filter === "ALL" || t.owner === filter)
    .sort((a, b) => {
      if (sort === "rank") return a.rank - b.rank;
      if (sort === "playerRank") return playerRankOf(a) - playerRankOf(b) || a.rank - b.rank;
      return b.points - a.points || a.rank - b.rank;
    });

  return (
    <div className="space-y-2 px-4 pb-28 pt-2">
      {sorted.map((t, i) => (
        <TeamLine key={t.tla} t={t} rankInList={i + 1} />
      ))}
    </div>
  );
}

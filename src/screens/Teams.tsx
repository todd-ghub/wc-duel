import { motion } from "motion/react";
import type { DataFile } from "../lib/types";
import { OWNERS, OWNER_IDS, type Owner } from "../data/teams";
import { computeStandings, type TeamStanding } from "../lib/scoring";
import { fmtPts } from "../lib/format";
import { Flag } from "../components/Flag";
import { OWNER_THEME } from "../components/owner";
import { SectionTitle } from "../components/SectionTitle";

const CREST_BY_TLA = new Map<string, string | null>();

function TeamLine({ t, rankInList }: { t: TeamStanding; rankInList: number }) {
  const crest = CREST_BY_TLA.get(t.tla) ?? null;
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
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

function OwnerColumn({ owner, total, teams }: { owner: Owner; total: number; teams: TeamStanding[] }) {
  const theme = OWNER_THEME[owner];
  return (
    <section>
      <SectionTitle>
        <span
          style={{
            background: theme.gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {OWNERS[owner].label}
        </span>
        <span className="ml-1.5 font-bold text-white/70 tabular-nums">
          ({fmtPts(total)})
        </span>
      </SectionTitle>
      <div className="space-y-2">
        {teams.map((t, i) => (
          <TeamLine key={t.tla} t={t} rankInList={i + 1} />
        ))}
      </div>
    </section>
  );
}

export type TeamFilter = Owner | "BOTH";

/** Owner filter pills. Rendered in the sticky header so they stay in view. */
export function TeamFilterTabs({
  value,
  onChange,
}: {
  value: TeamFilter;
  onChange: (f: TeamFilter) => void;
}) {
  const tabs: { key: TeamFilter; label: string }[] = [
    { key: "BOTH", label: "Both" },
    ...OWNER_IDS.map((id) => ({ key: id, label: OWNERS[id].label })),
  ];
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
              layoutId="teamfilter"
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

export function Teams({ data, filter }: { data: DataFile; filter: TeamFilter }) {
  // Capture crests from match data once so team rows can show real flags.
  for (const m of data.matches) {
    if (m.home.tla && m.home.crest) CREST_BY_TLA.set(m.home.tla, m.home.crest);
    if (m.away.tla && m.away.crest) CREST_BY_TLA.set(m.away.tla, m.away.crest);
  }

  const { owners } = computeStandings(data.matches);

  return (
    <div className="space-y-6 px-4 pb-28 pt-2">
      {OWNER_IDS.map(
        (id) =>
          (filter === "BOTH" || filter === id) && (
            <OwnerColumn key={id} owner={id} total={owners[id].points} teams={owners[id].teams} />
          ),
      )}
    </div>
  );
}

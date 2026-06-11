import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Match } from "../lib/types";
import { DRAFT_BY_TLA, OWNERS } from "../data/teams";
import { fmtPts, fmtTime, isFinished, isLive, stageLabel } from "../lib/format";
import { scoreTeamInMatch, type TeamMatchScore } from "../lib/scoring";
import { Flag } from "./Flag";
import { OWNER_THEME } from "./owner";

function OwnerDot({ tla }: { tla: string | null }) {
  const t = tla ? DRAFT_BY_TLA[tla] : undefined;
  if (!t) return null;
  const theme = OWNER_THEME[t.owner];
  return (
    <span
      className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-white"
      style={{ background: theme.gradient }}
      title={`${OWNERS[t.owner].label}'s team`}
    >
      {OWNERS[t.owner].short}
    </span>
  );
}

function TeamRow({
  tla,
  name,
  crest,
  score,
  bold,
  livePoints,
}: {
  tla: string | null;
  name: string;
  crest: string | null;
  score: number | null;
  bold: boolean;
  livePoints?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Flag tla={tla} crest={crest} size={26} />
      <span className={`flex-1 truncate text-[15px] ${bold ? "font-semibold" : "font-medium text-white/85"}`}>
        {name}
      </span>
      <OwnerDot tla={tla} />
      {score != null && (
        <span className={`w-5 text-right text-[17px] tabular-nums ${bold ? "font-bold" : "font-semibold text-white/85"}`}>
          {score}
        </span>
      )}
      {livePoints != null && (
        <span className="min-w-[34px] text-right text-[11px] font-semibold tabular-nums text-(--color-live)/80">
          {fmtPts(livePoints)}pts
        </span>
      )}
    </div>
  );
}

function PtsBreakdown({ tla, sc }: { tla: string; sc: TeamMatchScore }) {
  const t = DRAFT_BY_TLA[tla];
  const theme = OWNER_THEME[t.owner];
  const rows: [string, string][] = [
    [{ W: "Win", D: "Draw", L: "Loss" }[sc.result], fmtPts(sc.resultPts)],
    ["Goals scored", `+${fmtPts(sc.goalsForPts)}`],
    ["Goals conceded", `−${fmtPts(sc.goalsAgainstPts)}`],
  ];
  if (sc.cleanSheet) rows.splice(1, 0, ["Clean sheet", `+${fmtPts(sc.cleanSheetPts)}`]);

  return (
    <div className="rounded-xl bg-black/20 p-3 text-[12px]">
      <div className="mb-1.5 flex items-center gap-2">
        <Flag tla={tla} crest={t ? null : null} size={18} />
        <span className="font-semibold">{t.name}</span>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color: theme.text, background: "rgba(255,255,255,0.06)" }}>
          {fmtPts(sc.final)} pts
        </span>
      </div>
      <div className="space-y-0.5 text-white/65">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between">
            <span>{label}</span>
            <span className="tabular-nums">{val}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-1 text-white/80">
          <span>Base{sc.multiplier > 0 ? ` ×${(1 + sc.multiplier).toFixed(2)} (rank +${Math.round(sc.multiplier * 100)}%)` : ""}</span>
          <span className="tabular-nums">{fmtPts(sc.base)}</span>
        </div>
      </div>
    </div>
  );
}

export function MatchCard({ match: m }: { match: Match }) {
  const live = isLive(m);
  const finished = isFinished(m);
  const [open, setOpen] = useState(false);

  const homeWin = finished && (m.scoreHome ?? 0) > (m.scoreAway ?? 0);
  const awayWin = finished && (m.scoreAway ?? 0) > (m.scoreHome ?? 0);

  const homeSc = scoreTeamInMatch(m, "home");
  const awaySc = scoreTeamInMatch(m, "away");
  const expandable = finished && (homeSc != null || awaySc != null);

  const homeLiveSc = live ? scoreTeamInMatch(m, "home", { includeInPlay: true }) : null;
  const awayLiveSc = live ? scoreTeamInMatch(m, "away", { includeInPlay: true }) : null;

  return (
    <motion.div layout className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        disabled={!expandable}
        onClick={() => expandable && setOpen((o) => !o)}
        className="block w-full px-3.5 py-3 text-left active:scale-[0.99]"
        style={{ transition: "transform 0.12s" }}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/45">
          <span>{stageLabel(m.stage, m.group)}</span>
          <span className="ml-auto flex items-center gap-1.5">
            {live ? (
              <span className="flex items-center gap-1 font-bold text-(--color-live)">
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-(--color-live)" />
                LIVE
              </span>
            ) : finished ? (
              <span className="text-white/40">FT</span>
            ) : (
              <span className="text-white/55">{fmtTime(m.utcDate)}</span>
            )}
          </span>
        </div>
        <div className="space-y-1.5">
          <TeamRow tla={m.home.tla} name={m.home.name} crest={m.home.crest} score={finished || live ? m.scoreHome : null} bold={homeWin} livePoints={homeLiveSc?.final} />
          <TeamRow tla={m.away.tla} name={m.away.name} crest={m.away.crest} score={finished || live ? m.scoreAway : null} bold={awayWin} livePoints={awayLiveSc?.final} />
        </div>
        {expandable && (
          <div className="mt-2 text-center text-[11px] text-white/35">
            {open ? "hide points" : "tap for points"}
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="grid gap-2 px-3.5 pb-3.5 sm:grid-cols-2">
              {homeSc && m.home.tla && <PtsBreakdown tla={m.home.tla} sc={homeSc} />}
              {awaySc && m.away.tla && <PtsBreakdown tla={m.away.tla} sc={awaySc} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

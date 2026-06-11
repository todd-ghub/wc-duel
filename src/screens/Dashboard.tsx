import { motion } from "motion/react";
import type { DataFile } from "../lib/types";
import { OWNERS, OWNER_IDS, type Owner } from "../data/teams";
import { computeStandings, computeLiveOwnerPoints } from "../lib/scoring";
import { fmtPts, isFinished, isLive, isUpcoming } from "../lib/format";
import { OWNER_THEME } from "../components/owner";
import { MatchCard } from "../components/MatchCard";
import { SectionTitle } from "../components/SectionTitle";

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {fmtPts(value)}
    </motion.span>
  );
}

export function Dashboard({ data }: { data: DataFile }) {
  const { owners } = computeStandings(data.matches);
  const liveOwnerPts = computeLiveOwnerPoints(data.matches);
  const [idA, idB] = OWNER_IDS;
  const d = owners[idA];
  const a = owners[idB];
  const dTotal = d.points + liveOwnerPts[idA];
  const aTotal = a.points + liveOwnerPts[idB];
  const total = dTotal + aTotal || 1;
  const dShare = (dTotal / total) * 100;
  const leader = dTotal === aTotal ? null : dTotal > aTotal ? idA : idB;
  const margin = Math.abs(dTotal - aTotal);

  const live = data.matches.filter(isLive);
  const finishedCount = data.matches.filter(isFinished).length;
  const next = data.matches
    .filter(isUpcoming)
    .sort((x, y) => +new Date(x.utcDate) - +new Date(y.utcDate))
    .slice(0, 3);

  // The 3 most recently finished matches, newest first (any date).
  const recentFinishes = data.matches
    .filter(isFinished)
    .sort((x, y) => +new Date(y.utcDate) - +new Date(x.utcDate))
    .slice(0, 3);

  return (
    <div className="space-y-6 px-4 pb-28 pt-2">
      {/* Versus hero */}
      <div className="glass relative overflow-hidden rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-white/40">
          <span>World Cup 2026</span>
          <span>{finishedCount} matches played</span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <OwnerSide owner={idA} pts={dTotal} livePoints={liveOwnerPts[idA]} leading={leader === idA} align="start" />
          <div className="px-1 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/30">vs</div>
          </div>
          <OwnerSide owner={idB} pts={aTotal} livePoints={liveOwnerPts[idB]} leading={leader === idB} align="end" />
        </div>

        {/* Share bar */}
        <div className="mt-5">
          <div className="relative flex h-2.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full"
              style={{ background: OWNER_THEME[idA].gradient }}
              initial={false}
              animate={{ width: `${dShare}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <div className="h-full flex-1" style={{ background: OWNER_THEME[idB].gradient }} />
            {/* A whisper of blend over the seam so the two colors meet softly. */}
            <motion.div
              className="pointer-events-none absolute top-0 h-full"
              style={{
                width: 24,
                x: "-50%",
                background: `linear-gradient(90deg, transparent, ${OWNER_THEME[idA].to}, ${OWNER_THEME[idB].from}, transparent)`,
              }}
              initial={false}
              animate={{ left: `${dShare}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="mt-2.5 text-center text-[12px] text-white/55">
            {leader ? (
              <>
                <span className="font-semibold" style={{ color: OWNER_THEME[leader].text }}>
                  {OWNERS[leader].label}
                </span>{" "}
                leads by <span className="font-semibold text-white/80">{fmtPts(margin)}</span>
              </>
            ) : finishedCount === 0 ? (
              "Kicks off June 11 — may the best half win"
            ) : (
              "Dead even"
            )}
          </div>
        </div>
      </div>

      {/* Live now */}
      {live.length > 0 && (
        <section>
          <SectionTitle>
            <span className="flex items-center gap-2">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-(--color-live)" />
              Live now
            </span>
          </SectionTitle>
          <div className="space-y-2.5">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Up next */}
      <section>
        <SectionTitle>Up next</SectionTitle>
        <div className="space-y-2.5">
          {next.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
          {next.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-sm text-white/50">
              The tournament is over. What a ride.
            </div>
          )}
        </div>
      </section>

      {/* Recent finishes — 3 most recent */}
      {recentFinishes.length > 0 && (
        <section>
          <SectionTitle>Recent finishes</SectionTitle>
          <div className="space-y-2.5">
            {recentFinishes.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OwnerSide({
  owner,
  pts,
  livePoints,
  leading,
  align,
}: {
  owner: Owner;
  pts: number;
  livePoints: number;
  leading: boolean;
  align: "start" | "end";
}) {
  const theme = OWNER_THEME[owner];
  return (
    <div className={`flex flex-col ${align === "end" ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-1.5">
        {leading && align === "start" && <Crown />}
        <span
          className="text-[13px] font-bold uppercase tracking-wide"
          style={{
            background: theme.gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {OWNERS[owner].label}
        </span>
        {leading && align === "end" && <Crown />}
      </div>
      <AnimatedNumber
        value={pts}
        className="mt-0.5 text-[40px] font-extrabold leading-none tabular-nums tracking-tight"
      />
      {livePoints > 0 && (
        <span className="text-[11px] font-semibold tabular-nums text-(--color-live)/80">
          +{fmtPts(livePoints)} live
        </span>
      )}
      <span className="text-[11px] text-white/40">points</span>
    </div>
  );
}

function Crown() {
  return (
    <span className="text-[13px]" aria-label="leading">
      👑
    </span>
  );
}

import type { DataFile } from "../lib/types";
import { dayHeading, dayKey, isFinished } from "../lib/format";
import { MatchCard } from "../components/MatchCard";

export function Schedule({ data }: { data: DataFile }) {
  // Everything not yet finished, chronological — live games float to the top of today.
  const upcoming = data.matches
    .filter((m) => !isFinished(m))
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));

  const groups: { key: string; heading: string; matches: typeof upcoming }[] = [];
  for (const m of upcoming) {
    const key = dayKey(m.utcDate);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, heading: dayHeading(m.utcDate), matches: [] };
      groups.push(g);
    }
    g.matches.push(m);
  }

  return (
    <div className="space-y-6 px-4 pb-28 pt-2">
      {groups.length === 0 && (
        <div className="glass mt-4 rounded-2xl p-6 text-center text-sm text-white/50">
          No matches left to play.
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key}>
          <div className="mb-2.5 px-1 text-[13px] font-bold uppercase tracking-widest text-white/55">
            {g.heading}
            <span className="ml-2 font-medium normal-case tracking-normal text-white/30">
              {g.matches.length} {g.matches.length === 1 ? "match" : "matches"}
            </span>
          </div>
          <div className="space-y-2.5">
            {g.matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

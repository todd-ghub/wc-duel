import type { DataFile } from "../lib/types";
import { dayHeading, dayKey } from "../lib/format";
import { isScorable } from "../lib/scoring";
import { MatchCard } from "../components/MatchCard";

export function History({ data }: { data: DataFile }) {
  // Finished, scorable matches newest-first, grouped by day.
  const played = data.matches
    .filter(isScorable)
    .sort((a, b) => +new Date(b.utcDate) - +new Date(a.utcDate));

  const groups: { key: string; heading: string; matches: typeof played }[] = [];
  for (const m of played) {
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
        <div className="glass mt-4 rounded-2xl p-8 text-center text-sm text-white/50">
          No results yet — the first whistle is June 11.
          <div className="mt-1 text-white/35">Tap a finished match here to see how points were earned.</div>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key}>
          <div className="mb-2.5 px-1 text-[13px] font-bold uppercase tracking-widest text-white/55">
            {g.heading}
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

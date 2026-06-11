import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useData } from "./lib/useData";
import { TabBar, type TabKey } from "./components/TabBar";
import { Dashboard } from "./screens/Dashboard";
import { Schedule } from "./screens/Schedule";
import { Teams, TeamFilterTabs, type TeamFilter } from "./screens/Teams";
import { History } from "./screens/History";

const TAB_TITLES: Record<TabKey, string> = {
  home: "Scoreboard",
  schedule: "Schedule",
  teams: "Teams",
  history: "History",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("home");
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("BOTH");
  const { data, ready, error, loading, refresh } = useData();

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      {/* Header */}
      <header
        className="app-header sticky top-0 z-20 px-4 pb-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight">
              {TAB_TITLES[tab]}
            </h1>
            {data && (
              <p className="text-[11px] text-white/40">
                Updated {relativeTime(data.fetchedAt)}
                {loading && " · refreshing…"}
              </p>
            )}
          </div>
          <button
            onClick={refresh}
            aria-label="Refresh"
            className="glass grid h-10 w-10 place-items-center rounded-full active:scale-90"
            style={{ transition: "transform 0.12s" }}
          >
            <motion.span animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={loading ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}>
              <RefreshIcon />
            </motion.span>
          </button>
        </div>

        {/* Teams' owner filter lives in the header so it stays pinned while the
            list scrolls underneath. */}
        {tab === "teams" && data && (
          <div className="mt-3">
            <TeamFilterTabs value={teamFilter} onChange={setTeamFilter} />
          </div>
        )}
      </header>

      {/* Body */}
      {!ready && loading && <Skeleton />}
      {!ready && error && <ErrorState message={error} onRetry={refresh} />}

      {data && (
        <AnimatePresence mode="wait">
          <motion.main
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {tab === "home" && <Dashboard data={data} />}
            {tab === "schedule" && <Schedule data={data} />}
            {tab === "teams" && <Teams data={data} filter={teamFilter} />}
            {tab === "history" && <History data={data} />}
          </motion.main>
        </AnimatePresence>
      )}

      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 px-4 pt-2">
      <div className="glass h-40 animate-pulse rounded-3xl" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass h-20 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-4 pt-10 text-center">
      <div className="glass mx-auto max-w-xs rounded-2xl p-6">
        <div className="text-3xl">📡</div>
        <p className="mt-2 text-sm text-white/70">Couldn't load match data.</p>
        <p className="mt-1 text-[11px] text-white/40">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

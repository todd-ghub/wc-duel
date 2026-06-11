import { motion } from "motion/react";
import type { JSX } from "react";

export type TabKey = "home" | "schedule" | "teams" | "history";

const TABS: { key: TabKey; label: string; icon: () => JSX.Element }[] = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "schedule", label: "Schedule", icon: CalIcon },
  { key: "teams", label: "Teams", icon: TeamsIcon },
  { key: "history", label: "History", icon: HistIcon },
];

export function TabBar({ tab, onChange }: { tab: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-ink px-4 pt-2"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
    >
      <div className="glass mx-auto flex max-w-md items-stretch justify-around rounded-2xl p-1.5 shadow-2xl shadow-black/40">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="tabpill"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              <span className={`relative transition-colors ${active ? "text-white" : "text-white/45"}`}>
                {t.icon()}
              </span>
              <span className={`relative text-[10px] font-semibold tracking-wide transition-colors ${active ? "text-white" : "text-white/45"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const S = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function HomeIcon() {
  return (
    <svg {...S}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg {...S}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}
function TeamsIcon() {
  return (
    <svg {...S}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 5.5a3 3 0 0 1 0 5.4M16.5 14c2.4.5 4 2.4 4 5" />
    </svg>
  );
}
function HistIcon() {
  return (
    <svg {...S}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3 8" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4.2l2.8 1.8" />
    </svg>
  );
}

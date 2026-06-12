import { AnimatePresence, motion } from "motion/react";

const RANK_ROWS: [string, string, string][] = [
  ["≤ 10",  "×1.00", "×1.00"],
  ["11–20", "×1.15", "×0.95"],
  ["21–35", "×1.25", "×0.85"],
  ["36–55", "×1.40", "×0.75"],
  ["56–75", "×1.60", "×0.65"],
  ["76+",   "×1.80", "×0.55"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40">{title}</div>
      {children}
    </div>
  );
}

function ScoreRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[14px] text-white/70">{label}</span>
      <span className={`text-[14px] font-semibold tabular-nums ${accent ? "text-white" : "text-white/60"}`}>{value}</span>
    </div>
  );
}

export function ScoringModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div
              className="rounded-t-3xl bg-[#0d1426] border border-white/10 border-b-0 px-5 pb-10 pt-5"
              style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* Drag handle */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[19px] font-extrabold tracking-tight">Scoring Rules</h2>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 active:scale-90"
                  style={{ transition: "transform 0.12s" }}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto max-h-[70dvh]">
                {/* Formula */}
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-center">
                  <div className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Formula</div>
                  <div className="text-[15px] font-semibold text-white/90">
                    (Result + Attack + Defense) × Rank
                  </div>
                  <div className="text-[11px] text-white/40 mt-1">minimum 0 per match</div>
                </div>

                {/* Result */}
                <Section title="Result">
                  <div className="rounded-2xl bg-white/5 px-4 py-1">
                    <ScoreRow label="Win" value="3 pts" accent />
                    <ScoreRow label="Draw" value="1 pt" />
                    <ScoreRow label="Loss" value="0 pts" />
                  </div>
                </Section>

                {/* Attack */}
                <Section title="Attack — goals scored">
                  <div className="rounded-2xl bg-white/5 px-4 py-1">
                    <ScoreRow label="1st goal" value="+0.50" />
                    <ScoreRow label="2nd goal" value="+0.25" />
                    <ScoreRow label="3rd goal" value="+0.15" />
                    <ScoreRow label="4th+ each" value="+0.10" />
                  </div>
                </Section>

                {/* Defense */}
                <Section title="Defense — goals conceded">
                  <div className="rounded-2xl bg-white/5 px-4 py-1">
                    <ScoreRow label="Clean sheet (0)" value="+0.50" accent />
                    <ScoreRow label="1 conceded" value="+0.25" />
                    <ScoreRow label="2 conceded" value="+0.12" />
                    <ScoreRow label="3+ conceded" value="+0.00" />
                  </div>
                </Section>

                {/* Rank multiplier */}
                <Section title="Rank Multiplier">
                  <div className="rounded-2xl bg-white/5 overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white/35 border-b border-white/5">
                      <span>Rank diff</span>
                      <span className="text-center">Underdog</span>
                      <span className="text-right">Favourite</span>
                    </div>
                    {RANK_ROWS.map(([diff, under, fav]) => (
                      <div key={diff} className="grid grid-cols-3 px-4 py-2.5 text-[13px] border-b border-white/5 last:border-0">
                        <span className="text-white/60">{diff}</span>
                        <span className="text-center font-semibold text-emerald-400">{under}</span>
                        <span className="text-right font-semibold text-white/50">{fav}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

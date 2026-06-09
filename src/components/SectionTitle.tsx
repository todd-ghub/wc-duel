import type { ReactNode } from "react";

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/55">
        {children}
      </h2>
      {right && <div className="text-[12px] text-white/45">{right}</div>}
    </div>
  );
}

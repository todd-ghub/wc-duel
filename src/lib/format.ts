import type { Match } from "./types";

/** Points formatted to exactly 2 decimal places, e.g. 7.00 / 3.75. */
export function fmtPts(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/** @deprecated Use fmtPts — it now always shows 2 decimal places. */
export const fmtPts2 = fmtPts;

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-final",
  SEMI_FINALS: "Semi-final",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

export function stageLabel(stage: string, group?: string | null): string {
  const base = STAGE_LABELS[stage] ?? stage.replace(/_/g, " ");
  if (stage === "GROUP_STAGE" && group) {
    return group.replace("GROUP_", "Group ");
  }
  return base;
}

export function isLive(m: Match): boolean {
  return m.status === "IN_PLAY" || m.status === "PAUSED";
}

export function isFinished(m: Match): boolean {
  return m.status === "FINISHED";
}

export function isUpcoming(m: Match): boolean {
  return m.status === "TIMED" || m.status === "SCHEDULED" || m.status === "POSTPONED";
}

const dayFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function fmtDay(iso: string): string {
  return dayFmt.format(new Date(iso));
}
export function fmtTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

/** "Today", "Tomorrow", or the weekday/date — used as schedule section headers. */
export function dayHeading(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round(
    (startOf(d).getTime() - startOf(now).getTime()) / 86_400_000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return dayFmt.format(d);
}

/** Stable YYYY-MM-DD key in local time, for grouping matches by day. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

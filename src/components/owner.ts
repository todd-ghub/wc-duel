import { OWNERS } from "../config";
import type { Owner } from "../data/teams";

interface OwnerTheme {
  /** Diagonal gradient for fills (chips, bars, badges). */
  gradient: string;
  /** Gradient endpoints, for seams and custom blends. */
  from: string;
  to: string;
  /** Solid accent color for text, applied via inline style. */
  text: string;
}

/** Per-owner visual identity, derived from each owner's `color` in ../config. */
export const OWNER_THEME: Record<Owner, OwnerTheme> = Object.fromEntries(
  OWNERS.map((o) => {
    const [from, to] = o.color;
    return [
      o.id,
      { gradient: `linear-gradient(135deg, ${from}, ${to})`, from, to, text: from },
    ];
  }),
) as Record<Owner, OwnerTheme>;

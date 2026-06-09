import { useState } from "react";
import { flagEmoji } from "../data/teams";

/**
 * Country flag. Prefers the football-data crest (crisp SVG), falls back to a
 * unicode flag emoji if the crest is missing or fails to load.
 */
export function Flag({
  tla,
  crest,
  size = 28,
  className = "",
}: {
  tla: string | null;
  crest: string | null;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImg = crest && !broken;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        <img
          src={crest}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>
          {tla ? flagEmoji(tla) : "🏳️"}
        </span>
      )}
    </span>
  );
}

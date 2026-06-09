import { useEffect, useState } from "react";
import type { DataFile } from "./types";

const CACHE_KEY = "wc2026:data";

// Where match data comes from. In production we point VITE_DATA_URL at the live
// S3 object (updated every minute by the Lambda); otherwise fall back to the
// bundled JSON resolved against the app base (works under /<repo>/ on Pages and
// for local dev / `npm run fetch`).
const DATA_URL =
  import.meta.env.VITE_DATA_URL || `${import.meta.env.BASE_URL}data/matches.json`;

interface State {
  data: DataFile | null;
  loading: boolean;
  error: string | null;
  /** true once we've shown something (cached or fresh). */
  ready: boolean;
}

function readCache(): DataFile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DataFile) : null;
  } catch {
    return null;
  }
}

/**
 * Loads match data: hydrates instantly from localStorage, then revalidates from
 * the network. The service worker (NetworkFirst) also keeps the JSON for offline.
 * Refetches periodically so live scores tick without a manual reload.
 */
export function useData(pollMs = 60_000): State & { refresh: () => void } {
  const cached = readCache();
  const [state, setState] = useState<State>({
    data: cached,
    loading: true,
    error: null,
    ready: cached != null,
  });

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(DATA_URL, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: DataFile) => {
        if (cancelled) return;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* quota / private mode — fine, we just won't have offline cache */
        }
        setState({ data, loading: false, error: null, ready: true });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Keep showing cached data if we have it; only surface a hard error otherwise.
        setState((s) => ({
          ...s,
          loading: false,
          error: s.data ? null : err.message,
          ready: s.data != null,
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  useEffect(() => {
    const id = setInterval(refresh, pollMs);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pollMs]);

  return { ...state, refresh };
}

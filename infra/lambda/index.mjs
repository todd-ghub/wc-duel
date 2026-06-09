// World Cup 2026 live-data updater (AWS Lambda).
//
// Invoked every minute by EventBridge. Fetches the WC fixtures from
// football-data.org and writes a normalized matches.json to S3 — but only when
// the scores/statuses actually changed, so we make ~one PutObject per real
// update instead of 1,440/day. The API key lives in this function's env, never
// in the browser. Output shape matches the app's DataFile type exactly.
//
// Uses the AWS SDK v3 that ships with the nodejs20.x runtime — no bundling.

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const API = "https://api.football-data.org/v4/competitions/WC/matches";

const BUCKET = process.env.BUCKET;
const OBJECT_KEY = process.env.OBJECT_KEY || "matches.json";
const KEY = process.env.FOOTBALL_DATA_AK;

function normalizeOdds(odds) {
  if (!odds || typeof odds.homeWin !== "number") return null;
  return { home: odds.homeWin, draw: odds.draw, away: odds.awayWin };
}

function normalizeTeam(t) {
  return { tla: t?.tla ?? null, name: t?.name ?? "TBD", crest: t?.crest ?? null };
}

function normalizeMatch(m) {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    stage: m.stage,
    group: m.group ?? null,
    home: normalizeTeam(m.homeTeam),
    away: normalizeTeam(m.awayTeam),
    scoreHome: m.score?.fullTime?.home ?? null,
    scoreAway: m.score?.fullTime?.away ?? null,
    odds: normalizeOdds(m.odds),
  };
}

/** A signature of just the parts that matter, so we skip writes when nothing changed. */
function signature(matches) {
  return matches
    .map((m) => `${m.id}:${m.status}:${m.scoreHome}-${m.scoreAway}`)
    .join("|");
}

// djb2 — short, stable hash to stash in object metadata (metadata values are small).
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

async function currentSig() {
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: OBJECT_KEY }),
    );
    return head.Metadata?.sig ?? null;
  } catch {
    return null; // object doesn't exist yet
  }
}

export const handler = async () => {
  if (!KEY) throw new Error("FOOTBALL_DATA_AK not set");

  const res = await fetch(API, { headers: { "X-Auth-Token": KEY } });
  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${await res.text()}`);
  }
  const raw = await res.json();
  const matches = (raw.matches ?? []).map(normalizeMatch);
  const season = raw.matches?.[0]?.season ?? {};

  const sig = hash(signature(matches));
  if ((await currentSig()) === sig) {
    return { statusCode: 200, body: "no change" };
  }

  const body = JSON.stringify({
    fetchedAt: new Date().toISOString(),
    season: {
      startDate: season.startDate ?? "2026-06-11",
      endDate: season.endDate ?? "2026-07-19",
      currentMatchday: season.currentMatchday ?? null,
    },
    matches,
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: OBJECT_KEY,
      Body: body,
      ContentType: "application/json",
      CacheControl: "no-cache, max-age=0, must-revalidate",
      Metadata: { sig },
    }),
  );

  const finished = matches.filter((m) => m.status === "FINISHED").length;
  return { statusCode: 200, body: `wrote ${matches.length} matches (${finished} FT)` };
};

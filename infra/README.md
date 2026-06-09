# Live data on AWS (3-minute updates)

This optional stack gives the app near-live scores. An EventBridge schedule runs
a Lambda **every 3 minutes**; the Lambda fetches the World Cup fixtures from
football-data.org and writes a public, CORS-enabled `matches.json` to S3. The PWA
(hosted on GitHub Pages) reads that S3 URL directly.

```
EventBridge (rate: 3 min) ──▶ Lambda (fetch + normalize) ──▶ S3 matches.json ──▶ PWA
                                   │
                                   └ API key lives here, never in the browser
```

Why this and not just GitHub Pages: Pages caches assets (~10 min) and rebuilds
slowly, so it can't serve near-live data. S3 serves the JSON over HTTPS with
`Cache-Control: no-cache`, so the phone always gets the latest.

## Cost

Effectively free. Every 3 minutes is ~14k invocations/month — far under Lambda's
always-free tier (1M requests/month); EventBridge Scheduler's free tier covers the
schedule. The Lambda only writes to
S3 **when scores actually change** (it hashes the data and skips no-op writes), so
PutObject counts stay tiny — well within free limits. Worst case is a few cents a
month for S3 requests.

## Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
  and AWS credentials configured (`aws configure`).
- Your football-data.org API key.

## Deploy

```bash
cd infra
sam build
sam deploy --guided
```

During `--guided`, answer:

- **Stack name:** e.g. `wc2026-data`
- **AWS Region:** e.g. `us-east-1`
- **FootballDataApiKey:** paste your key (hidden; stored only in the Lambda env)
- Accept the rest of the defaults. Allow SAM to create IAM roles when prompted.

`sam deploy` prints a **`DataUrl`** output — that's your live endpoint, e.g.
`https://wc2026-data-databucket-xxxx.s3.us-east-1.amazonaws.com/matches.json`.

> Subsequent deploys: just `sam build && sam deploy` (params are remembered in
> `infra/samconfig.toml`, which is git-ignored because it contains your key).

## Point the app at it

1. **GitHub repo → Settings → Secrets and variables → Actions → Variables tab →
   New repository variable**
   - Name: `VITE_DATA_URL` · Value: the `DataUrl` from the stack output.
2. Re-run the Pages deploy (push, or the "Run workflow" button). The app now reads
   live data from S3. To test locally, put `VITE_DATA_URL=<DataUrl>` in your `.env`.

> The variable name is `VITE_DATA_URL` everywhere — local `.env`, the GitHub repo
> variable, and any other host's build env. If you host the front-end somewhere
> other than GitHub Pages (Netlify, Vercel, AWS Amplify/S3…), set `VITE_DATA_URL`
> in that platform's build environment to this same `DataUrl`.

That's it — the GitHub Action no longer needs to fetch data (the Lambda does it),
though leaving its cron on is harmless and keeps a fallback `matches.json` bundled.

## Pause / resume (e.g. between match days)

Don't waste invocations on idle days:

```bash
sam deploy --parameter-overrides ScheduleEnabled=false   # pause
sam deploy --parameter-overrides ScheduleEnabled=true    # resume
```

## Tear down

```bash
sam delete
```

(Empties and removes the bucket, Lambda, schedule, and roles.)

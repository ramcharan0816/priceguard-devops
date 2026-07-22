# PriceGuard

A price-drop tracker with a fully automated CI/CD pipeline and a scheduled
monitoring job — built to demonstrate production-style engineering practices,
not just a working app.

![CI/CD Pipeline](https://github.com/YOUR_USERNAME/priceguard/actions/workflows/ci-cd.yml/badge.svg)
![Scheduled Price Check](https://github.com/YOUR_USERNAME/priceguard/actions/workflows/price-check.yml/badge.svg)

> Replace `YOUR_USERNAME` above with your GitHub username once the repo is live.

## What it does

Add a product, its current price, and a target price. A scheduled job checks
the price every 30 minutes and emails you the moment it drops to or below
your target — no manual checking required.

## Architecture

```
                 ┌─────────────────────────┐
                 │   GitHub Actions (CI)    │
                 │  lint → test → audit →   │
                 │  build → deploy          │
                 └────────────┬─────────────┘
                              │ on push / PR
                              ▼
                 ┌─────────────────────────┐
   Browser ─────▶│   Next.js app (Vercel)   │
                 │  UI + API routes         │
                 └────────────┬─────────────┘
                              │ reads/writes
                              ▼
                 ┌─────────────────────────┐
                 │   Supabase (Postgres)    │
                 │  products / history /    │
                 │  alerts_sent             │
                 └────────────┬─────────────┘
                              ▲
                              │ POST /api/check-prices
                              │ (bearer-token secured)
                 ┌────────────┴─────────────┐
                 │  GitHub Actions (cron)    │
                 │  every 30 min             │
                 └────────────┬─────────────┘
                              │ if price ≤ target
                              ▼
                 ┌─────────────────────────┐
                 │   Resend (email alert)   │
                 └─────────────────────────┘
```

Two separate GitHub Actions workflows run this project:

1. **`ci-cd.yml`** — the code pipeline. Every push/PR runs lint → unit tests
   → dependency audit → build, in that order, each stage gating the next.
   PRs deploy to a Vercel preview URL; merges to `main` deploy to production.
2. **`price-check.yml`** — the operational pipeline. Runs on a cron schedule
   (independent of code changes) to check prices and trigger alerts. Also
   supports manual `workflow_dispatch` triggering for demos.

## Engineering decisions

- **Separate CI and cron workflows.** Code-quality checks and scheduled
  business logic are different concerns with different failure modes and
  different triggers — bundling them into one workflow would mean a broken
  price check could block a legitimate deploy, or vice versa.
- **Preview deploys on PR, production only on merge to `main`.** No code
  reaches production without first passing through, and being visible on,
  a staging URL.
- **Mock price feed instead of live scraping.** Most retailer terms of
  service prohibit scraping, and scrapers break unpredictably (CAPTCHAs,
  markup changes, IP blocks). `lib/mockPriceFeed.js` is a deterministic,
  seeded price simulator that mimics real fluctuation — everything
  downstream (storage, alerting, charts) is written against the same
  interface a real feed would use, so swapping it later is a one-file
  change, not a rewrite.
- **Bearer-token-protected cron endpoint.** `/api/check-prices` is a public
  URL by necessity (GitHub Actions calls it over the internet), so it's
  gated by a shared secret rather than trusting the caller.
- **`npm audit` as a gating step**, not just a background Dependabot alert —
  a high/critical vulnerability fails the build outright.

## Tech stack

- **Frontend/API:** Next.js (App Router)
- **Database:** Supabase (Postgres)
- **Email:** Resend
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel

## Setup

1. **Supabase:** create a project, then run `supabase/schema.sql` in the SQL
   editor to create the `products`, `price_history`, and `alerts_sent` tables.
2. **Vercel:** import this repo, add the environment variables below, and
   create two **Deploy Hooks** (Project Settings → Git → Deploy Hooks) — one
   for `main` (production) and one for previews.
3. **Resend:** create an API key (a free account is enough for demo volume).
4. **GitHub repo secrets** (Settings → Secrets and variables → Actions):

   | Secret | Used by |
   |---|---|
   | `SUPABASE_URL` | build step |
   | `SUPABASE_SERVICE_ROLE_KEY` | build step |
   | `VERCEL_PROD_DEPLOY_HOOK` | ci-cd.yml |
   | `VERCEL_PREVIEW_DEPLOY_HOOK` | ci-cd.yml |
   | `PRODUCTION_URL` | price-check.yml |
   | `PRICE_CHECK_SECRET` | price-check.yml (also set as a Vercel env var) |

5. **Vercel environment variables:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY`, `ALERT_FROM_EMAIL`, `PRICE_CHECK_SECRET`.

## Local-free workflow note

This project was built and deployed entirely through GitHub's web UI and
Vercel's dashboard — no local Node.js install or git CLI required. Every
file can be added via **Add file → Create new file** (or drag-and-drop
upload), and the CI/CD pipeline handles linting, testing, and building
in GitHub's cloud runners.

# Day Tracker

Live: [rystudio.vercel.app](https://rystudio.vercel.app)

A personal daily-tracking dashboard built as an installable PWA. Logs time-tagged activity entries (study, prayer, sleep, food, wasted time, custom categories), tracks budgets and streaks, and pushes reminder notifications. Shares its category schema and Postgres backend with a companion Flutter mobile app, so data stays consistent across web and mobile.

## Features

- **Entry logging** — tag time against built-in categories (study, prayer, sleep, food, wasting, other) or custom ones, with per-category colors.
- **Budgets** — set time budgets per category and track spend against them.
- **Streaks** — daily streak tracking to reinforce consistency.
- **Now notes** — quick capture for what you're doing right now.
- **Reminders** — scheduled reminders delivered via Web Push.
- **Locked session mode** — a focused, distraction-limited session view.
- **Stats and export** — aggregate stats view and data export endpoint.
- **PWA** — installable, with a service worker (`public/sw.js`) and manifest for offline-capable, app-like usage.

## Tech stack

- **Next.js 15** (App Router) with **React 19**
- **Tailwind CSS 4**
- **Neon** (`@neondatabase/serverless`) — serverless Postgres
- **web-push** — push notification delivery
- Route handlers under `app/api/*` for todos, budgets, entries, streak, reminders, now-notes, stats, export, push subscriptions, and locked sessions

## Project structure

```
app/
  api/
    todos/, budgets/, entries/, streak/, reminders/,
    now-notes/, stats/, export/, push-subscribe/, locked-session/
  page.js          main dashboard UI
  layout.js
lib/
  db.js            Postgres client
  push.js           web-push helpers
public/
  manifest.json, sw.js   PWA manifest and service worker
```

## Getting started

```bash
npm install
```

Create `.env.local`:

```
DATABASE_URL=<neon postgres connection string>
VAPID_PUBLIC_KEY=<web push public key>
VAPID_PRIVATE_KEY=<web push private key>
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

Category IDs are intentionally kept in sync with an existing companion Flutter app's database tags — changing them will affect cross-platform data compatibility.

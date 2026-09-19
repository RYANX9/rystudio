# Day Tracker

Live: [rystudio.vercel.app](https://rystudio.vercel.app)

A personal daily-tracking dashboard built as an installable PWA. Logs time-tagged activity entries, tracks budgets and consistency, runs persistent focus timers, shows daily and weekly stats, and keeps entries queued when offline. Shares its category schema and Postgres backend with a companion Flutter mobile app, so data stays consistent across web and mobile.

## Features

- **Entry logging** — quickly log time against built-in categories (study, prayer, sleep, food, wasting, other) or custom ones.
- **Live timer** — start and finish sessions with a persistent timer that survives navigation and refreshes.
- **Today dashboard** — see total tracked time, categories, budgets, timeline, and weekly rhythm at a glance.
- **Budgets** — set time budgets per category and track progress against them.
- **Analytics** — review seven-day trends, category distribution, averages, active days, and overall time patterns.
- **Date navigation** — move between days and review previous activity without leaving the dashboard.
- **Offline queue** — entries created while offline are stored locally and synced automatically when the connection returns.
- **Streaks** — track daily consistency and maintain existing streak functionality.
- **Now notes** — quickly capture what you're doing right now.
- **Reminders** — scheduled reminders delivered via Web Push.
- **Locked session mode** — a focused, distraction-limited session view.
- **Command palette** — use `Ctrl/Cmd + K` for fast navigation and actions.
- **Keyboard shortcuts** — quickly open logging and common tracker actions from the keyboard.
- **Custom categories** — create additional local tracking categories without changing the existing database tags.
- **Stats and export** — review aggregated activity and export tracked data.
- **PWA** — installable with a manifest and service worker for an app-like experience.

## Tech stack

- **Next.js 15** (App Router) with **React 19**
- **Tailwind CSS 4**
- **Neon** (`@neondatabase/serverless`) — serverless Postgres
- **web-push** — push notification delivery
- **Local storage** — persistent timer state, offline queue, settings, and custom categories
- Route handlers under `app/api/*` for todos, budgets, entries, streak, reminders, now-notes, stats, export, push subscriptions, and locked sessions

## Project structure

```text
app/
  api/
    todos/, budgets/, entries/, streak/, reminders/,
    now-notes/, stats/, export/, push-subscribe/, locked-session/
  page.js          main dashboard UI
  layout.js        app metadata and PWA configuration
  globals.css      global styles

lib/
  db.js            Postgres client
  push.js          web-push helpers

public/
  manifest.json    PWA manifest
  sw.js            service worker

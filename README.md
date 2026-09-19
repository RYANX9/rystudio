# Day Tracker

**Live:** [rystudio.vercel.app](https://rystudio.vercel.app)

A personal **time-intelligence dashboard** built as an installable PWA. Day Tracker turns daily activity into a clear timeline, useful statistics, budgets, trends, streaks, and focused sessions.

It is designed to make tracking extremely fast while providing enough data to understand how time is actually being spent.

The project also shares its category schema and Postgres backend with a companion Flutter mobile app, allowing the same data model to work across web and mobile.

---

## Features

### Daily Tracking

* **Activity logging** — log time against built-in categories such as study, prayer, sleep, food, wasting, and other.
* **Custom categories** — create additional categories without changing the existing database category IDs.
* **Quick logging** — add an activity in seconds without navigating through multiple screens.
* **Activity timeline** — see the complete history of a selected day.
* **Date navigation** — move between previous days, future days, and return to today.
* **Daily overview** — instantly see total tracked time, entry count, category distribution, and the dominant activity.

### Live Time Tracking

* **Persistent live timer** — start a session and let the tracker measure it automatically.
* **Refresh-safe timer** — the active timer survives page refreshes and navigation.
* **Category-based sessions** — assign a running session to a specific activity category.
* **One-tap session completion** — finish a session and automatically create an activity entry.
* **Offline-safe local timer state** — active timer information is stored locally so the session can recover after reopening the app.

### Analytics

* **Seven-day activity trend** — visualize how much time was tracked each day.
* **Weekly totals** — see total tracked time across the current seven-day window.
* **Daily averages** — understand average tracked time on active days.
* **Active-day count** — measure consistency across the week.
* **Category intelligence** — identify which activities consume the most tracked time.
* **Category distribution** — compare how time is divided between activities.
* **Historical date navigation** — inspect activity for previous days instead of being limited to today.

### Budgets

* **Per-category budgets** — define target amounts of time for individual categories.
* **Budget progress** — see progress toward a category's daily target.
* **Visual budget indicators** — quickly identify progress without reading raw numbers.
* **Budget-aware dashboard** — important targets are surfaced directly in the daily interface.

### Consistency

* **Streak tracking** — maintain daily activity consistency.
* **Weekly rhythm** — visually inspect whether activity is becoming more consistent.
* **Active-day analysis** — distinguish between days with meaningful tracked activity and empty days.

### Now & Focus

* **Now notes** — capture what you are doing right now.
* **Locked session mode** — provide a focused, distraction-limited environment for concentrated work.
* **Focus-oriented workflow** — combine active sessions, timing, and activity tracking.

### Offline & PWA

* **Installable PWA** — install Day Tracker like a native application.
* **Service worker** — application-level PWA support through `public/sw.js`.
* **Offline entry queue** — activity entries created while offline are stored locally.
* **Automatic synchronization** — queued entries are retried when the connection returns.
* **Online/offline indicator** — clearly shows whether the application is synchronized.
* **Local state persistence** — important client-side state can survive page refreshes.

### Notifications

* **Web Push notifications** — send reminders directly through the browser.
* **Scheduled reminders** — support reminder workflows through the existing reminders API.
* **Push subscriptions** — browser subscriptions are stored through the backend.

### Data

* **Statistics API** — aggregate activity data for analysis.
* **Export endpoint** — export tracked information for personal use or backup.
* **Postgres persistence** — activity and application data are stored in Neon Postgres.
* **Cross-platform schema** — the category model is shared with the companion Flutter application.

### Productivity

* **Command palette** — open actions with `Ctrl + K` / `Cmd + K`.
* **Keyboard shortcuts** — quickly access common actions without reaching for the mouse.
* **Fast actions** — logging, timers, navigation, analytics, and settings are accessible from the main dashboard.
* **Responsive interface** — designed for desktop, tablet, and mobile screens.
* **Reduced-motion support** — respects users who prefer reduced animation.
* **Keyboard focus states** — interactive controls provide visible focus feedback.

### Customization

* **Custom categories** — add categories directly from Settings.
* **Per-category colors** — categories are visually differentiated.
* **Settings/control room** — manage categories, accessibility preferences, and local application state.
* **Reduced-motion preference** — optional reduced animation behavior.
* **Local application state** — custom categories and certain client-side preferences are persisted locally.

---

## Tech Stack

### Frontend

* **Next.js 15** — App Router
* **React 19**
* **Tailwind CSS 4**
* Modern responsive UI
* Client-side state management with React hooks
* Browser APIs for local persistence and PWA functionality

### Backend

* **Next.js Route Handlers**
* **Neon** — serverless PostgreSQL
* **`@neondatabase/serverless`** — PostgreSQL access
* **`web-push`** — Web Push notification delivery

### PWA

* Web App Manifest
* Service Worker
* Installable application experience
* Offline-aware client behavior
* Local offline queue
* Reconnection synchronization
* Web Push notifications

---

## API

The application uses Next.js route handlers under `app/api`.

Current API areas include:

```text
/api/todos
/api/budgets
/api/entries
/api/streak
/api/reminders
/api/now-notes
/api/stats
/api/export
/api/push-subscribe
/api/locked-session
```

### Entries

The entries API is responsible for creating, reading, and deleting tracked activity.

Entries contain information such as:

* category/tag
* activity name
* duration
* start time
* timezone information

### Budgets

The budgets API manages time targets for categories.

### Stats

The statistics API provides aggregated activity data used by the dashboard and analytics views.

### Export

The export endpoint allows tracked data to be exported for personal backup and analysis.

### Push

The push subscription and reminder APIs provide the foundation for browser notifications.

---

## Project Structure

```text
app/
├── api/
│   ├── todos/
│   ├── budgets/
│   ├── entries/
│   ├── streak/
│   ├── reminders/
│   ├── now-notes/
│   ├── stats/
│   ├── export/
│   ├── push-subscribe/
│   └── locked-session/
│
├── page.js
├── layout.js
└── globals.css

lib/
├── db.js
└── push.js

public/
├── manifest.json
└── sw.js

middleware.ts
next.config.mjs
postcss.config.mjs
eslint.config.mjs
tsconfig.json
package.json
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RYANX9/rystudio.git
cd rystudio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=<neon-postgres-connection-string>

VAPID_PUBLIC_KEY=<web-push-public-key>
VAPID_PRIVATE_KEY=<web-push-private-key>

VAPID_EMAIL=<contact-email>
```

Do **not** commit `.env.local` to Git.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Production

Create a production build with:

```bash
npm run build
```

Start the production server with:

```bash
npm start
```

Run linting with:

```bash
npm run lint
```

Run TypeScript checking with:

```bash
npm run typecheck
```

---

## Environment Variables

| Variable            | Purpose                           |
| ------------------- | --------------------------------- |
| `DATABASE_URL`      | Neon PostgreSQL connection string |
| `VAPID_PUBLIC_KEY`  | Web Push public key               |
| `VAPID_PRIVATE_KEY` | Web Push private key              |
| `VAPID_EMAIL`       | Contact identity used by Web Push |

Keep all secrets server-side and never expose private credentials in client-side code.

---

## Database

Day Tracker uses PostgreSQL through Neon.

The existing project expects database tables supporting:

```text
entries
tag_budgets
todos
reminders
now_notes
locked_sessions
push_subscriptions
```

The database stores the persistent application data while the browser is used for temporary/local state such as the offline queue, active timer recovery, custom client preferences, and other PWA behavior.

---

## Cross-Platform Architecture

Day Tracker was designed around a shared data model.

The web application and companion Flutter application use the same PostgreSQL backend and category identifiers.

This means an activity created from one client can be represented consistently across the other client.

The built-in category identifiers are intentionally preserved:

```text
study
prayer
sleep
food
Wasting
other
```

**Do not rename or remove these identifiers without updating the companion mobile application and existing database data.**

---

## Offline Behavior

Day Tracker uses an offline-aware workflow for activity creation.

When the browser cannot reach the backend:

```text
User creates entry
       ↓
API request fails
       ↓
Entry stored in local queue
       ↓
UI shows Offline / queued state
       ↓
Connection returns
       ↓
Queued entries are sent to API
       ↓
Server stores entries
       ↓
Dashboard refreshes
```

This allows short periods without connectivity without immediately losing newly logged activity.

---

## PWA

The application is designed to behave like an installable application rather than only a traditional website.

PWA functionality includes:

* Web App Manifest
* Standalone display mode
* Service worker
* Installable application shell
* Mobile-friendly viewport configuration
* Offline-aware interactions
* Web Push support

Manifest:

```text
public/manifest.json
```

Service worker:

```text
public/sw.js
```

---

## Keyboard Shortcuts

| Shortcut       | Action               |
| -------------- | -------------------- |
| `Ctrl/Cmd + K` | Open command palette |
| `L`            | Open quick log       |
| `Esc`          | Close active dialog  |

The command palette also provides access to common application actions.

---

## Design Principles

Day Tracker is built around a few core principles:

### Fast

Logging time should take seconds rather than requiring a complicated workflow.

### Clear

The most important question should always be easy to answer:

> Where did my time go?

### Data-driven

The application should turn raw activity logs into useful trends, totals, and patterns.

### Cross-platform

Web and mobile clients should work from the same underlying data model.

### Offline-aware

Temporary connectivity problems should not immediately interrupt tracking.

### Installable

The application should feel natural on both desktop and mobile.

### Personal

The application is designed around personal time awareness rather than social metrics or public comparison.

---

## Roadmap

The project is being developed toward a more complete personal time-intelligence platform.

Planned areas include:

* Authentication and user accounts
* User-specific data isolation
* More advanced analytics
* Monthly and yearly reports
* Smarter budget forecasting
* Goal and routine systems
* Improved streak and consistency analysis
* Advanced focus sessions
* Better notification intelligence
* Full offline-first synchronization
* Web ↔ Flutter conflict resolution
* Import/restore workflows
* Expanded accessibility
* Automated unit and end-to-end testing
* CI/CD quality checks
* Performance monitoring
* Production error monitoring
* Database migrations and stronger constraints
* API validation and rate limiting

---

## Security Notes

Never commit:

```text
.env
.env.local
.env.production
```

or any other file containing:

* database credentials
* VAPID private keys
* authentication secrets
* API keys
* private tokens

If a secret is accidentally committed, rotate it immediately rather than relying only on deleting the file in a later commit.

---

## Portfolio

Day Tracker is intended to demonstrate more than a basic CRUD dashboard.

The project combines:

* Product design
* Responsive frontend development
* Next.js App Router
* React
* PostgreSQL
* Server-side API design
* PWA development
* Offline-aware state management
* Web Push
* Data visualization
* Time-based data modeling
* Persistent timers
* Cross-platform architecture
* Mobile/web data compatibility
* Accessibility considerations
* Keyboard-driven workflows

The goal is to turn a simple daily tracker into a practical **personal time-intelligence system**.

---

## License

This project is currently maintained as a personal portfolio project.

---

## Author

Built by **RYANX9**.

**Live:** https://rystudio.vercel.app

**Repository:** https://github.com/RYANX9/rystudio

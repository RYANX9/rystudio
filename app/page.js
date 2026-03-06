'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import NowPanel from '@/components/NowPanel';
import TodoPanel from '@/components/TodoPanel';
import WeeklyView from '@/components/WeeklyView';

const GOAL = 180;

function todayStr() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fmtDur(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}

function formatDateFull(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

const TABS = [
  { key: 'log',   icon: '◎', label: 'Log' },
  { key: 'tasks', icon: '✓', label: 'Tasks' },
  { key: 'now',   icon: '⊙', label: 'Now' },
  { key: 'week',  icon: '▦', label: 'Week' },
];

export default function Page() {
  const [tab, setTab] = useState('log');
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const tz = -new Date().getTimezoneOffset();
  const isToday = selectedDate === todayStr();

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?date=${date}&tz=${tz}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); } finally { setLoading(false); }
  }, [tz]);

  useEffect(() => { fetchEntries(selectedDate); }, [selectedDate, fetchEntries]);

  useEffect(() => {
    fetch(`/api/streak?tz=${tz}`).then(r => r.json()).then(setStreak).catch(() => {});
  }, [entries, tz]);

  function handleEntryAdded(raw) {
    const arr = Array.isArray(raw) ? raw : [raw];
    setEntries(prev => {
      const next = [...prev];
      arr.forEach(e => {
        const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
        if (d === selectedDate && !next.find(x => x.id === e.id)) next.push(e);
      });
      return next.sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    });
  }

  async function handleDelete(id) {
    await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function shiftDate(d) {
    const cur = new Date(selectedDate + 'T12:00:00');
    cur.setDate(cur.getDate() + d);
    setSelectedDate(cur.toISOString().slice(0, 10));
  }

  const studyMin = entries.filter(e => e.tag === 'study').reduce((s, e) => s + e.duration_minutes, 0);
  const pct = Math.min(100, Math.round((studyMin / GOAL) * 100));
  const lastEntryEnd = entries.length
    ? new Date(new Date(entries.at(-1).started_at).getTime() + entries.at(-1).duration_minutes * 60000).toISOString()
    : null;

  // SVG ring params
  const R = 26, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;
  const ringColor = pct >= 100 ? 'var(--study-dot)' : pct >= 60 ? 'var(--orange)' : pct >= 30 ? '#E8A22A' : 'var(--ink4)';

  return (
    <div style={pg.root}>

      {/* ── HEADER ── */}
      <header style={pg.header}>
        <div style={pg.headerInner}>
          <div style={pg.headerLeft}>
            <div style={pg.greeting}>
              {isToday ? 'Today' : formatDateFull(selectedDate)}
            </div>
            <div style={pg.subline}>
              {isToday ? formatDateFull(selectedDate) : 'Past day'}
            </div>
          </div>

          <div style={pg.headerRight}>
            {/* study ring */}
            <div style={pg.ringWrap} title={`${pct}% of 3h study goal`}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={R} fill="none" stroke="var(--bg2)" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r={R} fill="none"
                  stroke={ringColor} strokeWidth="5"
                  strokeDasharray={`${dash} ${C}`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <text x="32" y="33" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 10, fontWeight: 700, fill: ringColor, fontFamily: "'DM Mono', monospace" }}>
                  {pct}%
                </text>
              </svg>
              <div style={{ ...pg.ringLabel, color: ringColor }}>{fmtDur(studyMin)}</div>
            </div>

            {/* date nav */}
            <div style={pg.dateNav}>
              <button style={pg.navBtn} onClick={() => shiftDate(-1)}>‹</button>
              <button style={{ ...pg.navBtn, opacity: isToday ? 0.3 : 1 }}
                onClick={() => !isToday && shiftDate(1)} disabled={isToday}>›</button>
            </div>
          </div>
        </div>

        {/* streak pill */}
        {streak?.streak > 0 && (
          <div style={pg.streakRow}>
            <div style={pg.streakPill}>
              <span style={pg.streakDot} />
              <span style={pg.streakNum}>{streak.streak}</span>
              <span style={pg.streakTxt}>day streak</span>
            </div>
            {streak.today_minutes >= GOAL && (
              <div style={pg.goalBadge}>✓ goal hit</div>
            )}
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main style={pg.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            {loading
              ? <div style={pg.spin}>Loading entries…</div>
              : <Timeline entries={entries} onDelete={handleDelete} tz={tz} />
            }
          </>
        )}
        {tab === 'tasks' && <TodoPanel date={selectedDate} />}
        {tab === 'now' && <NowPanel />}
        {tab === 'week' && <WeeklyView />}
      </main>

      {/* ── TAB BAR ── */}
      <nav style={pg.tabBar}>
        {TABS.map(t => (
          <button key={t.key} style={pg.tabBtn} onClick={() => setTab(t.key)}>
            <span style={{ ...pg.tabIcon, color: tab === t.key ? 'var(--orange)' : 'var(--ink3)' }}>
              {t.icon}
            </span>
            <span style={{ ...pg.tabLabel, color: tab === t.key ? 'var(--orange)' : 'var(--ink3)', fontWeight: tab === t.key ? 600 : 400 }}>
              {t.label}
            </span>
            {tab === t.key && <span style={pg.tabDot} />}
          </button>
        ))}
      </nav>
    </div>
  );
}

const pg = {
  root: {
    minHeight: '100dvh',
    maxWidth: 480,
    margin: '0 auto',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    background: 'var(--surface)',
    padding: '20px 24px 16px',
    borderBottom: '1px solid rgba(28,26,23,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, minWidth: 0, paddingRight: 12 },
  greeting: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    lineHeight: 1.1,
  },
  subline: {
    fontSize: 13,
    color: 'var(--ink3)',
    fontWeight: 400,
    marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  ringWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: 600,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.02em',
  },
  dateNav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navBtn: {
    width: 28, height: 28,
    background: 'var(--surface2)',
    border: '1px solid var(--ink4)',
    borderRadius: 8,
    color: 'var(--ink2)',
    fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  streakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  streakPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--orange-bg)',
    border: '1px solid rgba(232,98,42,0.2)',
    borderRadius: 'var(--r-pill)',
    padding: '5px 12px',
  },
  streakDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: 'var(--orange)',
    display: 'block',
  },
  streakNum: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--orange)',
    fontFamily: "'DM Mono', monospace",
  },
  streakTxt: {
    fontSize: 12,
    color: 'var(--orange)',
    fontWeight: 500,
  },
  goalBadge: {
    background: 'var(--study-bg)',
    color: 'var(--study-c)',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 'var(--r-pill)',
    border: '1px solid rgba(42,122,80,0.2)',
  },
  content: {
    flex: 1,
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto',
    paddingBottom: 90,
  },
  spin: {
    textAlign: 'center',
    color: 'var(--ink3)',
    fontSize: 13,
    padding: '32px 0',
  },
  tabBar: {
    position: 'fixed',
    bottom: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: 'var(--surface)',
    borderTop: '1px solid rgba(28,26,23,0.07)',
    display: 'flex',
    padding: '8px 8px 16px',
    zIndex: 30,
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '6px 4px',
    position: 'relative',
    background: 'none',
    border: 'none',
  },
  tabIcon: {
    fontSize: 18,
    lineHeight: 1,
    transition: 'color 0.15s',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: '0.02em',
    transition: 'color 0.15s',
  },
  tabDot: {
    position: 'absolute',
    bottom: 0,
    width: 4, height: 4,
    borderRadius: '50%',
    background: 'var(--orange)',
  },
};

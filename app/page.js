'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import NowPanel from '@/components/NowPanel';
import TodoPanel from '@/components/TodoPanel';
import WeeklyView from '@/components/WeeklyView';

const GOAL = 180;

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtDur(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return `${mm}m`;
  if (mm === 0) return `${h}h`;
  return `${h}h ${mm}m`;
}

export default function Page() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(null);

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const tz = -new Date().getTimezoneOffset();
      const res = await fetch(`/api/entries?date=${date}&tz=${tz}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (_) { setEntries([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(selectedDate); }, [selectedDate, fetchEntries]);

  useEffect(() => {
    const tz = -new Date().getTimezoneOffset();
    fetch(`/api/streak?tz=${tz}`).then(r => r.json()).then(setStreak).catch(() => {});
  }, [entries]);

  function handleEntryAdded(newEntries) {
    const arr = Array.isArray(newEntries) ? newEntries : [newEntries];
    setEntries(prev => {
      const tz = -new Date().getTimezoneOffset();
      const filtered = arr.filter(e => {
        const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
        return d === selectedDate;
      });
      return [...prev, ...filtered].sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    });
  }

  async function handleDelete(id) {
    await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function shiftDate(days) {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const isToday = selectedDate === todayStr();
  const studyMin = entries.filter(e => e.tag === 'study').reduce((s, e) => s + e.duration_minutes, 0);
  const pct = Math.min(100, Math.round((studyMin / GOAL) * 100));
  const lastEntryEnd = entries.length > 0
    ? new Date(new Date(entries.at(-1).started_at).getTime() + entries.at(-1).duration_minutes * 60000).toISOString()
    : null;

  const TABS = [
    { key: 'log', label: 'Log' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'now', label: 'Now' },
    { key: 'week', label: 'Week' },
  ];

  return (
    <main style={s.main}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.appName}>chronicle</div>
            <div style={s.dateLabel}>{isToday ? 'Today' : formatDate(selectedDate)}</div>
          </div>
          <div style={s.headerRight}>
            {streak?.streak > 0 && (
              <div style={s.streakPill}>
                <span style={s.streakNum}>{streak.streak}</span>
                <span style={s.streakLabel}>day streak</span>
              </div>
            )}
            <div style={s.dateNav}>
              <button style={s.navBtn} onClick={() => shiftDate(-1)}>‹</button>
              <button style={{ ...s.navBtn, opacity: isToday ? 0.3 : 1 }} onClick={() => shiftDate(1)} disabled={isToday}>›</button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div style={{
              ...s.progressFill,
              width: `${pct}%`,
              background: pct >= 100 ? 'var(--accent2)' : pct >= 60 ? 'var(--accent)' : pct >= 30 ? 'var(--warn)' : '#D4907A',
            }} />
          </div>
          <div style={s.progressLabels}>
            <span style={s.progressText}>{fmtDur(studyMin)} studied</span>
            <span style={{ ...s.progressText, color: pct >= 100 ? 'var(--accent2)' : 'var(--ink3)' }}>
              {pct >= 100 ? '✓ goal hit' : `${pct}% of 3h`}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            {loading
              ? <div style={s.loading}>Loading...</div>
              : <Timeline entries={entries} onDelete={handleDelete} />
            }
          </>
        )}
        {tab === 'tasks' && <TodoPanel date={selectedDate} />}
        {tab === 'now' && <NowPanel />}
        {tab === 'week' && <WeeklyView />}
      </div>
    </main>
  );
}

const s = {
  main: {
    minHeight: '100vh',
    background: 'var(--bg)',
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 20px 12px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appName: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--ink3)',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--ink)',
    letterSpacing: '-0.02em',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 },
  streakPill: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    background: 'var(--accent-bg)',
    border: '1px solid #F2C4B0',
    borderRadius: 100,
    padding: '4px 10px',
  },
  streakNum: { fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: "'DM Mono', monospace" },
  streakLabel: { fontSize: 10, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.04em' },
  dateNav: { display: 'flex', gap: 4 },
  navBtn: {
    width: 30, height: 30,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--ink2)',
    fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  progressWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
  progressTrack: {
    height: 4,
    background: 'var(--border)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.6s ease, background 0.3s',
  },
  progressLabels: { display: 'flex', justifyContent: 'space-between' },
  progressText: { fontSize: 11, color: 'var(--ink3)', fontWeight: 500 },
  tabBar: {
    display: 'flex',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '0 6px',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--ink3)',
    padding: '12px 4px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
  },
  tabActive: {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
  },
  content: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  loading: {
    textAlign: 'center',
    color: 'var(--ink3)',
    fontSize: 13,
    padding: '32px 0',
  },
};

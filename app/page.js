'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm  from '@/components/EntryForm';
import Timeline   from '@/components/Timeline';
import NowPanel   from '@/components/NowPanel';
import TodoPanel  from '@/components/TodoPanel';
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
function fmtDateShort(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

const TABS = [
  { key: 'log',   label: 'LOG',   icon: <LogIcon /> },
  { key: 'tasks', label: 'TASKS', icon: <TaskIcon /> },
  { key: 'now',   label: 'NOW',   icon: <NowIcon /> },
  { key: 'week',  label: 'WEEK',  icon: <WeekIcon /> },
];

export default function Page() {
  const [tab,          setTab]          = useState('log');
  const [entries,      setEntries]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const tz      = -new Date().getTimezoneOffset();
  const isToday = selectedDate === todayStr();

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/entries?date=${date}&tz=${tz}`);
      const d = await r.json();
      setEntries(Array.isArray(d) ? d : []);
    } catch { setEntries([]); } finally { setLoading(false); }
  }, [tz]);

  useEffect(() => { fetchEntries(selectedDate); }, [selectedDate, fetchEntries]);

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
  const pct      = Math.min(100, Math.round((studyMin / GOAL) * 100));
  const lastEntryEnd = entries.length
    ? new Date(new Date(entries.at(-1).started_at).getTime() + entries.at(-1).duration_minutes * 60000).toISOString()
    : null;

  return (
    <div style={s.root}>

      <header style={s.header}>
        {/* date + nav row */}
        <div style={s.topRow}>
          <button style={s.navBtn} onClick={() => shiftDate(-1)}>
            <ChevLeft />
          </button>
          <span style={s.dateStr}>
            {isToday ? 'Today' : fmtDateShort(selectedDate)}
          </span>
          <button
            style={{ ...s.navBtn, opacity: isToday ? 0.25 : 1 }}
            onClick={() => !isToday && shiftDate(1)}
            disabled={isToday}
          >
            <ChevRight />
          </button>
        </div>

        {/* study time + goal */}
        <div style={s.studyRow}>
          <span style={s.studyNum}>{fmtDur(studyMin)}</span>
          <span style={s.studyLbl}>studied</span>
          <span style={s.pctBadge}>
            {pct}%
          </span>
        </div>

        {/* goal bar */}
        <div style={s.goalTrack}>
          <div style={{
            ...s.goalFill,
            width: `${pct}%`,
            background: pct >= 100 ? 'var(--study)' : pct >= 60 ? 'var(--study)' : 'var(--study)',
            opacity: pct >= 100 ? 1 : 0.65 + pct * 0.0035,
          }} />
        </div>
      </header>

      <main style={s.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            {loading
              ? <div style={s.spin}>loading…</div>
              : <Timeline entries={entries} onDelete={handleDelete} tz={tz} />
            }
          </>
        )}
        {tab === 'tasks' && <TodoPanel date={selectedDate} />}
        {tab === 'now'   && <NowPanel />}
        {tab === 'week'  && <WeeklyView />}
      </main>

      <nav style={s.tabBar}>
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button key={key} style={s.tabBtn} onClick={() => setTab(key)}>
              <span style={{ ...s.tabIcon, color: active ? 'var(--study)' : 'var(--ink3)' }}>
                {icon}
              </span>
              <span style={{
                ...s.tabLabel,
                color:      active ? 'var(--ink)'  : 'var(--ink3)',
                fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
              {active && <div style={s.tabDot} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function LogIcon() {
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <rect x="3" y="4" width="13" height="1.8" rx=".9" fill="currentColor"/>
    <rect x="3" y="8.5" width="8" height="1.8" rx=".9" fill="currentColor" opacity=".5"/>
    <rect x="3" y="13" width="10" height="1.8" rx=".9" fill="currentColor" opacity=".3"/>
  </svg>;
}
function TaskIcon() {
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <rect x="3" y="3.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="11.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="10" y1="5.5" x2="16" y2="5.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="10" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>;
}
function NowIcon() {
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M3 13.5l3.5-5.5 2.5 3.5L12 4l3.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function WeekIcon() {
  return <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <rect x="1.5" y="11" width="3" height="6" rx="1.5" fill="currentColor" opacity=".3"/>
    <rect x="6"   y="8"  width="3" height="9" rx="1.5" fill="currentColor" opacity=".6"/>
    <rect x="10.5" y="4" width="3" height="13" rx="1.5" fill="currentColor"/>
    <rect x="15"  y="9"  width="3" height="8" rx="1.5" fill="currentColor" opacity=".4"/>
  </svg>;
}
function ChevLeft() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function ChevRight() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

const s = {
  root: {
    minHeight: '100dvh',
    maxWidth: 480,
    margin: '0 auto',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '18px 22px 14px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  navBtn: {
    width: 30, height: 30,
    border: '1px solid var(--border)',
    borderRadius: '50%',
    background: 'var(--surface)',
    color: 'var(--ink2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dateStr: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink2)',
    letterSpacing: '0.04em',
  },
  studyRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  studyNum: {
    fontFamily: "'Lora', serif",
    fontSize: 38,
    fontWeight: 500,
    color: 'var(--ink)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  studyLbl: {
    fontSize: 13,
    color: 'var(--ink2)',
    flex: 1,
  },
  pctBadge: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--study)',
  },
  goalTrack: {
    height: 3,
    background: 'var(--border)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.5s ease',
  },
  content: {
    flex: 1,
    padding: '14px 18px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingBottom: 82,
  },
  spin: {
    textAlign: 'center',
    color: 'var(--ink3)',
    fontSize: 12,
    padding: '40px 0',
  },
  tabBar: {
    position: 'fixed',
    bottom: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: '100%', maxWidth: 480,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    padding: '8px 0 20px',
    zIndex: 30,
  },
  tabBtn: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 3,
    padding: '6px 0 2px',
    position: 'relative',
  },
  tabIcon: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24,
    transition: 'color 0.15s',
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: '0.1em',
    transition: 'color 0.15s, font-weight 0.15s',
  },
  tabDot: {
    position: 'absolute',
    bottom: 0,
    width: 16, height: 2,
    background: 'var(--study)',
    borderRadius: 1,
  },
};

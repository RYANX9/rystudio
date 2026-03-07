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
  { key: 'log',   label: 'LOG',   icon: <LogSVG /> },
  { key: 'tasks', label: 'TASKS', icon: <TaskSVG /> },
  { key: 'now',   label: 'NOW',   icon: <NowSVG /> },
  { key: 'week',  label: 'WEEK',  icon: <WeekSVG /> },
];

export default function Page() {
  const [tab,          setTab]          = useState('log');
  const [entries,      setEntries]      = useState([]);
  const [streak,       setStreak]       = useState(null);
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
  const totalMin = entries.reduce((s, e) => s + e.duration_minutes, 0);
  const pct      = Math.min(100, Math.round((studyMin / GOAL) * 100));
  const lastEntryEnd = entries.length
    ? new Date(new Date(entries.at(-1).started_at).getTime() + entries.at(-1).duration_minutes * 60000).toISOString()
    : null;

  return (
    <div style={pg.root}>

      {/* ── HEADER ── */}
      <header style={pg.header}>

        {/* top row */}
        <div style={pg.headerRow}>
          <div style={pg.headerLeft}>
            <div style={pg.dateLine}>
              {isToday ? 'TODAY' : fmtDateShort(selectedDate).toUpperCase()}
            </div>
            <div style={pg.studyDisplay}>
              <span style={pg.studyNum}>{fmtDur(studyMin)}</span>
              <span style={pg.studyLabel}>studied</span>
            </div>
          </div>

          <div style={pg.headerRight}>
            {/* study goal ring */}
            <GoalRing pct={pct} />

            {/* date nav */}
            <div style={pg.navCol}>
              <button style={pg.navBtn} onClick={() => shiftDate(-1)}>
                <ChevronUp />
              </button>
              <button style={{ ...pg.navBtn, opacity: isToday ? 0.2 : 1 }}
                onClick={() => !isToday && shiftDate(1)} disabled={isToday}>
                <ChevronDown />
              </button>
            </div>
          </div>
        </div>

        {/* streak + goal row */}
        <div style={pg.metaRow}>
          {streak?.streak > 0 && (
            <div style={pg.streakChip}>
              <span style={pg.streakDot} />
              <span style={pg.streakTxt}>{streak.streak} DAY STREAK</span>
            </div>
          )}
          {pct >= 100 && (
            <div style={pg.goalChip}>
              <span style={pg.goalTick}>✓</span>
              <span style={pg.goalTxt}>GOAL HIT</span>
            </div>
          )}
          {totalMin > 0 && (
            <div style={pg.totalChip}>
              <span style={pg.totalTxt}>{fmtDur(totalMin)} TOTAL</span>
            </div>
          )}
        </div>

      </header>

      {/* ── CONTENT ── */}
      <main style={pg.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            {loading
              ? <div style={pg.spin}>loading…</div>
              : <Timeline entries={entries} onDelete={handleDelete} tz={tz} />
            }
          </>
        )}
        {tab === 'tasks' && <TodoPanel date={selectedDate} />}
        {tab === 'now'   && <NowPanel />}
        {tab === 'week'  && <WeeklyView />}
      </main>

      {/* ── TAB BAR ── */}
      <nav style={pg.tabBar}>
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button key={key} style={pg.tabBtn} onClick={() => setTab(key)}>
              <div style={{ ...pg.tabIconWrap, color: active ? 'var(--or)' : 'var(--ink3)' }}>
                {icon}
              </div>
              <span style={{
                ...pg.tabLabel,
                color:      active ? 'var(--or)'  : 'var(--ink3)',
                fontWeight: active ? 700           : 400,
                letterSpacing: active ? '0.12em'  : '0.08em',
              }}>
                {label}
              </span>
              {active && <span style={pg.tabBar_activeLine} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── 24h ribbon component ── */

/* ── goal ring ── */
function GoalRing({ pct }) {
  const R = 24, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;
  const color = pct >= 100 ? 'var(--study)' : pct >= 60 ? 'var(--or)' : pct >= 30 ? '#C8882A' : 'var(--ink4)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="none" stroke="var(--s3)" strokeWidth="4" />
        <circle cx="30" cy="30" r={R} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        <text x="30" y="31" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 10, fontWeight: 700, fill: color, fontFamily: "'DM Mono', monospace" }}>
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 8, color, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: '0.04em' }}>
        STUDY
      </span>
    </div>
  );
}

/* ── icon SVGs ── */
function LogSVG() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="3" width="14" height="1.8" rx="0.9" fill="currentColor"/>
    <rect x="2" y="8" width="9" height="1.8" rx="0.9" fill="currentColor" opacity=".6"/>
    <rect x="2" y="13" width="11" height="1.8" rx="0.9" fill="currentColor" opacity=".4"/>
  </svg>;
}
function TaskSVG() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 5h2.5M2 9h2.5M2 13h2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6.5 5H16M6.5 9H13M6.5 13H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".5"/>
  </svg>;
}
function NowSVG() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 13l3-5 2.5 3 2.5-7L14 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" opacity=".4"/>
  </svg>;
}
function WeekSVG() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1"   y="10" width="3" height="7" rx="1.5" fill="currentColor" opacity=".3"/>
    <rect x="5.5" y="7"  width="3" height="10" rx="1.5" fill="currentColor" opacity=".55"/>
    <rect x="10"  y="4"  width="3" height="13" rx="1.5" fill="currentColor"/>
    <rect x="14.5" y="8" width="3" height="9" rx="1.5" fill="currentColor" opacity=".4"/>
  </svg>;
}
function ChevronUp() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 9l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function ChevronDown() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

/* ── styles ── */
const pg = {
  root: {
    minHeight: '100dvh',
    maxWidth: 480,
    margin: '0 auto',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'var(--s0)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 20px 14px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 4 },
  dateLine: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--ink3)',
    letterSpacing: '0.14em',
    fontFamily: "'DM Mono', monospace",
  },
  studyDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  studyNum: {
    fontSize: 44,
    fontWeight: 400,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  studyLabel: {
    fontSize: 12,
    color: 'var(--ink3)',
    fontWeight: 400,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    paddingBottom: 4,
  },
  navCol: { display: 'flex', flexDirection: 'column', gap: 4 },
  navBtn: {
    width: 28, height: 28,
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    borderRadius: 8,
    color: 'var(--ink2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  streakChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'var(--or-dim)',
    border: '1px solid var(--or-glow)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
  },
  streakDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: 'var(--or)', display: 'block', flexShrink: 0,
    boxShadow: '0 0 4px var(--or)',
  },
  streakTxt: {
    fontSize: 9, fontWeight: 700, color: 'var(--or)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
  goalChip: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'var(--study-dim)',
    border: '1px solid rgba(58,158,106,0.25)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
  },
  goalTick: { fontSize: 9, color: 'var(--study)', fontWeight: 700 },
  goalTxt: {
    fontSize: 9, fontWeight: 700, color: 'var(--study)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
  totalChip: {
    background: 'var(--s2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
  },
  totalTxt: {
    fontSize: 9, fontWeight: 500, color: 'var(--ink3)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
  content: {
    flex: 1,
    padding: '16px 16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingBottom: 86,
  },
  spin: {
    textAlign: 'center',
    color: 'var(--ink3)',
    fontSize: 12,
    padding: '40px 0',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.06em',
  },
  tabBar: {
    position: 'fixed',
    bottom: 0, left: '50%',
    transform: 'translateX(-50%)',
    width: '100%', maxWidth: 480,
    background: 'var(--s0)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    padding: '8px 0 20px',
    zIndex: 30,
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 0 2px',
    position: 'relative',
    background: 'none',
    border: 'none',
  },
  tabIconWrap: {
    width: 24, height: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s',
  },
  tabLabel: {
    fontSize: 8,
    letterSpacing: '0.1em',
    transition: 'color 0.15s',
    fontFamily: "'DM Mono', monospace",
  },
  tabBar_activeLine: {
    position: 'absolute',
    bottom: -2,
    width: 20, height: 2,
    background: 'var(--or)',
    borderRadius: 1,
    boxShadow: '0 0 6px var(--or)',
  },
};

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

function formatDateShort(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

// tab config — icon chars matching reference UI style
const TABS = [
  { key: 'log',   icon: LogIcon,   label: 'Log'   },
  { key: 'tasks', icon: TaskIcon,  label: 'Tasks' },
  { key: 'now',   icon: NowIcon,   label: 'Now'   },
  { key: 'week',  icon: WeekIcon,  label: 'Week'  },
];

export default function Page() {
  const [tab, setTab]               = useState('log');
  const [entries, setEntries]       = useState([]);
  const [streak, setStreak]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const tz      = -new Date().getTimezoneOffset();
  const isToday = selectedDate === todayStr();

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/entries?date=${date}&tz=${tz}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
    finally  { setLoading(false); }
  }, [tz]);

  useEffect(() => { fetchEntries(selectedDate); }, [selectedDate, fetchEntries]);

  useEffect(() => {
    fetch(`/api/streak?tz=${tz}`)
      .then(r => r.json())
      .then(setStreak)
      .catch(() => {});
  }, [entries, tz]);

  function handleEntryAdded(raw) {
    const arr = Array.isArray(raw) ? raw : [raw];
    setEntries(prev => {
      const next = [...prev];
      arr.forEach(e => {
        const d = new Date(new Date(e.started_at).getTime() + tz * 60000)
          .toISOString().slice(0, 10);
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

  const studyMin = entries
    .filter(e => e.tag === 'study')
    .reduce((s, e) => s + e.duration_minutes, 0);

  const pct = Math.min(100, Math.round((studyMin / GOAL) * 100));

  // ring color logic from reference — orange for partial, green for complete
  const ringColor = pct >= 100
    ? 'var(--study-c)'
    : pct >= 50
    ? 'var(--orange)'
    : 'var(--ink4)';

  const R = 22, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  const lastEntryEnd = entries.length
    ? new Date(
        new Date(entries.at(-1).started_at).getTime() +
        entries.at(-1).duration_minutes * 60000
      ).toISOString()
    : null;

  // tag totals for device-grid cards (like the 4 Lamp / 2 Air Purifier cards)
  const tagCounts = {};
  entries.forEach(e => {
    tagCounts[e.tag] = (tagCounts[e.tag] || 0) + 1;
  });

  const TAG_META = {
    study:   { label: 'Study',   color: 'var(--study-c)',  bg: 'var(--study-bg)'  },
    Wasting: { label: 'Wasting', color: 'var(--waste-c)',  bg: 'var(--waste-bg)'  },
    prayer:  { label: 'Prayer',  color: 'var(--pray-c)',   bg: 'var(--pray-bg)'   },
    food:    { label: 'Food',    color: 'var(--food-c)',   bg: 'var(--food-bg)'   },
    sleep:   { label: 'Sleep',   color: 'var(--sleep-c)',  bg: 'var(--sleep-bg)'  },
    other:   { label: 'Other',   color: 'var(--other-c)',  bg: 'var(--other-bg)'  },
  };

  return (
    <div style={pg.root}>

      {/* ── HEADER — matches reference "Hi, Nicole" header ── */}
      <header style={pg.header}>

        {/* top row: greeting + ring + date nav */}
        <div style={pg.headerTop}>
          <div style={pg.headerLeft}>
            {/* avatar + greeting block like reference */}
            <div style={pg.avatarRow}>
              <div style={pg.avatar}>
                <span style={pg.avatarInitial}>C</span>
              </div>
              <div style={pg.greetingBlock}>
                <div style={pg.greeting}>
                  {isToday ? 'Today' : formatDateShort(selectedDate)}
                </div>
                <div style={pg.subline}>Monitor and track your time</div>
              </div>
            </div>
          </div>

          {/* right side: SVG ring (like the circular indicator in reference) + nav */}
          <div style={pg.headerRight}>
            <div style={pg.ringBlock}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={R} fill="none" stroke="var(--bg2)" strokeWidth="4.5" />
                <circle
                  cx="28" cy="28" r={R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="4.5"
                  strokeDasharray={`${dash} ${C}`}
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
                <text x="28" y="29" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 9, fontWeight: 700, fill: ringColor, fontFamily: "'DM Mono', monospace" }}>
                  {pct}%
                </text>
              </svg>
              <div style={{ ...pg.ringLabel, color: ringColor }}>{fmtDur(studyMin)}</div>
            </div>

            <div style={pg.dateNav}>
              <button style={pg.navBtn} onClick={() => shiftDate(-1)}>‹</button>
              <button
                style={{ ...pg.navBtn, opacity: isToday ? 0.3 : 1 }}
                onClick={() => !isToday && shiftDate(1)}
                disabled={isToday}
              >›</button>
            </div>
          </div>
        </div>

        {/* energy stat + streak — the "932kwh / Data updated X hours ago" card */}
        <div style={pg.energyCard}>
          <div style={pg.energyLeft}>
            <div style={pg.energyIcon}>
              <BoltIcon size={18} color="var(--orange)" />
            </div>
            <div>
              <div style={pg.energyVal}>
                <span style={pg.energyNum}>{fmtDur(studyMin)}</span>
                <span style={pg.energyUnit}>studied</span>
              </div>
              <div style={pg.energySub}>
                {streak?.streak > 0
                  ? `${streak.streak} day streak · ${streak.today_minutes >= GOAL ? 'goal hit' : `${GOAL - (streak.today_minutes || 0)}m to go`}`
                  : 'Start your first entry'}
              </div>
            </div>
          </div>
          <div style={pg.energyArrow}>›</div>
        </div>

        {/* tag summary grid — 4 device cards from reference */}
        {entries.length > 0 && (
          <div style={pg.deviceGrid}>
            {Object.entries(TAG_META)
              .filter(([key]) => tagCounts[key])
              .slice(0, 4)
              .map(([key, meta]) => (
                <div key={key} style={{ ...pg.deviceCard, background: meta.bg }}>
                  <div style={pg.deviceCount}>
                    <span style={{ ...pg.deviceNum, color: meta.color }}>{tagCounts[key]}</span>
                    <span style={pg.deviceCountLabel}>entries</span>
                  </div>
                  <div style={{ ...pg.deviceLabel, color: meta.color }}>{meta.label}</div>
                  <div style={{ ...pg.deviceDot, background: meta.color }} />
                </div>
              ))}
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main style={pg.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            {loading
              ? <div style={pg.spin}>Loading…</div>
              : <Timeline entries={entries} onDelete={handleDelete} tz={tz} />
            }
          </>
        )}
        {tab === 'tasks' && <TodoPanel date={selectedDate} />}
        {tab === 'now'   && <NowPanel />}
        {tab === 'week'  && <WeeklyView />}
      </main>

      {/* ── TAB BAR — matches reference bottom nav ── */}
      <nav style={pg.tabBar}>
        {TABS.map(({ key, icon: Icon, label }) => {
          const active = tab === key;
          return (
            <button key={key} style={pg.tabBtn} onClick={() => setTab(key)}>
              <div style={{
                ...pg.tabIconWrap,
                background: active ? 'var(--dark)' : 'transparent',
              }}>
                <Icon size={18} color={active ? '#fff' : 'var(--ink3)'} />
              </div>
              <span style={{
                ...pg.tabLabel,
                color: active ? 'var(--ink)' : 'var(--ink3)',
                fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── inline SVG icon components ── */
function LogIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="2" rx="1" fill={color}/>
      <rect x="3" y="9" width="10" height="2" rx="1" fill={color}/>
      <rect x="3" y="14" width="12" height="2" rx="1" fill={color}/>
    </svg>
  );
}
function TaskIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 5h2M4 10h2M4 15h2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 5h8M8 10h8M8 15h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  );
}
function NowIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M6 14l2-4 2 3 2-6 2 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="3" width="16" height="14" rx="3" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}
function WeekIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="3" height="10" rx="1.5" fill={color} opacity=".35"/>
      <rect x="6.5" y="8" width="3" height="7" rx="1.5" fill={color} opacity=".55"/>
      <rect x="11" y="4" width="3" height="11" rx="1.5" fill={color}/>
      <rect x="15.5" y="7" width="3" height="8" rx="1.5" fill={color} opacity=".45"/>
    </svg>
  );
}
function BoltIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill={color}/>
    </svg>
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

  /* header */
  header: {
    background: 'var(--surface)',
    padding: '16px 20px 0',
    borderBottom: '1px solid rgba(28,26,23,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: { flex: 1, minWidth: 0 },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'var(--dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid var(--bg2)',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  greetingBlock: { minWidth: 0 },
  greeting: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    lineHeight: 1.1,
  },
  subline: {
    fontSize: 12,
    color: 'var(--ink3)',
    fontWeight: 400,
    marginTop: 3,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  ringBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  ringLabel: {
    fontSize: 9,
    fontWeight: 700,
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
    lineHeight: 1,
  },

  /* energy card — the dark stat pill at bottom of header */
  energyCard: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--dark)',
    borderRadius: 'var(--r)',
    padding: '14px 18px',
    marginBottom: 14,
    gap: 14,
  },
  energyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  energyIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--dark2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1.5px solid rgba(232,98,42,0.3)',
  },
  energyVal: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  energyNum: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  energyUnit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 400,
  },
  energySub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 400,
    marginTop: 3,
  },
  energyArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 20,
    flexShrink: 0,
  },

  /* device grid — 4 tag cards */
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 14,
  },
  deviceCard: {
    borderRadius: 'var(--r-sm)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    position: 'relative',
  },
  deviceCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  deviceNum: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontFamily: "'DM Mono', monospace",
  },
  deviceCountLabel: {
    fontSize: 10,
    color: 'var(--ink3)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  deviceLabel: {
    fontSize: 13,
    fontWeight: 600,
  },
  deviceDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    position: 'absolute',
    bottom: 14,
    right: 16,
  },

  /* main content */
  content: {
    flex: 1,
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 88,
  },
  spin: {
    textAlign: 'center',
    color: 'var(--ink3)',
    fontSize: 13,
    padding: '32px 0',
  },

  /* tab bar — matches reference bottom nav with icon pill style */
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: 'var(--surface)',
    borderTop: '1px solid rgba(28,26,23,0.07)',
    display: 'flex',
    padding: '10px 8px 20px',
    zIndex: 30,
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '4px 0',
    background: 'none',
    border: 'none',
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: '0.01em',
    transition: 'color 0.15s',
  },
};

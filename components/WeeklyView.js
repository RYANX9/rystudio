'use client';
import { useState, useEffect } from 'react';

const GOAL   = 180;
const TAG_C  = { study: '#2A7A50', Wasting: '#D13A3A', prayer: '#2B5BB8', food: '#C05D1A', sleep: '#6B3FC0', other: '#9CA3AF' };
const TAG_BG = { study: '#EAF4EE', Wasting: '#FDEAEA', prayer: '#EAF0FC', food: '#FDF0E6', sleep: '#F0EBFC', other: '#F0EDE8' };
const BLOCKS = [
  { label: 'B1', from: 13 * 60 + 5,  to: 16 * 60     },
  { label: 'B2', from: 17 * 60,       to: 18 * 60 + 20},
  { label: 'B3', from: 22 * 60 + 30,  to: 25 * 60     },
];

function todayStr() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function offsetDate(s, d) {
  const x = new Date(s + 'T12:00:00Z');
  x.setUTCDate(x.getUTCDate() + d);
  return x.toISOString().slice(0, 10);
}
function fmtDur(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}
function dayNarrow(s) {
  return new Date(s + 'T12:00:00Z').toLocaleDateString([], { weekday: 'narrow' });
}
function dateLong(s) {
  return new Date(s + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
function weekRange() {
  const t = new Date(todayStr() + 'T12:00:00Z');
  const d = t.getUTCDay();
  const m = new Date(t);
  m.setUTCDate(t.getUTCDate() - ((d + 6) % 7));
  const e = new Date(m);
  e.setUTCDate(m.getUTCDate() + 6);
  return { from: m.toISOString().slice(0, 10), to: e.toISOString().slice(0, 10) };
}

export default function WeeklyView() {
  const [week,     setWeek]     = useState([]);
  const [streak,   setStreak]   = useState(null);
  const [selected, setSelected] = useState(todayStr());
  const [loading,  setLoading]  = useState(true);
  const tz = -new Date().getTimezoneOffset();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { from, to } = weekRange();
    try {
      const [eRes, sRes] = await Promise.all([
        fetch(`/api/entries?from=${from}&to=${to}&tz=${tz}`),
        fetch(`/api/streak?tz=${tz}`),
      ]);
      const entries = await eRes.json();
      const streakD = await sRes.json();
      setStreak(streakD);
      setWeek(buildWeek(from, to, Array.isArray(entries) ? entries : [], tz));
    } catch { }
    finally  { setLoading(false); }
  }

  if (loading) return <div style={s.loading}>Loading week…</div>;

  const sel       = week.find(d => d.date === selected);
  const today     = todayStr();
  const weekStudy = week.reduce((a, d) => a + (d.tags.study || 0), 0);
  const goalDays  = week.filter(d => (d.tags.study || 0) >= GOAL).length;
  const maxStudy  = Math.max(...week.map(d => d.tags.study || 0), GOAL);

  return (
    <div style={s.wrap}>

      {/* ── Home Analysis hero card — exactly like reference right screen ── */}
      <div style={s.heroCard}>
        <div style={s.heroTop}>
          <div>
            <div style={s.heroTitle}>Home Analysis</div>
            <div style={s.heroNum}>
              <span style={s.heroNumBig}>{fmtDur(weekStudy)}</span>
              <span style={s.heroNumUnit}>studied</span>
            </div>
            {streak?.streak > 0 && (
              <div style={s.heroBadge}>
                <span style={s.heroBadgeDot} />
                <span style={s.heroBadgeTxt}>
                  {streak.streak} day streak
                </span>
              </div>
            )}
          </div>
          <div style={s.heroDropdown}>
            Weekly
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* bar chart — matches reference exactly: rounded bars, orange active, beige inactive */}
        <div style={s.chartArea}>
          {week.map(day => {
            const m   = day.tags.study || 0;
            const pct = Math.min(100, (m / maxStudy) * 100);
            const isSel  = day.date === selected;
            const isToday = day.date === today;
            return (
              <div key={day.date} style={s.barCol} onClick={() => setSelected(day.date)}>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.barFill,
                    height: `${Math.max(pct, m > 0 ? 4 : 0)}%`,
                    background: isSel
                      ? (pct >= (GOAL / maxStudy * 100) ? 'var(--study-c)' : 'var(--orange)')
                      : 'var(--bg2)',
                  }}>
                    {/* bolt icon inside active bar — exactly like reference */}
                    {isSel && m > 0 && (
                      <div style={s.barBolt}>
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <path d="M8 1.5L3 8h4.5L6 12.5l5-6.5H7L8 1.5z" fill="#fff"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <span style={{
                  ...s.barLabel,
                  color: isSel ? 'var(--orange)' : isToday ? 'var(--ink)' : 'var(--ink3)',
                  fontWeight: isToday ? 700 : 400,
                }}>
                  {dayNarrow(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* stat 2×2 grid — smaller cards below chart */}
      <div style={s.statGrid}>
        <div style={s.statCard}>
          <div style={{ ...s.statVal, color: 'var(--orange)' }}>{streak?.streak ?? 0}</div>
          <div style={s.statLbl}>Day streak</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>{streak?.longest_streak ?? 0}</div>
          <div style={s.statLbl}>Longest</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statVal, color: 'var(--study-c)' }}>{goalDays}/7</div>
          <div style={s.statLbl}>Goal days</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statVal}>{fmtDur(Math.round(weekStudy / 7))}</div>
          <div style={s.statLbl}>Avg / day</div>
        </div>
      </div>

      {/* per-device usage — exactly like reference bottom list */}
      {sel && (
        <div style={s.detailCard}>
          <div style={s.detailHeader}>
            <div>
              <div style={s.detailTitle}>
                {sel.date === today ? 'Today' : dateLong(sel.date)}
              </div>
              <div style={s.detailSub}>{fmtDur(sel.tags.study || 0)} studied</div>
            </div>
            <div style={s.detailPct}>
              {Math.min(100, Math.round(((sel.tags.study || 0) / GOAL) * 100))}%
            </div>
          </div>

          <div style={s.detailProgress}>
            <div style={{
              ...s.detailFill,
              width: `${Math.min(100, ((sel.tags.study || 0) / GOAL) * 100)}%`,
              background: (sel.tags.study || 0) >= GOAL ? 'var(--study-c)' : 'var(--orange)',
            }} />
          </div>

          {/* per-device usage list */}
          <div style={s.usageTitle}>
            Per-tag usage ({Object.keys(sel.tags).length})
          </div>

          <div style={s.usageList}>
            {Object.entries(sel.tags)
              .sort((a, b) => b[1] - a[1])
              .map(([tag, min]) => (
                <div key={tag} style={s.usageRow}>
                  <div style={{
                    ...s.usageIcon,
                    background: TAG_BG[tag] || '#eee',
                    border: `1.5px solid ${TAG_C[tag] || '#9CA3AF'}22`,
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TAG_C[tag] || '#9CA3AF' }} />
                  </div>
                  <div style={s.usageInfo}>
                    <div style={s.usageName}>{tag}</div>
                    <div style={s.usageCount}>
                      {Object.values(
                        Object.fromEntries(
                          (sel.entries || [])
                            .filter(e => e.tag === tag)
                            .map(e => [e.id, e])
                        )
                      ).length || '—'} entries
                    </div>
                  </div>
                  <div style={s.usageVal}>{fmtDur(min)}</div>
                </div>
              ))}
          </div>

          {/* study blocks */}
          <div style={s.blockRow}>
            {BLOCKS.map(b => {
              const covered = (sel.studyEntries || []).reduce((acc, e) => {
                const sm = localMin(e.started_at, tz);
                const em = sm + e.duration_minutes;
                return acc + Math.max(0, Math.min(em, b.to) - Math.max(sm, b.from));
              }, 0) >= 20;
              return (
                <div key={b.label} style={{
                  ...s.block,
                  background: covered ? 'var(--study-bg)' : 'var(--surface2)',
                  color:      covered ? 'var(--study-c)'  : 'var(--ink3)',
                  border:     `1.5px solid ${covered ? 'rgba(42,122,80,0.2)' : 'var(--ink4)'}`,
                }}>
                  {covered && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ marginRight: 4 }}>
                      <path d="M1 4l2.5 2.5L9 1" stroke="var(--study-c)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {b.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function localMin(iso, tz) {
  const d = new Date(new Date(iso).getTime() + tz * 60000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function buildWeek(from, to, entries, tz) {
  const days = [];
  const cur  = new Date(from + 'T12:00:00Z');
  const end  = new Date(to + 'T12:00:00Z');
  while (cur <= end) { days.push(cur.toISOString().slice(0, 10)); cur.setUTCDate(cur.getUTCDate() + 1); }
  const byDate = {}, studyByDate = {};
  entries.forEach(e => {
    const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
    if (!byDate[d]) byDate[d] = {};
    byDate[d][e.tag] = (byDate[d][e.tag] || 0) + e.duration_minutes;
    if (e.tag === 'study') { if (!studyByDate[d]) studyByDate[d] = []; studyByDate[d].push(e); }
  });
  return days.map(date => ({ date, tags: byDate[date] || {}, studyEntries: studyByDate[date] || [], entries: entries.filter(e => {
    const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
    return d === date;
  })}));
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '32px 0' },

  /* hero card — light surface like reference right screen */
  heroCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '20px 20px 16px',
    boxShadow: 'var(--sh)',
  },
  heroTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--ink)',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: 6,
  },
  heroNum: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  heroNumBig: {
    fontSize: 44,
    fontWeight: 800,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  heroNumUnit: {
    fontSize: 13,
    color: 'var(--ink3)',
    fontWeight: 400,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--dark)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
  },
  heroBadgeDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: 'var(--orange)',
    display: 'block',
    flexShrink: 0,
  },
  heroBadgeTxt: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  heroDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--dark)',
    color: '#fff',
    borderRadius: 'var(--r-pill)',
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },

  /* bar chart */
  chartArea: {
    display: 'flex',
    gap: 6,
    height: 100,
    alignItems: 'flex-end',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    height: '100%',
    cursor: 'pointer',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    background: 'var(--surface2)',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    transition: 'height 0.4s ease, background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  barBolt: {
    position: 'absolute',
    bottom: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barLabel: {
    fontSize: 10,
    transition: 'color 0.15s',
    fontFamily: "'DM Mono', monospace",
  },

  /* stat grid */
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  statCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '16px 18px',
    boxShadow: 'var(--sh)',
  },
  statVal: {
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 11,
    color: 'var(--ink3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
  },

  /* detail card — per-device usage like reference */
  detailCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '18px 20px',
    boxShadow: 'var(--sh)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--ink)',
    letterSpacing: '-0.02em',
  },
  detailSub: { fontSize: 12, color: 'var(--ink3)', marginTop: 3 },
  detailPct: {
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.03em',
  },
  detailProgress: {
    height: 5,
    background: 'var(--bg2)',
    borderRadius: 'var(--r-pill)',
    overflow: 'hidden',
  },
  detailFill: {
    height: '100%',
    borderRadius: 'var(--r-pill)',
    transition: 'width 0.5s ease',
  },

  usageTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink2)',
  },
  usageList: { display: 'flex', flexDirection: 'column', gap: 12 },
  usageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  usageIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  usageInfo: { flex: 1 },
  usageName: { fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
  usageCount: { fontSize: 11, color: 'var(--ink3)', marginTop: 2 },
  usageVal: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.02em',
  },

  blockRow: { display: 'flex', gap: 8 },
  block: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '9px 0',
    borderRadius: 'var(--r-sm)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
};

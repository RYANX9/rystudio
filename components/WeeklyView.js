'use client';
import { useState, useEffect } from 'react';

const GOAL   = 180;
const TAG_C  = { study: 'var(--study)', Wasting: 'var(--waste)', prayer: 'var(--pray)', food: 'var(--food)', sleep: 'var(--sleep)', other: 'var(--other)' };
const TAG_DIM= { study: 'var(--study-dim)', Wasting: 'var(--waste-dim)', prayer: 'var(--pray-dim)', food: 'var(--food-dim)', sleep: 'var(--sleep-dim)', other: 'var(--other-dim)' };
const BLOCKS = [
  { label: 'B1', from: 13*60+5,  to: 16*60     },
  { label: 'B2', from: 17*60,    to: 18*60+20   },
  { label: 'B3', from: 22*60+30, to: 25*60      },
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
  return new Date(s + 'T12:00:00Z').toLocaleDateString([], { weekday: 'narrow' }).toUpperCase();
}
function dateLong(s) {
  return new Date(s + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).toUpperCase();
}
function weekRange() {
  const t = new Date(todayStr() + 'T12:00:00Z');
  const d = t.getUTCDay();
  const m = new Date(t); m.setUTCDate(t.getUTCDate() - ((d + 6) % 7));
  const e = new Date(m); e.setUTCDate(m.getUTCDate() + 6);
  return { from: m.toISOString().slice(0,10), to: e.toISOString().slice(0,10) };
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
    } catch { } finally { setLoading(false); }
  }

  if (loading) return <div style={s.loading}>loading week…</div>;

  const today     = todayStr();
  const weekStudy = week.reduce((a, d) => a + (d.tags.study || 0), 0);
  const goalDays  = week.filter(d => (d.tags.study || 0) >= GOAL).length;
  const maxStudy  = Math.max(...week.map(d => d.tags.study || 0), GOAL, 1);
  const sel       = week.find(d => d.date === selected);

  return (
    <div style={s.wrap}>

      {/* ── hero readout ── */}
      <div style={s.heroCard}>
        <div style={s.heroTop}>
          <div style={s.heroLabel}>WEEKLY STUDY</div>
          <div style={s.heroNum}>
            <span style={s.heroNumBig}>{fmtDur(weekStudy)}</span>
          </div>
          {streak?.streak > 0 && (
            <div style={s.streakBadge}>
              <span style={s.streakDot} />
              <span style={s.streakTxt}>{streak.streak} DAY STREAK</span>
            </div>
          )}
        </div>

        {/* micro stats */}
        <div style={s.heroStats}>
          <div style={s.heroStat}>
            <span style={s.heroStatNum}>{streak?.longest_streak ?? 0}</span>
            <span style={s.heroStatLabel}>BEST STREAK</span>
          </div>
          <div style={s.heroStatDiv} />
          <div style={s.heroStat}>
            <span style={{ ...s.heroStatNum, color: 'var(--study)' }}>{goalDays}/7</span>
            <span style={s.heroStatLabel}>GOAL DAYS</span>
          </div>
          <div style={s.heroStatDiv} />
          <div style={s.heroStat}>
            <span style={s.heroStatNum}>{fmtDur(Math.round(weekStudy / 7))}</span>
            <span style={s.heroStatLabel}>AVG/DAY</span>
          </div>
        </div>

        {/* 7-day bar chart — dark bars with glowing active */}
        <div style={s.chart}>
          {week.map(day => {
            const m      = day.tags.study || 0;
            const pct    = Math.min(100, (m / maxStudy) * 100);
            const isSel  = day.date === selected;
            const isToday = day.date === today;
            const barColor = isSel
              ? (m >= GOAL ? 'var(--study)' : 'var(--or)')
              : 'var(--s3)';

            return (
              <div key={day.date} style={s.barWrap} onClick={() => setSelected(day.date)}>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.barFill,
                    height: `${Math.max(pct, m > 0 ? 3 : 0)}%`,
                    background: barColor,
                    boxShadow: isSel && m > 0 ? `0 0 10px ${barColor}` : 'none',
                  }} />
                </div>
                <span style={{
                  ...s.barLabel,
                  color:     isSel ? 'var(--or)' : isToday ? 'var(--ink)' : 'var(--ink3)',
                  fontWeight: isToday ? 700 : 400,
                }}>
                  {dayNarrow(day.date)}
                </span>
                {isSel && <div style={s.barSelLine} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── day detail ── */}
      {sel && (
        <div style={s.detailCard}>
          <div style={s.detailHeader}>
            <div>
              <div style={s.detailLabel}>
                {sel.date === today ? 'TODAY' : dateLong(sel.date)}
              </div>
              <div style={s.detailStudy}>
                <span style={s.detailStudyNum}>{fmtDur(sel.tags.study || 0)}</span>
                <span style={s.detailStudyLabel}>STUDY</span>
              </div>
            </div>
            <div style={s.detailPct}>
              <span style={{
                ...s.detailPctNum,
                color: (sel.tags.study || 0) >= GOAL ? 'var(--study)' : 'var(--or)',
              }}>
                {Math.min(100, Math.round(((sel.tags.study || 0) / GOAL) * 100))}
              </span>
              <span style={s.detailPctSign}>%</span>
            </div>
          </div>

          {/* progress bar */}
          <div style={s.progTrack}>
            <div style={{
              ...s.progFill,
              width: `${Math.min(100, ((sel.tags.study || 0) / GOAL) * 100)}%`,
              background: (sel.tags.study || 0) >= GOAL ? 'var(--study)' : 'var(--or)',
              boxShadow: `0 0 8px ${(sel.tags.study || 0) >= GOAL ? 'var(--study)' : 'var(--or)'}60`,
            }} />
          </div>

          {/* per-tag list */}
          {Object.keys(sel.tags).length > 0 ? (
            <div style={s.tagList}>
              <div style={s.tagListLabel}>PER-TAG BREAKDOWN</div>
              {Object.entries(sel.tags)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, min]) => {
                  const max = Math.max(...Object.values(sel.tags));
                  return (
                    <div key={tag} style={s.tagRow}>
                      <div style={{ ...s.tagDot, background: TAG_C[tag] || 'var(--other)', boxShadow: `0 0 4px ${TAG_C[tag] || 'var(--other)'}60` }} />
                      <span style={s.tagName}>{tag.toUpperCase()}</span>
                      <div style={s.tagBarWrap}>
                        <div style={{
                          ...s.tagBar,
                          width: `${(min / max) * 100}%`,
                          background: TAG_C[tag] || 'var(--other)',
                          boxShadow: `0 0 4px ${TAG_C[tag] || 'var(--other)'}40`,
                        }} />
                      </div>
                      <span style={{ ...s.tagVal, color: TAG_C[tag] || 'var(--other)' }}>
                        {fmtDur(min)}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={s.nothingLogged}>nothing logged</div>
          )}

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
                  background:  covered ? 'var(--study-dim)' : 'var(--s2)',
                  borderColor: covered ? 'rgba(58,158,106,0.3)' : 'var(--border)',
                  color:       covered ? 'var(--study)' : 'var(--ink3)',
                  boxShadow:   covered ? '0 0 8px var(--study-dim)' : 'none',
                }}>
                  {covered && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" style={{ marginRight: 5 }}>
                      <path d="M1 3.5l2 2L8 1" stroke="var(--study)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
  const end  = new Date(to   + 'T12:00:00Z');
  while (cur <= end) { days.push(cur.toISOString().slice(0,10)); cur.setUTCDate(cur.getUTCDate()+1); }
  const byDate = {}, studyByDate = {};
  entries.forEach(e => {
    const d = new Date(new Date(e.started_at).getTime()+tz*60000).toISOString().slice(0,10);
    if (!byDate[d]) byDate[d] = {};
    byDate[d][e.tag] = (byDate[d][e.tag]||0) + e.duration_minutes;
    if (e.tag==='study') { if (!studyByDate[d]) studyByDate[d]=[]; studyByDate[d].push(e); }
  });
  return days.map(date => ({ date, tags: byDate[date]||{}, studyEntries: studyByDate[date]||[] }));
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: {
    textAlign: 'center', color: 'var(--ink3)', fontSize: 10,
    padding: '40px 0', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },

  heroCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px 18px 14px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  heroTop: { display: 'flex', flexDirection: 'column', gap: 4 },
  heroLabel: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
  },
  heroNum: { display: 'flex', alignItems: 'baseline', gap: 8 },
  heroNumBig: {
    fontSize: 52, fontWeight: 300, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.05em', lineHeight: 1,
  },
  streakBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'var(--or-dim)',
    border: '1px solid var(--or-glow)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  streakDot: {
    width: 4, height: 4, borderRadius: '50%',
    background: 'var(--or)', display: 'block',
    boxShadow: '0 0 4px var(--or)', flexShrink: 0,
  },
  streakTxt: {
    fontSize: 8, fontWeight: 700, color: 'var(--or)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },

  heroStats: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
    paddingTop: 14,
  },
  heroStat: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  heroStatNum: {
    fontSize: 20, fontWeight: 400, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.03em',
  },
  heroStatLabel: {
    fontSize: 7, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace",
  },
  heroStatDiv: { width: 1, background: 'var(--border)', margin: '0 16px', alignSelf: 'stretch' },

  chart: {
    display: 'flex',
    gap: 6,
    height: 80,
    alignItems: 'flex-end',
    borderTop: '1px solid var(--border)',
    paddingTop: 14,
  },
  barWrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 5,
    height: '100%', cursor: 'pointer',
    position: 'relative',
  },
  barTrack: {
    flex: 1, width: '100%',
    background: 'var(--s2)',
    borderRadius: 4,
    overflow: 'hidden',
    display: 'flex', alignItems: 'flex-end',
  },
  barFill: {
    width: '100%', borderRadius: 4,
    transition: 'height 0.4s ease, background 0.2s',
  },
  barLabel: {
    fontSize: 9, transition: 'color 0.15s',
    fontFamily: "'DM Mono', monospace",
  },
  barSelLine: {
    position: 'absolute', bottom: 20,
    width: '60%', height: 2,
    background: 'var(--or)',
    borderRadius: 1,
    boxShadow: '0 0 4px var(--or)',
  },

  detailCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  detailHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
    marginBottom: 4,
  },
  detailStudy: { display: 'flex', alignItems: 'baseline', gap: 6 },
  detailStudyNum: {
    fontSize: 28, fontWeight: 400, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.04em',
  },
  detailStudyLabel: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
  detailPct: { display: 'flex', alignItems: 'flex-start' },
  detailPctNum: {
    fontSize: 40, fontWeight: 300, lineHeight: 0.95,
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.05em',
    transition: 'color 0.3s',
  },
  detailPctSign: {
    fontSize: 16, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace", marginTop: 4,
  },

  progTrack: { height: 3, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },

  tagList: { display: 'flex', flexDirection: 'column', gap: 10 },
  tagListLabel: {
    fontSize: 8, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
    marginBottom: 2,
  },
  tagRow: { display: 'flex', alignItems: 'center', gap: 10 },
  tagDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  tagName: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink2)',
    letterSpacing: '0.08em', fontFamily: "'DM Mono', monospace",
    minWidth: 58,
  },
  tagBarWrap: { flex: 1, height: 4, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' },
  tagBar: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
  tagVal: {
    fontSize: 12, fontWeight: 500,
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em',
    minWidth: 36, textAlign: 'right',
  },
  nothingLogged: {
    fontSize: 10, color: 'var(--ink3)', padding: '6px 0',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },

  blockRow: { display: 'flex', gap: 8 },
  block: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '9px 0',
    border: '1px solid',
    borderRadius: 'var(--r-xs)',
    fontSize: 9, fontWeight: 700,
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
    transition: 'all 0.2s',
  },
};

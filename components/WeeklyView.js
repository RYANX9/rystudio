'use client';
import { useState, useEffect } from 'react';

const GOAL  = 180;
const TAG_C = {
  study: 'var(--study)', Wasting: 'var(--waste)', prayer: 'var(--pray)',
  food: 'var(--food)', sleep: 'var(--sleep)', other: 'var(--other)',
};
const TAG_BG = {
  study: 'var(--study-bg)', Wasting: 'var(--waste-bg)', prayer: 'var(--pray-bg)',
  food: 'var(--food-bg)', sleep: 'var(--sleep-bg)', other: 'var(--other-bg)',
};

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
function dayLetter(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'narrow' });
}
function fmtDateFull(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
function weekRange() {
  const t = new Date(todayStr() + 'T12:00:00Z');
  const d = t.getUTCDay();
  const m = new Date(t); m.setUTCDate(t.getUTCDate() - ((d + 6) % 7));
  const e = new Date(m); e.setUTCDate(m.getUTCDate() + 6);
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
      const sd      = await sRes.json();
      setStreak(sd);
      setWeek(buildWeek(from, to, Array.isArray(entries) ? entries : [], tz));
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <div style={s.loading}>Loading week…</div>;

  const today     = todayStr();
  const weekStudy = week.reduce((a, d) => a + (d.tags.study || 0), 0);
  const goalDays  = week.filter(d => (d.tags.study || 0) >= GOAL).length;
  const maxStudy  = Math.max(...week.map(d => d.tags.study || 0), GOAL, 1);
  const sel       = week.find(d => d.date === selected);

  return (
    <div style={s.wrap}>

      {/* weekly summary card */}
      <div style={s.summaryCard}>
        <div style={s.summaryTop}>
          <div>
            <div style={s.summaryLabel}>This week</div>
            <div style={s.summaryStudy}>
              <span style={s.summaryNum}>{fmtDur(weekStudy)}</span>
              <span style={s.summaryLbl}>studied</span>
            </div>
          </div>
          <div style={s.summaryRight}>
            {streak?.streak > 0 && (
              <div style={s.streakPill}>
                <span style={s.streakDot} />
                <span style={s.streakTxt}>{streak.streak} day streak</span>
              </div>
            )}
            <div style={s.miniStats}>
              <span style={s.miniStat}>{goalDays}/7 goal days</span>
              <span style={s.miniStat}>{fmtDur(Math.round(weekStudy / 7))} avg</span>
            </div>
          </div>
        </div>

        {/* 7-bar chart */}
        <div style={s.chart}>
          {week.map(day => {
            const m      = day.tags.study || 0;
            const h      = Math.min(100, (m / maxStudy) * 100);
            const isSel  = day.date === selected;
            const isToday= day.date === today;
            const hitGoal= m >= GOAL;

            return (
              <div key={day.date} style={s.barCol} onClick={() => setSelected(day.date)}>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.barFill,
                    height: `${Math.max(h, m > 0 ? 4 : 0)}%`,
                    background: isSel
                      ? (hitGoal ? 'var(--study)' : 'var(--ink)')
                      : 'var(--border)',
                  }} />
                </div>
                <span style={{
                  ...s.barLbl,
                  color:      isSel ? 'var(--ink)' : isToday ? 'var(--ink2)' : 'var(--ink3)',
                  fontWeight: isToday ? 700 : 400,
                }}>
                  {dayLetter(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* selected day detail */}
      {sel && (
        <div style={s.detailCard}>
          <div style={s.detailHeader}>
            <div>
              <div style={s.detailDateLbl}>
                {sel.date === today ? 'Today' : fmtDateFull(sel.date)}
              </div>
              <div style={s.detailStudyRow}>
                <span style={s.detailStudyNum}>{fmtDur(sel.tags.study || 0)}</span>
                <span style={s.detailStudyLbl}>study</span>
              </div>
            </div>
            <div style={s.detailPct}>
              <span style={{
                ...s.detailPctNum,
                color: (sel.tags.study || 0) >= GOAL ? 'var(--study)' : 'var(--ink2)',
              }}>
                {Math.min(100, Math.round(((sel.tags.study || 0) / GOAL) * 100))}%
              </span>
              <span style={s.detailPctLbl}>of goal</span>
            </div>
          </div>

          <div style={s.detailProg}>
            <div style={{
              ...s.detailProgFill,
              width: `${Math.min(100, ((sel.tags.study || 0) / GOAL) * 100)}%`,
              background: (sel.tags.study || 0) >= GOAL ? 'var(--study)' : 'var(--ink)',
            }} />
          </div>

          {Object.keys(sel.tags).length > 0 ? (
            <div style={s.tagList}>
              {Object.entries(sel.tags)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, min]) => {
                  const max = Math.max(...Object.values(sel.tags));
                  return (
                    <div key={tag} style={s.tagRow}>
                      <span style={{ ...s.tagDot, background: TAG_C[tag] || 'var(--other)' }} />
                      <span style={s.tagName}>{tag}</span>
                      <div style={s.tagBarWrap}>
                        <div style={{
                          ...s.tagBarFill,
                          width: `${(min / max) * 100}%`,
                          background: TAG_C[tag] || 'var(--other)',
                          opacity: 0.4,
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
            <div style={s.nothingLogged}>Nothing logged</div>
          )}
        </div>
      )}
    </div>
  );
}

function buildWeek(from, to, entries, tz) {
  const days = [];
  const cur  = new Date(from + 'T12:00:00Z');
  const end  = new Date(to   + 'T12:00:00Z');
  while (cur <= end) { days.push(cur.toISOString().slice(0, 10)); cur.setUTCDate(cur.getUTCDate() + 1); }
  const byDate = {};
  entries.forEach(e => {
    const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
    if (!byDate[d]) byDate[d] = {};
    byDate[d][e.tag] = (byDate[d][e.tag] || 0) + e.duration_minutes;
  });
  return days.map(date => ({ date, tags: byDate[date] || {} }));
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '40px 0' },

  summaryCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px 20px 14px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  summaryTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: { fontSize: 11, color: 'var(--ink2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 },
  summaryStudy: { display: 'flex', alignItems: 'baseline', gap: 7 },
  summaryNum: { fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 500, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.02em' },
  summaryLbl: { fontSize: 13, color: 'var(--ink2)' },
  summaryRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  streakPill: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'var(--food-bg)',
    border: '1px solid var(--food-bd)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
  },
  streakDot: { width: 5, height: 5, borderRadius: '50%', background: 'var(--food)', display: 'block' },
  streakTxt: { fontSize: 11, fontWeight: 600, color: 'var(--food)' },
  miniStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  miniStat: { fontSize: 11, color: 'var(--ink2)' },

  chart: {
    display: 'flex', gap: 6, height: 72, alignItems: 'flex-end',
    borderTop: '1px solid var(--border2)', paddingTop: 12,
  },
  barCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 5, height: '100%', cursor: 'pointer',
  },
  barTrack: {
    flex: 1, width: '100%',
    background: 'var(--bg)',
    borderRadius: 4,
    display: 'flex', alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 4, transition: 'height 0.4s ease, background 0.2s' },
  barLbl: { fontSize: 11, transition: 'color 0.15s' },

  detailCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  detailDateLbl: { fontSize: 11, color: 'var(--ink2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 },
  detailStudyRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  detailStudyNum: { fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 },
  detailStudyLbl: { fontSize: 12, color: 'var(--ink2)' },
  detailPct: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  detailPctNum: { fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 400, lineHeight: 1, transition: 'color 0.3s' },
  detailPctLbl: { fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.07em', textTransform: 'uppercase' },

  detailProg: { height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  detailProgFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },

  tagList: { display: 'flex', flexDirection: 'column', gap: 9 },
  tagRow: { display: 'flex', alignItems: 'center', gap: 10 },
  tagDot: { width: 7, height: 7, borderRadius: '50%', display: 'block', flexShrink: 0 },
  tagName: { fontSize: 12, color: 'var(--ink2)', minWidth: 52, textTransform: 'capitalize' },
  tagBarWrap: { flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  tagBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
  tagVal: { fontSize: 13, fontWeight: 500, minWidth: 34, textAlign: 'right' },
  nothingLogged: { fontSize: 13, color: 'var(--ink3)', padding: '4px 0' },
};

'use client';
import { useState, useEffect } from 'react';

const TAG_COLORS = {
  study:   '#22c55e',
  Wasting: '#ef4444',
  prayer:  '#60a5fa',
  food:    '#f97316',
  sleep:   '#a78bfa',
  other:   '#6b7280',
};

const GOAL = 180;

export default function StatsView() {
  const [data, setData] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');
  const [budgets, setBudgets] = useState({});
  const [editBudget, setEditBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    load();
  }, [range]);

  useEffect(() => {
    fetch('/api/budgets')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const map = {};
          d.forEach((b) => { map[b.tag] = b.daily_limit_min; });
          setBudgets(map);
        }
      })
      .catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    const tz = -new Date().getTimezoneOffset();
    const to = todayStr();
    const from = offsetDate(to, -parseInt(range) + 1);

    try {
      const [statsRes, streakRes] = await Promise.all([
        fetch(`/api/stats?from=${from}&to=${to}&tz=${tz}`),
        fetch(`/api/streak?tz=${tz}`),
      ]);
      const stats = await statsRes.json();
      const streakData = await streakRes.json();
      setData(Array.isArray(stats) ? stats : []);
      setStreak(streakData);
    } catch (_) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveBudget(tag) {
    const min = parseInt(budgetInput);
    if (!min || min < 1) return;
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, daily_limit_min: min }),
    });
    setBudgets((prev) => ({ ...prev, [tag]: min }));
    setEditBudget(null);
    setBudgetInput('');
  }

  if (loading) return <div style={s.loading}>loading stats...</div>;

  // aggregate by date
  const byDate = {};
  for (const row of data) {
    const d = String(row.date).slice(0, 10);
    if (!byDate[d]) byDate[d] = {};
    byDate[d][row.tag] = (byDate[d][row.tag] || 0) + Number(row.total_minutes);
  }

  const dates = Object.keys(byDate).sort();

  // tag totals over range
  const tagTotals = {};
  for (const row of data) {
    tagTotals[row.tag] = (tagTotals[row.tag] || 0) + Number(row.total_minutes);
  }

  const totalStudy = tagTotals['study'] || 0;
  const days = dates.length || 1;
  const avgStudyPerDay = Math.round(totalStudy / days);
  const goalDays = dates.filter((d) => (byDate[d]['study'] || 0) >= GOAL).length;

  // best study day
  const bestDay = dates.reduce((best, d) => {
    const m = byDate[d]['study'] || 0;
    return m > (byDate[best]?.['study'] || 0) ? d : best;
  }, dates[0]);

  const maxBarMin = Math.max(...dates.map((d) => Object.values(byDate[d]).reduce((s, v) => s + v, 0)), 1);

  return (
    <div style={s.wrapper}>

      {/* range selector */}
      <div style={s.rangeRow}>
        {['7', '14', '30'].map((r) => (
          <button
            key={r}
            style={{ ...s.rangeBtn, ...(range === r ? s.rangeBtnActive : {}) }}
            onClick={() => setRange(r)}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* top stats */}
      <div style={s.statCards}>
        <div style={s.card}>
          <span style={{ ...s.cardVal, color: '#22c55e' }}>{fmtDur(avgStudyPerDay)}</span>
          <span style={s.cardLabel}>avg/day</span>
        </div>
        <div style={s.card}>
          <span style={s.cardVal}>{goalDays}/{days}</span>
          <span style={s.cardLabel}>goal days</span>
        </div>
        <div style={s.card}>
          <span style={{ ...s.cardVal, color: '#f59e0b' }}>{streak?.streak ?? 0}d</span>
          <span style={s.cardLabel}>streak</span>
        </div>
        <div style={s.card}>
          <span style={{ ...s.cardVal, color: '#a78bfa' }}>{streak?.longest_streak ?? 0}d</span>
          <span style={s.cardLabel}>best streak</span>
        </div>
      </div>

      {/* stacked daily bars */}
      <div style={s.section}>
        <div style={s.sectionLabel}>daily breakdown</div>
        <div style={s.barsWrap}>
          {dates.map((date) => {
            const dayData = byDate[date];
            const totalMin = Object.values(dayData).reduce((s, v) => s + v, 0);
            const studyMin = dayData['study'] || 0;
            const pct = (totalMin / maxBarMin) * 100;
            const goalHit = studyMin >= GOAL;
            const isToday = date === todayStr();

            return (
              <div key={date} style={s.barCol}>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, height: `${pct}%` }}>
                    {Object.entries(dayData)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, min]) => (
                        <div
                          key={tag}
                          style={{
                            width: '100%',
                            height: `${(min / totalMin) * 100}%`,
                            background: TAG_COLORS[tag] || '#555',
                            opacity: 0.8,
                          }}
                        />
                      ))}
                  </div>
                  {goalHit && <div style={s.goalDot} />}
                </div>
                <span style={{ ...s.barLabel, fontWeight: isToday ? '700' : '400', color: isToday ? '#e8e8e0' : '#444' }}>
                  {dayShort(date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* tag totals */}
      <div style={s.section}>
        <div style={s.sectionLabel}>tag totals — {range} days</div>
        {Object.entries(tagTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, min]) => {
            const maxMin = Math.max(...Object.values(tagTotals));
            const pct = (min / maxMin) * 100;
            const budget = budgets[tag];
            const perDay = Math.round(min / days);
            const overBudget = budget && perDay > budget;
            return (
              <div key={tag} style={s.tagRow}>
                <div style={s.tagRowLeft}>
                  <div style={{ ...s.dot, background: TAG_COLORS[tag] || '#555' }} />
                  <span style={s.tagName}>{tag}</span>
                </div>
                <div style={s.tagBarWrap}>
                  <div style={{
                    ...s.tagBarFill,
                    width: `${pct}%`,
                    background: TAG_COLORS[tag] || '#555',
                    opacity: overBudget ? 1 : 0.4,
                  }} />
                </div>
                <div style={s.tagRight}>
                  <span style={{ color: overBudget ? '#ef4444' : '#888', fontSize: '11px', fontWeight: '600' }}>
                    {fmtDur(min)}
                  </span>
                  {budget && (
                    <span style={{ fontSize: '10px', color: overBudget ? '#ef4444' : '#444' }}>
                      {fmtDur(perDay)}/d lim:{fmtDur(budget)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* budget editor */}
      <div style={s.section}>
        <div style={s.sectionLabel}>daily limits</div>
        {['study', 'Wasting', 'sleep', 'food', 'prayer', 'other'].map((tag) => (
          <div key={tag} style={s.budgetRow}>
            <div style={{ ...s.dot, background: TAG_COLORS[tag] || '#555', flexShrink: 0 }} />
            <span style={s.tagName}>{tag}</span>
            {editBudget === tag ? (
              <>
                <input
                  style={s.budgetInput}
                  type="number"
                  placeholder="min"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveBudget(tag)}
                  autoFocus
                />
                <button style={s.budgetSave} onClick={() => saveBudget(tag)}>save</button>
                <button style={s.budgetCancel} onClick={() => setEditBudget(null)}>×</button>
              </>
            ) : (
              <>
                <span style={s.budgetVal}>
                  {budgets[tag] ? fmtDur(budgets[tag]) : '—'}
                </span>
                <button style={s.editBtn} onClick={() => { setEditBudget(tag); setBudgetInput(budgets[tag] || ''); }}>
                  edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* best day callout */}
      {bestDay && (
        <div style={s.bestDay}>
          <span style={s.bestDayLabel}>best study day</span>
          <span style={s.bestDayVal}>{formatDate(bestDay)}</span>
          <span style={s.bestDayMin}>{fmtDur(byDate[bestDay]?.['study'] || 0)}</span>
        </div>
      )}

      {/* export range */}
      <button style={s.exportBtn} onClick={() => {
        const tz = -new Date().getTimezoneOffset();
        const to = todayStr();
        const from = offsetDate(to, -parseInt(range) + 1);
        window.open(`/api/export?from=${from}&to=${to}&tz=${tz}&format=csv`, '_blank');
      }}>
        export {range}-day CSV
      </button>
    </div>
  );
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function offsetDate(str, days) {
  const d = new Date(str + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayShort(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString([], { weekday: 'narrow' });
}

function formatDate(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtDur(min) {
  if (!min) return '0m';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  loading: { fontSize: '13px', color: '#555', textAlign: 'center', padding: '32px 0' },
  rangeRow: { display: 'flex', gap: '6px' },
  rangeBtn: {
    flex: 1, background: '#111', border: '1px solid #222', color: '#555',
    padding: '8px', fontSize: '12px', fontWeight: '700',
    fontFamily: "'Cairo', sans-serif", cursor: 'pointer', borderRadius: '8px',
  },
  rangeBtnActive: { background: '#1e1e1a', borderColor: '#333', color: '#e8e8e0' },
  statCards: { display: 'flex', gap: '6px' },
  card: {
    flex: 1, background: '#111', border: '1px solid #1e1e1a', borderRadius: '10px',
    padding: '12px 6px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '3px',
  },
  cardVal: { fontSize: '16px', fontWeight: '700', color: '#e8e8e0' },
  cardLabel: { fontSize: '9px', color: '#444', fontWeight: '600', letterSpacing: '0.06em', textAlign: 'center' },
  section: {
    background: '#111', border: '1px solid #1e1e1a', borderRadius: '10px',
    padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  sectionLabel: {
    fontSize: '10px', fontWeight: '700', color: '#444',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  barsWrap: {
    display: 'flex', gap: '4px', alignItems: 'flex-end',
    height: '80px',
  },
  barCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px', height: '100%',
  },
  barTrack: {
    flex: 1, width: '100%', background: '#1a1a16',
    borderRadius: '3px', overflow: 'hidden', position: 'relative',
    display: 'flex', alignItems: 'flex-end',
  },
  barFill: {
    width: '100%', display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end', overflow: 'hidden',
    transition: 'height 0.4s ease',
  },
  goalDot: {
    position: 'absolute', top: '3px', left: '50%', transform: 'translateX(-50%)',
    width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e',
  },
  barLabel: { fontSize: '9px', letterSpacing: '0.02em' },
  tagRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  tagRowLeft: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  tagName: { fontSize: '12px', color: '#888', fontWeight: '600' },
  tagBarWrap: {
    flex: 1, height: '7px', background: '#1a1a16',
    borderRadius: '3px', overflow: 'hidden', position: 'relative',
  },
  tagBarFill: {
    position: 'absolute', top: 0, left: 0,
    height: '100%', borderRadius: '3px', transition: 'width 0.4s ease',
  },
  tagRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' },
  budgetRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '6px 0', borderBottom: '1px solid #1a1a16',
  },
  budgetInput: {
    background: '#0f0f0d', border: '1px solid #333', color: '#e8e8e0',
    padding: '4px 8px', fontSize: '12px', fontFamily: "'Cairo', sans-serif",
    outline: 'none', borderRadius: '5px', width: '60px',
  },
  budgetSave: {
    background: '#1e1e1a', border: '1px solid #333', color: '#e8e8e0',
    fontSize: '11px', fontWeight: '700', fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer', padding: '4px 8px', borderRadius: '5px',
  },
  budgetCancel: {
    background: 'none', border: 'none', color: '#555',
    fontSize: '16px', cursor: 'pointer', padding: '0 2px',
  },
  budgetVal: { marginLeft: 'auto', fontSize: '12px', color: '#555', fontWeight: '600' },
  editBtn: {
    background: 'none', border: '1px solid #222', color: '#555',
    fontSize: '10px', fontWeight: '700', fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer', padding: '2px 7px', borderRadius: '4px',
  },
  bestDay: {
    background: '#0d1f0d', border: '1px solid #166534', borderRadius: '10px',
    padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  bestDayLabel: { fontSize: '10px', color: '#444', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
  bestDayVal: { fontSize: '15px', color: '#e8e8e0', fontWeight: '700' },
  bestDayMin: { fontSize: '22px', color: '#22c55e', fontWeight: '700' },
  exportBtn: {
    background: '#111', border: '1px solid #222', color: '#666',
    padding: '11px', fontSize: '12px', fontWeight: '600',
    fontFamily: "'Cairo', sans-serif", cursor: 'pointer', borderRadius: '10px',
  },
};

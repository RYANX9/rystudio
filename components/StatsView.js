'use client';
import { useState, useEffect } from 'react';

const RANGES = [7, 14, 30];
const GOAL   = 180;

const TAG_C  = { study:'#2A7A50', Wasting:'#D13A3A', prayer:'#2B5BB8', food:'#C05D1A', sleep:'#6B3FC0', other:'#9CA3AF' };
const TAG_BG = { study:'#EAF4EE', Wasting:'#FDEAEA', prayer:'#EAF0FC', food:'#FDF0E6', sleep:'#F0EBFC', other:'#F0EDE8' };

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

export default function StatsView() {
  const [range, setRange]     = useState(7);
  const [stats, setStats]     = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [editBudget, setEditBudget] = useState(null);
  const [budgetVal, setBudgetVal]   = useState('');
  const tz = -new Date().getTimezoneOffset();

  useEffect(() => { load(range); }, [range]);

  async function load(r) {
    setLoading(true);
    const from = offsetDate(todayStr(), -(r - 1));
    const to   = todayStr();
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`/api/stats?from=${from}&to=${to}&tz=${tz}`),
        fetch('/api/budgets'),
      ]);
      const sData = await sRes.json();
      const bData = await bRes.json();
      setStats(Array.isArray(sData) ? sData : []);
      if (Array.isArray(bData)) {
        const map = {};
        bData.forEach(b => { map[b.tag] = b.daily_minutes; });
        setBudgets(map);
      }
    } catch { } finally { setLoading(false); }
  }

  async function saveBudget(tag) {
    const mins = parseInt(budgetVal);
    if (!mins || mins < 1) return;
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, daily_minutes: mins }),
    });
    setBudgets(prev => ({ ...prev, [tag]: mins }));
    setEditBudget(null);
  }

  async function exportCSV() {
    const from = offsetDate(todayStr(), -(range - 1));
    const url  = `/api/export?from=${from}&to=${todayStr()}&tz=${tz}&format=csv`;
    const res  = await fetch(url);
    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chronicle-${from}-${todayStr()}.csv`;
    a.click();
  }

  // derived
  const tagTotals = {};
  const dailyStudy = {};
  stats.forEach(r => {
    const tag = r.tag, m = Number(r.total_minutes), d = String(r.date).slice(0, 10);
    tagTotals[tag] = (tagTotals[tag] || 0) + m;
    if (tag === 'study') dailyStudy[d] = (dailyStudy[d] || 0) + m;
  });

  const studyTotal  = tagTotals.study || 0;
  const avgStudy    = Math.round(studyTotal / range);
  const goalDays    = Object.values(dailyStudy).filter(m => m >= GOAL).length;
  const bestDay     = Object.entries(dailyStudy).sort((a, b) => b[1] - a[1])[0];
  const sortedTags  = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]);
  const maxTagMin   = sortedTags[0]?.[1] || 1;

  // daily study bars (last range days)
  const days = [];
  for (let i = range - 1; i >= 0; i--) days.push(offsetDate(todayStr(), -i));

  return (
    <div style={s.wrap}>

      {/* range selector */}
      <div style={s.rangeRow}>
        {RANGES.map(r => (
          <button
            key={r}
            style={{
              ...s.rangeBtn,
              background: range === r ? 'var(--dark)' : 'var(--surface)',
              color: range === r ? '#fff' : 'var(--ink2)',
              border: `1px solid ${range === r ? 'var(--dark)' : 'var(--ink4)'}`,
            }}
            onClick={() => setRange(r)}
          >
            {r}d
          </button>
        ))}
        <button style={s.exportBtn} onClick={exportCSV}>↓ CSV</button>
      </div>

      {loading ? (
        <div style={s.loading}>Loading…</div>
      ) : (
        <>
          {/* ── hero stat card ── */}
          <div style={s.heroCard}>
            <div style={s.heroDark}>
              <div style={s.heroNum}>{fmtDur(studyTotal)}</div>
              <div style={s.heroSub}>studied in {range} days</div>
            </div>
            <div style={s.heroLight}>
              <div style={s.heroMini}>
                <div style={s.heroMiniVal}>{fmtDur(avgStudy)}</div>
                <div style={s.heroMiniLbl}>avg / day</div>
              </div>
              <div style={s.heroDivider} />
              <div style={s.heroMini}>
                <div style={{ ...s.heroMiniVal, color: 'var(--study-c)' }}>{goalDays}</div>
                <div style={s.heroMiniLbl}>goal days</div>
              </div>
              {bestDay && (
                <>
                  <div style={s.heroDivider} />
                  <div style={s.heroMini}>
                    <div style={s.heroMiniVal}>{fmtDur(bestDay[1])}</div>
                    <div style={s.heroMiniLbl}>best day</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── daily study bars ── */}
          <div style={s.barsCard}>
            <div style={s.cardTitle}>Daily study — {range}d</div>
            <div style={s.bars}>
              {days.map(d => {
                const m   = dailyStudy[d] || 0;
                const pct = Math.min(100, Math.round((m / GOAL) * 100));
                const isT = d === todayStr();
                return (
                  <div key={d} style={s.barCol} title={`${d}: ${fmtDur(m)}`}>
                    <div style={s.barTrack}>
                      <div style={{
                        ...s.barFill,
                        height: `${Math.max(pct, m > 0 ? 2 : 0)}%`,
                        background: pct >= 100 ? 'var(--study-c)' : pct >= 50 ? 'var(--orange)' : pct > 0 ? '#E8A22A' : 'transparent',
                      }} />
                    </div>
                    {isT && <div style={s.barDot} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── tag breakdown ── */}
          <div style={s.tagsCard}>
            <div style={s.cardTitle}>By tag</div>
            {sortedTags.length === 0 && <div style={s.none}>No data</div>}
            {sortedTags.map(([tag, total]) => {
              const daily  = Math.round(total / range);
              const budget = budgets[tag];
              const over   = budget && daily > budget;
              return (
                <div key={tag} style={s.tagRow}>
                  <div style={{ ...s.tagDot, background: TAG_C[tag] || '#9CA3AF' }} />
                  <span style={s.tagName}>{tag}</span>
                  <div style={s.tagBarWrap}>
                    <div style={{
                      ...s.tagBar,
                      width: `${(total / maxTagMin) * 100}%`,
                      background: TAG_BG[tag] || '#eee',
                      borderLeft: `3px solid ${TAG_C[tag] || '#9CA3AF'}`,
                    }} />
                  </div>
                  <div style={s.tagRight}>
                    <span style={s.tagTotal}>{fmtDur(total)}</span>
                    {budget && (
                      <span style={{
                        ...s.tagBudget,
                        color: over ? 'var(--waste-c)' : 'var(--ink3)',
                      }}>
                        {over ? '↑' : ''} {fmtDur(daily)}/d · lim {fmtDur(budget)}
                      </span>
                    )}
                  </div>
                  <button
                    style={s.editBudgetBtn}
                    onClick={() => { setEditBudget(tag); setBudgetVal(String(budget || '')); }}
                    title="Set daily budget"
                  >
                    ⚙
                  </button>
                </div>
              );
            })}

            {/* inline budget editor */}
            {editBudget && (
              <div style={s.budgetEditor}>
                <span style={s.budgetTag}>{editBudget}</span>
                <input
                  style={s.budgetInput}
                  type="number" placeholder="min/day"
                  value={budgetVal}
                  onChange={e => setBudgetVal(e.target.value)}
                  autoFocus
                />
                <button style={s.budgetSave} onClick={() => saveBudget(editBudget)}>Save</button>
                <button style={s.budgetCancel} onClick={() => setEditBudget(null)}>✕</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  wrap: { display:'flex', flexDirection:'column', gap:12 },
  loading: { textAlign:'center', color:'var(--ink3)', fontSize:13, padding:'32px 0' },

  rangeRow: { display:'flex', gap:8 },
  rangeBtn: {
    padding:'8px 18px', borderRadius:'var(--r-pill)',
    fontSize:13, fontWeight:600,
    transition:'all 0.15s',
    boxShadow:'var(--sh)',
  },
  exportBtn: {
    marginLeft:'auto',
    background:'var(--surface)',
    border:'1px solid var(--ink4)',
    color:'var(--ink2)',
    borderRadius:'var(--r-pill)',
    padding:'8px 14px',
    fontSize:12, fontWeight:600,
    boxShadow:'var(--sh)',
  },

  heroCard: {
    background:'var(--surface)', borderRadius:'var(--r)',
    overflow:'hidden', boxShadow:'var(--sh)',
  },
  heroDark: {
    background:'var(--dark)', padding:'18px 20px',
  },
  heroNum: {
    fontSize:32, fontWeight:800, color:'#fff',
    fontFamily:"'DM Mono',monospace", letterSpacing:'-0.03em', lineHeight:1,
  },
  heroSub: { fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 },
  heroLight: {
    display:'flex', padding:'14px 20px', gap:0,
  },
  heroMini: { flex:1, display:'flex', flexDirection:'column', gap:3 },
  heroMiniVal: {
    fontSize:18, fontWeight:700, color:'var(--ink)',
    fontFamily:"'DM Mono',monospace", letterSpacing:'-0.02em',
  },
  heroMiniLbl: {
    fontSize:10, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.05em',
  },
  heroDivider: { width:1, background:'var(--ink4)', margin:'0 16px', alignSelf:'stretch' },

  barsCard: {
    background:'var(--surface)', borderRadius:'var(--r)',
    padding:'16px 16px 14px', boxShadow:'var(--sh)',
  },
  cardTitle: { fontSize:13, fontWeight:600, color:'var(--ink2)', marginBottom:12 },
  bars: { display:'flex', gap:4, alignItems:'flex-end', height:80 },
  barCol: {
    flex:1, display:'flex', flexDirection:'column',
    alignItems:'center', gap:4, height:'100%',
  },
  barTrack: {
    flex:1, width:'100%', background:'var(--surface2)',
    borderRadius:4, overflow:'hidden', display:'flex', alignItems:'flex-end',
  },
  barFill: { width:'100%', borderRadius:4, transition:'height 0.5s ease' },
  barDot: {
    width:4, height:4, borderRadius:'50%', background:'var(--orange)',
  },

  tagsCard: {
    background:'var(--surface)', borderRadius:'var(--r)',
    padding:'16px 18px', boxShadow:'var(--sh)',
    display:'flex', flexDirection:'column', gap:12,
  },
  tagRow: { display:'flex', alignItems:'center', gap:10 },
  tagDot: { width:8, height:8, borderRadius:'50%', flexShrink:0 },
  tagName: { fontSize:12, fontWeight:600, color:'var(--ink2)', minWidth:56 },
  tagBarWrap: { flex:1, height:10, borderRadius:4, overflow:'hidden', background:'var(--surface2)' },
  tagBar: { height:'100%', borderRadius:4, transition:'width 0.4s ease' },
  tagRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', minWidth:80 },
  tagTotal: { fontSize:12, fontWeight:700, color:'var(--ink)', fontFamily:"'DM Mono',monospace" },
  tagBudget: { fontSize:10, color:'var(--ink3)', marginTop:1 },
  editBudgetBtn: {
    fontSize:12, color:'var(--ink3)', padding:4,
    flexShrink:0, lineHeight:1,
  },
  none: { fontSize:13, color:'var(--ink3)', padding:'8px 0' },

  budgetEditor: {
    display:'flex', alignItems:'center', gap:8,
    background:'var(--surface2)',
    border:'1px solid var(--ink4)',
    borderRadius:'var(--r-sm)',
    padding:'10px 12px',
    marginTop:4,
  },
  budgetTag: { fontSize:13, fontWeight:600, color:'var(--ink)', minWidth:60 },
  budgetInput: {
    flex:1, background:'transparent', border:'none',
    color:'var(--ink)', fontSize:14,
    fontFamily:"'DM Mono',monospace",
  },
  budgetSave: {
    background:'var(--dark)', color:'#fff',
    borderRadius:8, padding:'6px 12px',
    fontSize:12, fontWeight:600,
  },
  budgetCancel: { fontSize:14, color:'var(--ink3)', padding:4 },
};

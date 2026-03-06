'use client';
import { useState, useEffect } from 'react';

const GOAL = 180;
const TAG_C = { study:'#2A7A50', Wasting:'#D13A3A', prayer:'#2B5BB8', food:'#C05D1A', sleep:'#6B3FC0', other:'#9CA3AF' };
const TAG_BG= { study:'#EAF4EE', Wasting:'#FDEAEA', prayer:'#EAF0FC', food:'#FDF0E6', sleep:'#F0EBFC', other:'#F0EDE8' };
const BLOCKS = [
  { label: 'B1', from: 13*60+5,  to: 16*60 },
  { label: 'B2', from: 17*60,    to: 18*60+20 },
  { label: 'B3', from: 22*60+30, to: 25*60 },
];

function todayStr() { const n=new Date(); return new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function offsetDate(s,d){ const x=new Date(s+'T12:00:00Z'); x.setUTCDate(x.getUTCDate()+d); return x.toISOString().slice(0,10); }
function fmtDur(m){ if(!m)return'0m'; const h=Math.floor(m/60),mm=m%60; if(!h)return`${mm}m`; if(!mm)return`${h}h`; return`${h}h ${mm}m`; }
function dayNarrow(s){ return new Date(s+'T12:00:00Z').toLocaleDateString([],{weekday:'narrow'}); }
function dateLong(s){ return new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); }
function weekRange(){ const t=new Date(todayStr()+'T12:00:00Z'),d=t.getUTCDay(),m=new Date(t); m.setUTCDate(t.getUTCDate()-((d+6)%7)); const e=new Date(m); e.setUTCDate(m.getUTCDate()+6); return{from:m.toISOString().slice(0,10),to:e.toISOString().slice(0,10)}; }

export default function WeeklyView() {
  const [week, setWeek]       = useState([]);
  const [streak, setStreak]   = useState(null);
  const [selected, setSelected] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const tz = -new Date().getTimezoneOffset();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { from, to } = weekRange();
    const stats_from = offsetDate(todayStr(), -13);
    try {
      const [eRes, sRes, stRes] = await Promise.all([
        fetch(`/api/entries?from=${from}&to=${to}&tz=${tz}`),
        fetch(`/api/streak?tz=${tz}`),
        fetch(`/api/stats?from=${stats_from}&to=${todayStr()}&tz=${tz}`),
      ]);
      const entries = await eRes.json();
      const streakD = await sRes.json();
      const statsD  = await stRes.json();
      setStreak(streakD);
      setWeek(buildWeek(from, to, Array.isArray(entries) ? entries : [], tz));
    } catch { } finally { setLoading(false); }
  }

  if (loading) return <div style={s.loading}>Loading week…</div>;

  const sel   = week.find(d => d.date === selected);
  const today = todayStr();

  // 7-day study total
  const weekStudy = week.reduce((a, d) => a + (d.tags.study || 0), 0);
  const goalDays  = week.filter(d => (d.tags.study || 0) >= GOAL).length;

  return (
    <div style={s.wrap}>

      {/* ── stat cards — 2×2 grid like reference ── */}
      <div style={s.grid2x2}>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: 'var(--orange)' }}>{streak?.streak ?? 0}</div>
          <div style={s.statLbl}>Day streak</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{streak?.longest_streak ?? 0}</div>
          <div style={s.statLbl}>Best streak</div>
        </div>
        <div style={{ ...s.statCard, gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...s.statNum, fontSize: 28 }}>{fmtDur(weekStudy)}</div>
            <div style={s.statLbl}>This week</div>
          </div>
          <div style={s.goalDots}>
            {week.map(d => (
              <div key={d.date} style={{
                ...s.goalDot,
                background: (d.tags.study||0) >= GOAL ? 'var(--study-c)' : (d.tags.study||0) > 0 ? 'var(--orange)' : 'var(--ink4)',
              }} title={d.date} />
            ))}
          </div>
          <div>
            <div style={{ ...s.statNum, fontSize: 28, color: 'var(--study-c)' }}>{goalDays}/7</div>
            <div style={s.statLbl}>Goal days</div>
          </div>
        </div>
      </div>

      {/* ── 7-day bars ── */}
      <div style={s.barsCard}>
        <div style={s.barsTitle}>Study hours — week</div>
        <div style={s.bars}>
          {week.map(day => {
            const m   = day.tags.study || 0;
            const pct = Math.min(100, Math.round((m / GOAL) * 100));
            const isSel = day.date === selected;
            const isT   = day.date === today;
            return (
              <div key={day.date} style={s.barCol} onClick={() => setSelected(day.date)}>
                <div style={s.barTrack}>
                  <div style={{
                    ...s.barFill,
                    height: `${Math.max(pct, pct > 0 ? 3 : 0)}%`,
                    background: pct >= 100 ? 'var(--study-c)' : 'var(--orange)',
                    opacity: isSel ? 1 : 0.45,
                  }} />
                </div>
                <div style={s.barMeta}>
                  <span style={{
                    ...s.barDay,
                    color: isSel ? 'var(--orange)' : isT ? 'var(--ink)' : 'var(--ink3)',
                    fontWeight: isT ? 700 : 400,
                  }}>{dayNarrow(day.date)}</span>
                  {isSel && <div style={s.barSelDot} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── day detail ── */}
      {sel && (
        <div style={s.detail}>
          <div style={s.detailHead}>
            <div>
              <div style={s.detailDate}>{sel.date === today ? 'Today' : dateLong(sel.date)}</div>
              <div style={s.detailStudy}>{fmtDur(sel.tags.study || 0)} studied</div>
            </div>
            <div style={s.detailPct}>
              {Math.min(100, Math.round(((sel.tags.study||0)/GOAL)*100))}%
            </div>
          </div>

          {/* progress */}
          <div style={s.progTrack}>
            <div style={{
              ...s.progFill,
              width: `${Math.min(100, Math.round(((sel.tags.study||0)/GOAL)*100))}%`,
              background: (sel.tags.study||0) >= GOAL ? 'var(--study-c)' : 'var(--orange)',
            }} />
          </div>

          {/* tag breakdown */}
          {Object.keys(sel.tags).length > 0 ? (
            <div style={s.tagList}>
              {Object.entries(sel.tags).sort((a,b)=>b[1]-a[1]).map(([tag, min]) => {
                const max = Math.max(...Object.values(sel.tags));
                return (
                  <div key={tag} style={s.tagRow}>
                    <span style={{ ...s.tagDot, background: TAG_C[tag]||'#9CA3AF' }} />
                    <span style={s.tagName}>{tag}</span>
                    <div style={s.tagBarWrap}>
                      <div style={{ ...s.tagBar, width: `${(min/max)*100}%`, background: TAG_BG[tag]||'#eee', borderLeft: `3px solid ${TAG_C[tag]||'#9CA3AF'}` }} />
                    </div>
                    <span style={s.tagMin}>{fmtDur(min)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--ink3)', padding: '8px 0' }}>Nothing logged</div>
          )}

          {/* study blocks */}
          <div style={s.blockRow}>
            {BLOCKS.map(b => {
              const covered = (sel.studyEntries||[]).reduce((acc, e) => {
                const sm = localMin(e.started_at, tz);
                const em = sm + e.duration_minutes;
                return acc + Math.max(0, Math.min(em, b.to) - Math.max(sm, b.from));
              }, 0) >= 20;
              return (
                <div key={b.label} style={{
                  ...s.block,
                  background: covered ? 'var(--study-bg)' : 'var(--surface2)',
                  color: covered ? 'var(--study-c)' : 'var(--ink3)',
                  border: `1px solid ${covered ? 'rgba(42,122,80,0.25)' : 'var(--ink4)'}`,
                }}>
                  {covered ? '✓ ' : ''}{b.label}
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
  while (cur <= end) { days.push(cur.toISOString().slice(0,10)); cur.setUTCDate(cur.getUTCDate()+1); }
  const byDate = {}, studyByDate = {};
  entries.forEach(e => {
    const d = new Date(new Date(e.started_at).getTime()+tz*60000).toISOString().slice(0,10);
    if (!byDate[d]) byDate[d] = {};
    byDate[d][e.tag] = (byDate[d][e.tag]||0) + e.duration_minutes;
    if (e.tag === 'study') { if (!studyByDate[d]) studyByDate[d]=[]; studyByDate[d].push(e); }
  });
  return days.map(date => ({ date, tags: byDate[date]||{}, studyEntries: studyByDate[date]||[] }));
}

const s = {
  wrap: { display:'flex', flexDirection:'column', gap:12 },
  loading: { textAlign:'center', color:'var(--ink3)', fontSize:13, padding:'32px 0' },

  grid2x2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  statCard: {
    background:'var(--surface)', borderRadius:'var(--r)',
    padding:'16px 18px', boxShadow:'var(--sh)',
    display:'flex', flexDirection:'column', gap:6,
  },
  statNum: {
    fontSize:32, fontWeight:800, color:'var(--ink)',
    fontFamily:"'DM Mono',monospace", letterSpacing:'-0.03em', lineHeight:1,
  },
  statLbl: { fontSize:11, color:'var(--ink3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' },
  goalDots: { display:'flex', gap:5, flexDirection:'column', flexWrap:'wrap', maxHeight:28 },
  goalDot: { width:8, height:8, borderRadius:'50%' },

  barsCard: {
    background:'var(--surface)', borderRadius:'var(--r)',
    padding:'18px 18px 14px', boxShadow:'var(--sh)',
  },
  barsTitle: { fontSize:13, fontWeight:600, color:'var(--ink2)', marginBottom:14 },
  bars: { display:'flex', gap:8, alignItems:'flex-end', height:90 },
  barCol: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', cursor:'pointer' },
  barTrack: { flex:1, width:'100%', background:'var(--surface2)', borderRadius:6, overflow:'hidden', display:'flex', alignItems:'flex-end' },
  barFill: { width:'100%', borderRadius:6, transition:'height 0.5s ease, opacity 0.2s' },
  barMeta: { display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  barDay: { fontSize:10, transition:'color 0.15s' },
  barSelDot: { width:4, height:4, borderRadius:'50%', background:'var(--orange)' },

  detail: {
    background:'var(--surface)', borderRadius:'var(--r)',
    padding:18, boxShadow:'var(--sh)',
    display:'flex', flexDirection:'column', gap:14,
  },
  detailHead: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  detailDate: { fontSize:18, fontWeight:800, color:'var(--ink)', letterSpacing:'-0.02em' },
  detailStudy: { fontSize:13, color:'var(--ink3)', marginTop:3 },
  detailPct: {
    fontSize:28, fontWeight:800, color:'var(--ink)',
    fontFamily:"'DM Mono',monospace", letterSpacing:'-0.03em',
  },
  progTrack: { height:5, background:'var(--bg2)', borderRadius:'var(--r-pill)', overflow:'hidden' },
  progFill: { height:'100%', borderRadius:'var(--r-pill)', transition:'width 0.5s ease' },

  tagList: { display:'flex', flexDirection:'column', gap:9 },
  tagRow: { display:'flex', alignItems:'center', gap:10 },
  tagDot: { width:8, height:8, borderRadius:'50%', flexShrink:0 },
  tagName: { fontSize:12, color:'var(--ink2)', fontWeight:500, minWidth:56 },
  tagBarWrap: { flex:1, height:10, borderRadius:4, overflow:'hidden', background:'var(--surface2)' },
  tagBar: { height:'100%', borderRadius:4, transition:'width 0.4s ease' },
  tagMin: { fontSize:11, color:'var(--ink3)', minWidth:32, textAlign:'right', fontFamily:"'DM Mono',monospace" },

  blockRow: { display:'flex', gap:8 },
  block: {
    flex:1, textAlign:'center',
    padding:'8px 0', borderRadius:'var(--r-sm)',
    fontSize:12, fontWeight:700,
    letterSpacing:'0.02em',
  },
};

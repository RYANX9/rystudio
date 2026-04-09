'use client';
import { useState, useEffect, useRef } from 'react';

// ── Categories ───────────────────────────────────────────────────────────────
// IDs match existing DB tag values so Flutter app data stays intact
const BUILTIN = [
  { id: 'study',   label: 'Study',   ltr: 'S', color: '#9080F0', fg: '#0d0d0d' },
  { id: 'prayer',  label: 'Prayer',  ltr: 'P', color: '#4DBDAB', fg: '#0d0d0d' },
  { id: 'Wasting', label: 'Wasting', ltr: '!', color: '#D05848', fg: '#f5f5f0' },
  { id: 'sleep',   label: 'Sleep',   ltr: 'Z', color: '#BDB39E', fg: '#0d0d0d' },
  { id: 'food',    label: 'Food',    ltr: 'F', color: '#EDD03A', fg: '#0d0d0d' },
  { id: 'other',   label: 'Other',   ltr: '·', color: '#C0BAB2', fg: '#0d0d0d' },
];

const XCOLORS = [
  { color: '#E88B50', fg: '#0d0d0d' },
  { color: '#64C8E0', fg: '#0d0d0d' },
  { color: '#A8D860', fg: '#0d0d0d' },
  { color: '#D888CC', fg: '#0d0d0d' },
];

// ── Utilities ────────────────────────────────────────────────────────────────
function todayStr() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getTz() {
  return typeof window !== 'undefined' ? -new Date().getTimezoneOffset() : 0;
}

function mfmt(mins, mode = 'display') {
  if (!mins) return mode === 'display' ? { n: '0', u: 'm' } : '0m';
  const h = Math.floor(mins / 60), r = mins % 60;
  if (mode === 'display') {
    if (h === 0) return { n: String(mins), u: 'm' };
    if (r === 0) return { n: String(h), u: 'h' };
    return { n: String(h), u: `h ${r}m` };
  }
  if (h === 0) return `${mins}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function fmtDate(str) {
  const today = todayStr();
  if (str === today) return 'Today';
  const yest = new Date(today + 'T12:00:00Z');
  yest.setUTCDate(yest.getUTCDate() - 1);
  if (str === yest.toISOString().slice(0, 10)) return 'Yesterday';
  return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
}

function loadCustoms() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('chronicle_customs') || '[]'); }
  catch { return []; }
}
function saveCustoms(v) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chronicle_customs', JSON.stringify(v));
}

// ── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
  html,body{background:#ECEAE4;overscroll-behavior:none;}
  input,textarea,button{font-family:'Barlow',sans-serif;outline:none;border:none;}
  ::-webkit-scrollbar{display:none;}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}

  @keyframes slideR{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes slideU{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes popIn{from{transform:scale(.15);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sg{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}

  .sr{animation:slideR .36s cubic-bezier(.4,0,.2,1) both}
  .su{animation:slideU .32s cubic-bezier(.4,0,.2,1) both}
  .pi{animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both}
  .fu{animation:fadeUp .35s ease both}
  .c0{animation:sg .28s ease .00s both}.c1{animation:sg .28s ease .05s both}
  .c2{animation:sg .28s ease .10s both}.c3{animation:sg .28s ease .15s both}
  .c4{animation:sg .28s ease .20s both}.c5{animation:sg .28s ease .25s both}
  .c6{animation:sg .28s ease .30s both}.c7{animation:sg .28s ease .35s both}

  .tap{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;
       transition:transform .12s,opacity .12s;}
  .tap:active{transform:scale(.975);opacity:.88;}
  .pill{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;
        transition:transform .1s,opacity .1s;}
  .pill:active{transform:scale(.96);opacity:.82;}
`;

// ── Shared components ────────────────────────────────────────────────────────
const BackBtn = ({ onClick, dark }) => (
  <button className="tap" onClick={onClick} style={{
    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
    background: dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)',
    color: dark ? '#f5f5f0' : '#555',
    fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>↙</button>
);

const Dots = ({ color = '#0d0d0d' }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: color, opacity: .4 }} />
    ))}
  </div>
);

// ── Home Screen ──────────────────────────────────────────────────────────────
function Home({ allCats, bycat, goals, nav }) {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const totalToday = Object.values(bycat).reduce((a, b) => a + b, 0);
  const { n, u } = mfmt(totalToday);
  const getGoal = id => goals.find(g => g.tag === id);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#ECEAE4' }}>
      {/* Header */}
      <div className="fu" style={{ padding: '52px 24px 18px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: 6 }}>
          {date}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.05, color: '#0d0d0d' }}>
            Today's<br />Log
          </div>
          {totalToday > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>total</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0d0d0d', lineHeight: 1 }}>
                {n}<span style={{ fontSize: 14, fontWeight: 600, opacity: .5 }}>{u}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category cards */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {allCats.map((cat, i) => {
          const mins = bycat[cat.id] || 0;
          const goal = getGoal(cat.id);
          const pct = goal ? Math.min(mins / goal.daily_minutes, 1) : null;
          const { n, u } = mfmt(mins);
          const isDark = cat.fg === '#0d0d0d';

          return (
            <div
              key={cat.id}
              className={`tap c${Math.min(i, 7)}`}
              onClick={() => nav('cat', cat.id)}
              style={{
                background: cat.color, marginBottom: 2,
                padding: '18px 22px 20px', minHeight: 118,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Decorative circle */}
              <div style={{
                position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)',
                width: 160, height: 160, borderRadius: '50%', pointerEvents: 'none',
                background: `rgba(${isDark ? '0,0,0' : '255,255,255'},.07)`,
              }} />

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', fontSize: 14, fontWeight: 900, color: cat.fg,
                    background: `rgba(${isDark ? '0,0,0' : '255,255,255'},.18)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{cat.ltr}</div>
                  {goal && (
                    <div style={{
                      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      color: cat.fg, opacity: .85,
                      background: `rgba(${isDark ? '0,0,0' : '255,255,255'},.14)`,
                    }}>
                      {Math.round((pct || 0) * 100)}% of {mfmt(goal.daily_minutes, 'short')}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 22, color: cat.fg, opacity: .45 }}>↗</div>
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: cat.fg, lineHeight: 1.1 }}>{cat.label}</div>
                  {!goal && mins === 0 && (
                    <div style={{ fontSize: 11, color: cat.fg, opacity: .35, marginTop: 3 }}>nothing logged</div>
                  )}
                  {goal && mins === 0 && (
                    <div style={{ fontSize: 11, color: cat.fg, opacity: .45, marginTop: 3 }}>goal: {mfmt(goal.daily_minutes, 'short')}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                  <div style={{ fontSize: 68, fontWeight: 900, color: cat.fg, opacity: mins ? 1 : .18, lineHeight: .9 }}>{n}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: cat.fg, opacity: mins ? .55 : .18, paddingBottom: 8 }}>{u}</div>
                </div>
              </div>

              {/* Goal progress bar */}
              {goal && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `rgba(${isDark ? '0,0,0' : '255,255,255'},.15)` }}>
                  <div style={{
                    height: '100%', width: `${(pct || 0) * 100}%`,
                    background: `rgba(${isDark ? '0,0,0' : '255,255,255'},.4)`,
                    transition: 'width .6s ease',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom action bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 20px 38px',
        background: 'linear-gradient(to top, #ECEAE4 55%, transparent)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <button className="pill" onClick={() => nav('log')} style={{
          flex: 1, height: 58, borderRadius: 100,
          background: '#0d0d0d', color: '#ECEAE4', fontSize: 16, fontWeight: 900, letterSpacing: '.04em',
        }}>+ Log Time</button>
        <button className="pill" onClick={() => nav('goals')} title="Goals" style={{
          width: 58, height: 58, borderRadius: '50%',
          background: '#0d0d0d', color: '#ECEAE4', fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>◎</button>
        <button className="pill" onClick={() => nav('thoughts')} title="Thoughts" style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'rgba(0,0,0,.1)', color: '#0d0d0d', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✦</button>
        <button className="pill" onClick={() => nav('history')} title="History" style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'rgba(0,0,0,.1)', color: '#0d0d0d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Dots /></button>
        <button className="pill" onClick={() => nav('setup')} title="Setup" style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'rgba(0,0,0,.1)', color: '#0d0d0d', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>⊕</button>
      </div>
    </div>
  );
}

// ── Category Detail ──────────────────────────────────────────────────────────
function CatDetail({ cat, bycat, goals, back, nav, entries }) {
  const mins = bycat[cat.id] || 0;
  const goal = goals.find(g => g.tag === cat.id);
  const pct = goal ? Math.min(mins / goal.daily_minutes, 1) : 0;
  const { n, u } = mfmt(mins);
  const isDark = cat.fg === '#0d0d0d';
  const alpha = isDark ? '0,0,0' : '255,255,255';
  const R = 108, CIRC = 2 * Math.PI * R;

  const recent = entries
    .filter(e => e.tag === cat.id)
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    .slice(0, 4);

  return (
    <div className="sr" style={{ position: 'absolute', inset: 0, background: cat.color, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 22px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: cat.fg, lineHeight: 1.05 }}>{cat.label}</div>
            <div style={{ fontSize: 13, color: cat.fg, opacity: .45, marginTop: 5 }}>
              {goal ? `Goal: ${mfmt(goal.daily_minutes, 'short')} / day` : 'No goal set'}
            </div>
          </div>
          <BackBtn onClick={back} dark={!isDark} />
        </div>
      </div>

      {/* Ring */}
      <div className="pi" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {goal ? (
          <svg width={268} height={268} overflow="visible">
            <circle cx={134} cy={134} r={R} fill="none"
              stroke={`rgba(${alpha},.15)`} strokeWidth={26} />
            <circle cx={134} cy={134} r={R} fill="none"
              stroke={`rgba(${alpha},.55)`} strokeWidth={26} strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)}
              transform="rotate(-90 134 134)"
              style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)' }}
            />
            {pct > 0.05 && (
              <circle cx={134} cy={134} r={R} fill="none"
                stroke={`rgba(${alpha},.22)`} strokeWidth={10} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct) + 14}
                transform="rotate(-90 134 134)"
                style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1) .1s' }}
              />
            )}
          </svg>
        ) : (
          <div style={{
            width: 230, height: 230, borderRadius: '50%',
            background: `rgba(${alpha},.16)`,
            boxShadow: `inset 0 0 0 18px rgba(${alpha},.08)`,
          }} />
        )}

        {/* Center readout */}
        <div className="fu" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: 72, fontWeight: 900, lineHeight: .9, color: cat.fg, opacity: mins ? 1 : .25 }}>{n}</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: cat.fg, opacity: mins ? .5 : .25, paddingBottom: 8 }}>{u}</span>
          </div>
          {goal && (
            <div style={{ fontSize: 12, color: cat.fg, opacity: .45, marginTop: 6 }}>
              of {mfmt(goal.daily_minutes, 'short')}
            </div>
          )}
        </div>
      </div>

      {/* Recent entries */}
      {recent.length > 0 && (
        <div style={{ padding: '0 22px 16px', flexShrink: 0 }}>
          {recent.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderTop: `1px solid rgba(${alpha},.1)`,
              opacity: 1 - i * 0.18,
            }}>
              <div style={{ fontSize: 13, color: cat.fg, opacity: .5, maxWidth: '60%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {e.activity || '—'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: cat.fg, opacity: .65 }}>
                {mfmt(e.duration_minutes, 'short')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0 20px 40px', flexShrink: 0 }}>
        <button className="pill" onClick={() => nav('log')} style={{
          width: '100%', height: 58, borderRadius: 100,
          background: `rgba(${alpha},.22)`,
          color: cat.fg, fontSize: 17, fontWeight: 900,
        }}>+ Log Time</button>
      </div>
    </div>
  );
}

// ── Log Entry ────────────────────────────────────────────────────────────────
function LogEntry({ allCats, back, onSave, defaultCat }) {
  const [lcat, setLcat] = useState(defaultCat || allCats[0]?.id || 'study');
  const [lh, setLh] = useState('');
  const [lm, setLm] = useState('');
  const [lnote, setLnote] = useState('');
  const [saving, setSaving] = useState(false);

  const sel = allCats.find(c => c.id === lcat) || allCats[0];
  const mins = (parseInt(lh || 0) * 60) + parseInt(lm || 0);

  async function save() {
    if (!mins || saving) return;
    setSaving(true);
    await onSave({ tag: lcat, duration_minutes: mins, activity: lnote.trim() || sel?.label || lcat });
    setSaving(false);
    back();
  }

  return (
    <div className="su" style={{ position: 'absolute', inset: 0, background: '#111', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 22px 28px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>New Entry</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#f5f5f0' }}>Log Time</div>
        </div>
        <button className="tap" onClick={back} style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#222', color: '#666', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
        {/* Category */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allCats.map(c => (
              <button key={c.id} className="pill" onClick={() => setLcat(c.id)} style={{
                padding: '10px 18px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                background: lcat === c.id ? c.color : '#1e1e1e',
                color: lcat === c.id ? c.fg : '#555',
                border: lcat === c.id ? 'none' : '1px solid #2a2a2a',
                transition: 'all .15s ease',
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Duration</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['h', lh, setLh, 23, 'Hours'], ['m', lm, setLm, 59, 'Minutes']].map(([, val, set, max, label]) => (
              <div key={label} style={{ flex: 1 }}>
                <input
                  type="number" min={0} max={max} value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%', height: 68, borderRadius: 16,
                    background: '#1a1a1a', color: '#f5f5f0',
                    fontSize: 38, fontWeight: 900, textAlign: 'center',
                    border: '1.5px solid #2a2a2a',
                  }}
                />
                <div style={{ textAlign: 'center', color: '#444', fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
          {mins > 0 && (
            <div style={{ marginTop: 10, textAlign: 'center', fontSize: 13, color: '#555', fontWeight: 600 }}>
              = {mfmt(mins, 'short')}
            </div>
          )}
        </div>

        {/* Note */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Note (optional)</div>
          <textarea
            value={lnote} onChange={e => setLnote(e.target.value)}
            placeholder="What were you doing?"
            rows={3}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14,
              background: '#1a1a1a', color: '#f5f5f0', fontSize: 15,
              border: '1.5px solid #2a2a2a', resize: 'none', lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* Save */}
      <div style={{ padding: '12px 22px 44px', flexShrink: 0 }}>
        <button className="pill" onClick={save} disabled={!mins || saving} style={{
          width: '100%', height: 62, borderRadius: 100,
          background: mins ? sel?.color || '#f5f5f0' : '#222',
          color: mins ? sel?.fg || '#0d0d0d' : '#444',
          fontSize: 18, fontWeight: 900, transition: 'background .2s, color .2s',
        }}>{saving ? 'Saving…' : 'Save Entry'}</button>
      </div>
    </div>
  );
}

// ── Goals Screen ─────────────────────────────────────────────────────────────
function GoalsScreen({ goals, bycat, getCat, back, onSaveGoal, onDeleteGoal, allCats }) {
  const [addOpen, setAddOpen] = useState(false);
  const [gcat, setGcat] = useState(allCats[0]?.id || 'study');
  const [gh, setGh] = useState('');
  const [gm, setGm] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveGoal() {
    const mins = (parseInt(gh || 0) * 60) + parseInt(gm || 0);
    if (!mins || saving) return;
    setSaving(true);
    await onSaveGoal(gcat, mins);
    setSaving(false);
    setGh(''); setGm(''); setAddOpen(false);
  }

  const selCat = allCats.find(c => c.id === gcat);

  return (
    <div className="sr" style={{ position: 'absolute', inset: 0, background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 22px 20px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Targets</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#f5f5f0' }}>Goals</div>
        </div>
        <BackBtn onClick={back} dark />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 110px' }}>
        {goals.length === 0 && !addOpen && (
          <div style={{ textAlign: 'center', color: '#444', fontSize: 15, fontWeight: 600, padding: '60px 0' }}>No goals set yet</div>
        )}

        {goals.map((g, i) => {
          const cat = getCat(g.tag);
          const done = bycat[g.tag] || 0;
          const pct = Math.min(done / g.daily_minutes, 1);
          const R = 88, CIRC = 2 * Math.PI * R;
          const isDark = cat.fg === '#0d0d0d';
          const alpha = isDark ? '0,0,0' : '255,255,255';

          return (
            <div key={g.tag} className={`c${Math.min(i, 7)}`} style={{
              background: cat.color, borderRadius: 4, marginBottom: 2,
              padding: '22px 22px 18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: cat.fg }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: cat.fg, opacity: .45, marginTop: 2 }}>Goal: {mfmt(g.daily_minutes, 'short')} / day</div>
                </div>
                <button className="tap" onClick={() => onDeleteGoal(g.tag)} style={{ fontSize: 20, color: cat.fg, opacity: .3, background: 'none' }}>×</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <svg width={180} height={180} style={{ flexShrink: 0 }}>
                  <circle cx={90} cy={90} r={R} fill="none" stroke={`rgba(${alpha},.15)`} strokeWidth={22} />
                  <circle cx={90} cy={90} r={R} fill="none"
                    stroke={`rgba(${alpha},.5)`} strokeWidth={22} strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)}
                    transform="rotate(-90 90 90)"
                    style={{ transition: 'stroke-dashoffset .8s ease' }}
                  />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, color: cat.fg, opacity: done ? 1 : .25 }}>
                    {mfmt(done, 'display').n}
                    <span style={{ fontSize: 16, opacity: .5 }}>{mfmt(done, 'display').u}</span>
                  </div>
                  <div style={{ fontSize: 13, color: cat.fg, opacity: .45, marginTop: 4 }}>{Math.round(pct * 100)}% done</div>
                  <div style={{ marginTop: 10, height: 4, background: `rgba(${alpha},.15)`, borderRadius: 100 }}>
                    <div style={{
                      height: '100%', width: `${pct * 100}%`,
                      background: `rgba(${alpha},.45)`, borderRadius: 100, transition: 'width .6s ease',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {addOpen && (
          <div className="su" style={{ background: '#1a1a1a', borderRadius: 4, padding: '22px', marginBottom: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f5f5f0', marginBottom: 16 }}>New Goal</div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {allCats.map(c => (
                <button key={c.id} className="pill" onClick={() => setGcat(c.id)} style={{
                  padding: '8px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                  background: gcat === c.id ? c.color : '#222',
                  color: gcat === c.id ? c.fg : '#555',
                  border: gcat === c.id ? 'none' : '1px solid #2a2a2a',
                }}>{c.label}</button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>Daily Target</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[['Hours', gh, setGh, 23, 'h'], ['Minutes', gm, setGm, 59, 'm']].map(([label, val, set, max, unit]) => (
                <div key={unit} style={{ flex: 1 }}>
                  <input type="number" min={0} max={max} value={val}
                    onChange={e => set(e.target.value)} placeholder="0"
                    style={{
                      width: '100%', height: 56, borderRadius: 12,
                      background: '#222', color: '#f5f5f0',
                      fontSize: 30, fontWeight: 900, textAlign: 'center', border: '1px solid #333',
                    }}
                  />
                  <div style={{ textAlign: 'center', color: '#444', fontSize: 11, marginTop: 5, fontWeight: 700 }}>{unit}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="pill" onClick={() => setAddOpen(false)} style={{ flex: 1, height: 48, borderRadius: 100, background: '#222', color: '#555', fontWeight: 700 }}>Cancel</button>
              <button className="pill" onClick={saveGoal} style={{
                flex: 2, height: 48, borderRadius: 100, fontWeight: 900, fontSize: 15,
                background: selCat?.color || '#f5f5f0',
                color: selCat?.fg || '#0d0d0d',
              }}>{saving ? '…' : 'Set Goal'}</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 40px', background: 'linear-gradient(to top, #0d0d0d 55%, transparent)' }}>
        <button className="pill" onClick={() => setAddOpen(true)} style={{
          width: '100%', height: 58, borderRadius: 100,
          background: '#f5f5f0', color: '#0d0d0d', fontSize: 16, fontWeight: 900,
        }}>+ New Goal</button>
      </div>
    </div>
  );
}

// ── History Screen ───────────────────────────────────────────────────────────
function HistoryScreen({ getCat, back }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tz = getTz();
    const today = todayStr();
    const from = new Date(today + 'T12:00:00Z');
    from.setUTCDate(from.getUTCDate() - 29);
    const fromStr = from.toISOString().slice(0, 10);

    fetch(`/api/entries?from=${fromStr}&to=${today}&tz=${tz}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEntries(d.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tz = getTz();
  const grouped = {};
  entries.forEach(e => {
    const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  return (
    <div className="sr" style={{ position: 'absolute', inset: 0, background: '#ECEAE4', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 22px 20px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>All Entries</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#0d0d0d' }}>History</div>
        </div>
        <BackBtn onClick={back} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {loading && <div style={{ textAlign: 'center', color: '#bbb', padding: '60px 0', fontSize: 15 }}>Loading…</div>}
        {!loading && Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', color: '#bbb', padding: '60px 0', fontSize: 15, fontWeight: 600 }}>Nothing logged yet</div>
        )}
        {Object.entries(grouped).map(([date, dayEntries]) => {
          const total = dayEntries.reduce((s, e) => s + e.duration_minutes, 0);
          return (
            <div key={date}>
              <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: date === todayStr() ? '#0d0d0d' : '#999', letterSpacing: '.05em' }}>
                  {fmtDate(date)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa' }}>{mfmt(total, 'short')}</div>
              </div>
              {dayEntries.map(e => {
                const cat = getCat(e.tag);
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 22px', marginBottom: 1,
                    borderBottom: '1px solid rgba(0,0,0,.06)', background: '#fff',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: cat.color, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 900, color: cat.fg,
                    }}>{cat.ltr}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0d0d0d' }}>{cat.label}</div>
                      {e.activity && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.activity}</div>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0d0d0d', flexShrink: 0 }}>{mfmt(e.duration_minutes, 'short')}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ customs, back, onAddCustom, onDeleteCustom }) {
  const [addOpen, setAddOpen] = useState(false);
  const [newCat, setNewCat] = useState('');

  function saveCat() {
    if (!newCat.trim() || customs.length >= 4) return;
    onAddCustom(newCat.trim());
    setNewCat(''); setAddOpen(false);
  }

  return (
    <div className="sr" style={{ position: 'absolute', inset: 0, background: '#ECEAE4', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 22px 20px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Configure</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#0d0d0d' }}>Setup</div>
        </div>
        <BackBtn onClick={back} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 110px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Built-in</div>
        {BUILTIN.map((c, i) => (
          <div key={c.id} className={`c${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#fff', borderRadius: 4, marginBottom: 2, padding: '14px 16px',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 900, color: c.fg,
            }}>{c.ltr}</div>
            <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: '#0d0d0d' }}>{c.label}</div>
            <div style={{ fontSize: 10, color: '#ccc', fontWeight: 700, letterSpacing: '.08em' }}>BUILT-IN</div>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginTop: 24, marginBottom: 12 }}>
          Custom ({customs.length}/4)
        </div>
        {customs.map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#fff', borderRadius: 4, marginBottom: 2, padding: '14px 16px',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: XCOLORS[i % 4].color }} />
            <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: '#0d0d0d' }}>{c.label}</div>
            <button className="tap" onClick={() => onDeleteCustom(c.id)} style={{ fontSize: 22, color: '#ccc', background: 'none', lineHeight: 1 }}>×</button>
          </div>
        ))}

        {addOpen && (
          <div className="su" style={{ background: '#fff', borderRadius: 4, padding: '18px', marginTop: 2 }}>
            <input
              value={newCat} onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveCat()}
              placeholder="Category name…"
              autoFocus
              style={{
                width: '100%', height: 52, borderRadius: 12,
                background: '#f5f5f0', color: '#0d0d0d',
                fontSize: 16, fontWeight: 700, padding: '0 16px',
                border: '1.5px solid #e8e5e0', marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="pill" onClick={() => setAddOpen(false)} style={{ flex: 1, height: 46, borderRadius: 100, background: '#eee', color: '#888', fontWeight: 700 }}>Cancel</button>
              <button className="pill" onClick={saveCat} style={{ flex: 2, height: 46, borderRadius: 100, background: '#0d0d0d', color: '#f5f5f0', fontWeight: 900, fontSize: 15 }}>Add Category</button>
            </div>
          </div>
        )}
      </div>

      {customs.length < 4 && !addOpen && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 40px', background: 'linear-gradient(to top, #ECEAE4 55%, transparent)' }}>
          <button className="pill" onClick={() => setAddOpen(true)} style={{
            width: '100%', height: 58, borderRadius: 100,
            background: '#0d0d0d', color: '#f5f5f0', fontSize: 16, fontWeight: 900,
          }}>+ Add Category</button>
        </div>
      )}
    </div>
  );
}

// ── Thoughts Screen (locked notes vault) ────────────────────────────────────
function ThoughtsScreen({ back }) {
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const taRef = useRef(null);
  const today = todayStr();

  useEffect(() => {
    fetch('/api/now-notes')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotes(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function lock() {
    const text = body.trim();
    if (!text || saving) return;
    setSaving(true);
    const n = new Date();
    const tz = getTz();
    const loc = new Date(n.getTime() + tz * 60000);
    try {
      const res = await fetch('/api/now-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: text,
          local_date: loc.toISOString().slice(0, 10),
          local_time: loc.toISOString().slice(11, 16),
        }),
      });
      const note = await res.json();
      setNotes(prev => [note, ...prev]);
      setBody('');
      taRef.current?.focus();
    } catch {}
    setSaving(false);
  }

  const grouped = {};
  notes.forEach(n => {
    if (!grouped[n.local_date]) grouped[n.local_date] = [];
    grouped[n.local_date].push(n);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="sr" style={{ position: 'absolute', inset: 0, background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '52px 22px 20px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Permanent Record</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#f5f5f0' }}>Thoughts</div>
        </div>
        <BackBtn onClick={back} dark />
      </div>

      {/* Compose area */}
      <div style={{ padding: '0 22px 18px', flexShrink: 0 }}>
        <textarea
          ref={taRef}
          value={body} onChange={e => setBody(e.target.value)}
          onKeyDown={e => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && lock()}
          placeholder="Capture a thought…"
          rows={3}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 14,
            background: '#1a1a1a', color: '#f5f5f0', fontSize: 15,
            border: '1.5px solid #2a2a2a', resize: 'none', lineHeight: 1.6, marginBottom: 10,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 11, color: '#333' }}>
            {body.trim().length > 0 ? `${body.trim().length} chars · Ctrl+Enter` : 'Write once, locked forever'}
          </div>
          <button className="pill" onClick={lock} disabled={!body.trim() || saving} style={{
            height: 46, padding: '0 22px', borderRadius: 100,
            background: body.trim() ? '#f5f5f0' : '#1e1e1e',
            color: body.trim() ? '#0d0d0d' : '#333',
            fontSize: 14, fontWeight: 900, transition: 'all .2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            {saving ? 'Locking…' : 'Lock it'}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 40px' }}>
        {loading && <div style={{ color: '#333', fontSize: 14, padding: '20px 0' }}>Loading…</div>}
        {!loading && dates.length === 0 && (
          <div style={{ color: '#2a2a2a', fontSize: 14, padding: '20px 0', fontWeight: 600 }}>No locked thoughts yet</div>
        )}
        {dates.map(date => (
          <div key={date} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>
              {date === today ? 'Today' : fmtDate(date)}
            </div>
            {grouped[date].map(note => (
              <div key={note.id} style={{
                background: '#1a1a1a', borderRadius: 12, padding: '14px 16px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#444', fontWeight: 700 }}>{note.local_time}</div>
                  <div style={{
                    fontSize: 9, color: '#2a2a2a', fontWeight: 900, letterSpacing: '.1em',
                    padding: '3px 8px', background: '#111', borderRadius: 100,
                  }}>LOCKED</div>
                </div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {note.body}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const [view, setView] = useState('home');
  const [catId, setCatId] = useState(null);
  const [stack, setStack] = useState([]);

  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [customs, setCustoms] = useState([]);

  useEffect(() => {
    setCustoms(loadCustoms());

    const tz = getTz();
    const date = todayStr();

    fetch(`/api/entries?date=${date}&tz=${tz}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEntries(d); })
      .catch(() => {});

    fetch('/api/budgets')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGoals(d.filter(g => g.daily_minutes > 0)); })
      .catch(() => {});
  }, []);

  const allCats = [
    ...BUILTIN,
    ...customs.map((c, i) => ({
      id: c.id, label: c.label,
      ltr: c.label[0].toUpperCase(),
      color: XCOLORS[i % 4].color,
      fg: XCOLORS[i % 4].fg,
    })),
  ];

  const getCat = id => allCats.find(c => c.id === id)
    || { id, label: id, ltr: '?', color: '#C0BAB2', fg: '#0d0d0d' };

  const bycat = {};
  entries.forEach(e => { bycat[e.tag] = (bycat[e.tag] || 0) + e.duration_minutes; });

  // Compute the end time of the most recently logged entry (for sequential logging)
  const lastEntryEnd = entries.length > 0
    ? new Date(Math.max(...entries.map(e =>
        new Date(e.started_at).getTime() + e.duration_minutes * 60000
      )))
    : null;

  const nav = (v, c = null) => {
    setStack(s => [...s, view]);
    if (c) setCatId(c);
    setView(v);
  };
  const back = () => {
    const s = [...stack];
    setView(s.pop() || 'home');
    setStack(s);
  };

  async function handleSave({ tag, duration_minutes, activity }) {
    const tz = getTz();
    const now = new Date();
    const started_at = lastEntryEnd
      ? lastEntryEnd.toISOString()
      : new Date(now.getTime() - duration_minutes * 60000).toISOString();

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, tag, started_at, duration_minutes, tz }),
      });
      const data = await res.json();
      const incoming = Array.isArray(data) ? data : [data];
      const today = todayStr();
      setEntries(prev => {
        const deduped = prev.filter(e => !incoming.find(n => n.id === e.id));
        const todayOnly = incoming.filter(e => {
          const d = new Date(new Date(e.started_at).getTime() + tz * 60000).toISOString().slice(0, 10);
          return d === today;
        });
        return [...deduped, ...todayOnly].sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
      });
    } catch {}
  }

  async function handleSaveGoal(tag, daily_minutes) {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, daily_minutes }),
      });
      const g = await res.json();
      setGoals(prev => [...prev.filter(x => x.tag !== tag), g].filter(x => x.daily_minutes > 0));
    } catch {}
  }

  // Soft-delete: set daily_minutes = 0 (no DELETE endpoint exists)
  async function handleDeleteGoal(tag) {
    setGoals(prev => prev.filter(g => g.tag !== tag));
    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, daily_minutes: 0 }),
      });
    } catch {}
  }

  function handleAddCustom(label) {
    const updated = [...customs, { id: 'x_' + Date.now(), label }];
    setCustoms(updated);
    saveCustoms(updated);
  }

  function handleDeleteCustom(id) {
    const updated = customs.filter(c => c.id !== id);
    setCustoms(updated);
    saveCustoms(updated);
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', height: '100dvh',
      overflow: 'hidden', position: 'relative',
      background: '#ECEAE4', fontFamily: "'Barlow', sans-serif",
    }}>
      <style>{CSS}</style>
      <div key={view} style={{ position: 'absolute', inset: 0 }}>
        {view === 'home' && (
          <Home allCats={allCats} bycat={bycat} goals={goals} nav={nav} />
        )}
        {view === 'cat' && catId && (
          <CatDetail cat={getCat(catId)} bycat={bycat} goals={goals} back={back} nav={nav} entries={entries} />
        )}
        {view === 'log' && (
          <LogEntry allCats={allCats} back={back} onSave={handleSave} defaultCat={catId} />
        )}
        {view === 'goals' && (
          <GoalsScreen
            goals={goals} bycat={bycat} getCat={getCat} back={back}
            onSaveGoal={handleSaveGoal} onDeleteGoal={handleDeleteGoal} allCats={allCats}
          />
        )}
        {view === 'history' && (
          <HistoryScreen getCat={getCat} back={back} />
        )}
        {view === 'setup' && (
          <SetupScreen customs={customs} back={back} onAddCustom={handleAddCustom} onDeleteCustom={handleDeleteCustom} />
        )}
        {view === 'thoughts' && (
          <ThoughtsScreen back={back} />
        )}
      </div>
    </div>
  );
}

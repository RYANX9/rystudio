'use client';
import { useState } from 'react';

const TAGS = [
  { key: 'study',   label: 'STUDY',   color: 'var(--study)', dim: 'var(--study-dim)' },
  { key: 'Wasting', label: 'WASTE',   color: 'var(--waste)', dim: 'var(--waste-dim)' },
  { key: 'prayer',  label: 'PRAYER',  color: 'var(--pray)',  dim: 'var(--pray-dim)'  },
  { key: 'food',    label: 'FOOD',    color: 'var(--food)',  dim: 'var(--food-dim)'  },
  { key: 'sleep',   label: 'SLEEP',   color: 'var(--sleep)', dim: 'var(--sleep-dim)' },
  { key: 'other',   label: 'OTHER',   color: 'var(--other)', dim: 'var(--other-dim)' },
];

const MODES = [
  { key: 'now',    label: 'From last → now' },
  { key: 'dur',    label: 'Set duration'    },
  { key: 'manual', label: 'Manual time'     },
];

const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity,  setActivity]  = useState('');
  const [tag,       setTag]       = useState('study');
  const [mode,      setMode]      = useState('now');
  const [duration,  setDuration]  = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState('');

  const tz    = -new Date().getTimezoneOffset();
  const base  = lastEntryEnd || new Date().toISOString();
  const aTag  = TAGS.find(t => t.key === tag) || TAGS[0];

  const resolvedStart = mode === 'manual' && startedAt
    ? new Date(startedAt).toISOString()
    : base;
  const resolvedDur = mode === 'now'
    ? Math.max(1, Math.round((Date.now() - new Date(base).getTime()) / 60000))
    : parseInt(duration) || 0;
  const endTime = resolvedDur
    ? new Date(new Date(resolvedStart).getTime() + resolvedDur * 60000)
    : null;

  async function submit(e) {
    e.preventDefault();
    if (!activity.trim() || (mode !== 'now' && !duration)) return;
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: activity.trim(), tag, started_at: resolvedStart, duration_minutes: resolvedDur, tz }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onEntryAdded(await res.json());
      setActivity(''); setDuration('');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.card}>

      {/* section header */}
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>LOG ENTRY</span>
        <div style={{ ...s.tagIndicator, background: aTag.dim, borderColor: aTag.color + '40' }}>
          <span style={{ ...s.tagDot, background: aTag.color }} />
          <span style={{ ...s.tagIndicatorTxt, color: aTag.color }}>{aTag.label}</span>
        </div>
      </div>

      {/* activity */}
      <input
        style={s.activityInput}
        placeholder="what did you do?"
        value={activity}
        onChange={e => setActivity(e.target.value)}
        required
      />

      {/* tag grid — 3×2 */}
      <div style={s.tagGrid}>
        {TAGS.map(t => {
          const active = tag === t.key;
          return (
            <button
              key={t.key} type="button"
              style={{
                ...s.tagBtn,
                background:   active ? t.dim           : 'transparent',
                borderColor:  active ? t.color + '50'  : 'var(--border-md)',
                color:        active ? t.color          : 'var(--ink3)',
                fontWeight:   active ? 700               : 400,
              }}
              onClick={() => setTag(t.key)}
            >
              <span style={{ ...s.tagBtnDot, background: active ? t.color : 'var(--ink4)' }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* divider */}
      <div style={s.divider} />

      {/* mode selector */}
      <div style={s.modeRow}>
        {MODES.map(m => (
          <button
            key={m.key} type="button"
            style={{
              ...s.modeBtn,
              background:  mode === m.key ? 'var(--s3)'       : 'transparent',
              color:        mode === m.key ? 'var(--ink)'      : 'var(--ink3)',
              borderColor:  mode === m.key ? 'var(--border-md)': 'transparent',
              fontWeight:   mode === m.key ? 600                : 400,
            }}
            onClick={() => setMode(m.key)}
          >
            {mode === m.key && <span style={s.modeActive} />}
            {m.label}
          </button>
        ))}
      </div>

      {/* extra inputs */}
      {mode !== 'now' && (
        <div style={s.extraRow}>
          <div style={s.extraField}>
            <div style={s.fieldLabel}>DURATION (MIN)</div>
            <input
              style={s.monoInput}
              type="number" placeholder="—"
              value={duration} onChange={e => setDuration(e.target.value)}
              min="1" required
            />
          </div>
          {mode === 'manual' && (
            <div style={{ ...s.extraField, flex: 2 }}>
              <div style={s.fieldLabel}>START TIME</div>
              <input
                style={s.monoInput}
                type="datetime-local"
                value={startedAt} onChange={e => setStartedAt(e.target.value)}
                required
              />
            </div>
          )}
        </div>
      )}

      {/* time preview */}
      {endTime && (
        <div style={{ ...s.preview, borderColor: aTag.color + '30' }}>
          <div style={s.previewTimes}>
            <span style={{ ...s.previewTime, color: aTag.color }}>
              {fmt(new Date(resolvedStart))}
            </span>
            <span style={s.previewSep}>→</span>
            <span style={{ ...s.previewTime, color: aTag.color }}>
              {fmt(endTime)}
            </span>
          </div>
          <span style={s.previewDur}>{resolvedDur}m</span>
        </div>
      )}

      {err && <div style={s.err}>{err}</div>}

      <button
        type="button"
        style={{
          ...s.cta,
          background: loading ? 'var(--s3)' : 'var(--or)',
          boxShadow: loading ? 'none' : '0 0 20px var(--or-glow)',
        }}
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'SAVING…' : 'LOG ENTRY'}
      </button>
    </div>
  );
}

const s = {
  card: {
    background: 'var(--s1)',
    borderRadius: 'var(--r)',
    padding: '18px 18px 16px',
    border: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
  },
  tagIndicator: {
    display: 'flex', alignItems: 'center', gap: 5,
    border: '1px solid',
    borderRadius: 'var(--r-pill)',
    padding: '4px 10px',
    transition: 'all 0.2s',
  },
  tagDot: { width: 5, height: 5, borderRadius: '50%', display: 'block', flexShrink: 0 },
  tagIndicatorTxt: { fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace" },

  activityInput: {
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink)',
    padding: '12px 14px',
    fontSize: 15,
    fontWeight: 500,
    width: '100%',
    letterSpacing: '-0.01em',
  },

  tagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 6,
  },
  tagBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 10px',
    border: '1px solid',
    borderRadius: 'var(--r-xs)',
    fontSize: 9,
    letterSpacing: '0.1em',
    fontFamily: "'DM Mono', monospace",
    transition: 'all 0.15s',
  },
  tagBtnDot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0, transition: 'background 0.15s' },

  divider: { height: 1, background: 'var(--border)' },

  modeRow: { display: 'flex', flexDirection: 'column', gap: 2 },
  modeBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px',
    border: '1px solid',
    borderRadius: 'var(--r-xs)',
    fontSize: 12,
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  modeActive: {
    width: 4, height: 4,
    borderRadius: '50%',
    background: 'var(--or)',
    flexShrink: 0,
    boxShadow: '0 0 4px var(--or)',
  },

  extraRow: { display: 'flex', gap: 10 },
  extraField: { flex: 1, display: 'flex', flexDirection: 'column', gap: 5 },
  fieldLabel: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace",
  },
  monoInput: {
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    borderRadius: 'var(--r-xs)',
    color: 'var(--ink)',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'DM Mono', monospace",
    width: '100%',
  },

  preview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: 'var(--s2)',
    borderRadius: 'var(--r-xs)',
    border: '1px solid',
  },
  previewTimes: { display: 'flex', alignItems: 'center', gap: 10 },
  previewTime: {
    fontSize: 14, fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.02em',
  },
  previewSep: { fontSize: 11, color: 'var(--ink3)' },
  previewDur: { fontSize: 11, color: 'var(--ink3)', fontFamily: "'DM Mono', monospace" },

  err: { fontSize: 11, color: 'var(--waste)', fontFamily: "'DM Mono', monospace" },

  cta: {
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    padding: '13px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    fontFamily: "'DM Mono', monospace",
    border: 'none',
    transition: 'all 0.2s',
  },
};

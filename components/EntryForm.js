'use client';
import { useState } from 'react';

const TAGS = ['study', 'Wasting', 'prayer', 'food', 'sleep', 'other'];

const TAG_STYLE = {
  study:   { bg: 'var(--accent2-bg)', color: 'var(--accent2)', dot: '#2D7A4F' },
  Wasting: { bg: '#FEF2F2',           color: '#DC2626',         dot: '#DC2626' },
  prayer:  { bg: '#EFF6FF',           color: '#2563EB',         dot: '#2563EB' },
  food:    { bg: '#FFF7ED',           color: '#C2410C',         dot: '#EA580C' },
  sleep:   { bg: '#F5F3FF',           color: '#7C3AED',         dot: '#7C3AED' },
  other:   { bg: 'var(--surface2)',   color: 'var(--ink2)',     dot: '#9CA3AF' },
};

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [mode, setMode] = useState('now');
  const [duration, setDuration] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tz = -new Date().getTimezoneOffset();
  const base = lastEntryEnd || new Date().toISOString();

  const resolvedStart = mode === 'manual'
    ? (startedAt ? new Date(startedAt).toISOString() : new Date().toISOString())
    : base;

  const resolvedDuration = mode === 'now'
    ? Math.max(1, Math.round((Date.now() - new Date(base).getTime()) / 60000))
    : parseInt(duration) || 0;

  const endTime = resolvedDuration
    ? new Date(new Date(resolvedStart).getTime() + resolvedDuration * 60000)
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activity.trim() || (mode !== 'now' && !duration)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.trim(), tag,
          started_at: resolvedStart,
          duration_minutes: resolvedDuration,
          tz,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const entry = await res.json();
      onEntryAdded(entry);
      setActivity(''); setDuration('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const ts = TAG_STYLE[tag];

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {/* Activity input */}
      <div style={s.inputRow}>
        <input
          style={s.input}
          placeholder="What did you do?"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          required
        />
      </div>

      {/* Tag chips */}
      <div style={s.tagRow}>
        {TAGS.map(t => {
          const ts2 = TAG_STYLE[t];
          const active = tag === t;
          return (
            <button
              key={t} type="button"
              style={{
                ...s.tagChip,
                background: active ? ts2.bg : 'var(--surface2)',
                color: active ? ts2.color : 'var(--ink3)',
                border: `1px solid ${active ? ts2.dot + '40' : 'var(--border)'}`,
                fontWeight: active ? 600 : 400,
              }}
              onClick={() => setTag(t)}
            >
              <span style={{ ...s.tagDot, background: active ? ts2.dot : 'var(--ink3)', opacity: active ? 1 : 0.4 }} />
              {t}
            </button>
          );
        })}
      </div>

      {/* Mode selector */}
      <div style={s.modeRow}>
        {[{ key: 'now', label: 'Log now' }, { key: 'auto', label: 'Set duration' }, { key: 'manual', label: 'Manual' }].map(m => (
          <button
            key={m.key} type="button"
            style={{ ...s.modeBtn, ...(mode === m.key ? s.modeBtnActive : {}) }}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={s.hint}>
        {mode === 'now' && `Duration from last entry until now`}
        {mode === 'auto' && 'Starts from last entry end — you set duration'}
        {mode === 'manual' && 'Set both start time and duration'}
      </div>

      {mode !== 'now' && (
        <div style={s.inputRow}>
          <input
            style={{ ...s.input, maxWidth: 130 }}
            type="number" placeholder="Duration (min)"
            value={duration} onChange={e => setDuration(e.target.value)}
            min="1" required
          />
          {mode === 'manual' && (
            <input
              style={s.input} type="datetime-local"
              value={startedAt} onChange={e => setStartedAt(e.target.value)} required
            />
          )}
        </div>
      )}

      {endTime && (
        <div style={{ ...s.preview, background: ts.bg, borderColor: ts.dot + '30' }}>
          <span style={{ color: ts.color, fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500 }}>
            {fmt(new Date(resolvedStart))} → {fmt(endTime)}
          </span>
          <span style={{ color: 'var(--ink3)', fontSize: 11 }}>{resolvedDuration} min</span>
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      <button type="submit" style={s.submit} disabled={loading}>
        {loading ? 'Saving...' : 'Log entry'}
      </button>
    </form>
  );
}

const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const s = {
  form: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: 'var(--shadow)',
  },
  inputRow: { display: 'flex', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink)',
    padding: '10px 13px',
    fontSize: 14,
    minWidth: 0,
    transition: 'border-color 0.15s',
  },
  tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tagChip: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px',
    borderRadius: 100,
    fontSize: 12,
    border: '1px solid',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  tagDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  modeRow: { display: 'flex', gap: 6 },
  modeBtn: {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--ink3)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 4px',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: 'var(--ink)',
    borderColor: 'var(--ink)',
    color: 'var(--surface)',
    fontWeight: 600,
  },
  hint: { fontSize: 11, color: 'var(--ink3)', lineHeight: 1.4 },
  preview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
  },
  error: { fontSize: 12, color: '#DC2626' },
  submit: {
    background: 'var(--ink)',
    color: 'var(--surface)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    fontSize: 14, fontWeight: 600,
    transition: 'opacity 0.15s',
  },
};

'use client';
import { useState } from 'react';

const TAGS = [
  { key: 'study',   label: 'Study',   c: 'var(--study-c)',  bg: 'var(--study-bg)',  dot: 'var(--study-dot)'  },
  { key: 'Wasting', label: 'Wasting', c: 'var(--waste-c)',  bg: 'var(--waste-bg)',  dot: 'var(--waste-dot)'  },
  { key: 'prayer',  label: 'Prayer',  c: 'var(--pray-c)',   bg: 'var(--pray-bg)',   dot: 'var(--pray-dot)'   },
  { key: 'food',    label: 'Food',    c: 'var(--food-c)',   bg: 'var(--food-bg)',   dot: 'var(--food-dot)'   },
  { key: 'sleep',   label: 'Sleep',   c: 'var(--sleep-c)',  bg: 'var(--sleep-bg)',  dot: 'var(--sleep-dot)'  },
  { key: 'other',   label: 'Other',   c: 'var(--other-c)',  bg: 'var(--other-bg)',  dot: 'var(--other-dot)'  },
];

const MODES = [
  { key: 'now',    label: 'From last entry → now' },
  { key: 'dur',    label: 'Set duration'          },
  { key: 'manual', label: 'Manual time'           },
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

  const tz   = -new Date().getTimezoneOffset();
  const base = lastEntryEnd || new Date().toISOString();

  const resolvedStart = mode === 'manual' && startedAt
    ? new Date(startedAt).toISOString()
    : base;

  const resolvedDur = mode === 'now'
    ? Math.max(1, Math.round((Date.now() - new Date(base).getTime()) / 60000))
    : parseInt(duration) || 0;

  const endTime = resolvedDur
    ? new Date(new Date(resolvedStart).getTime() + resolvedDur * 60000)
    : null;

  const activeTag = TAGS.find(t => t.key === tag) || TAGS[0];

  async function submit(e) {
    e.preventDefault();
    if (!activity.trim() || (mode !== 'now' && !duration)) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.trim(),
          tag,
          started_at: resolvedStart,
          duration_minutes: resolvedDur,
          tz,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onEntryAdded(await res.json());
      setActivity('');
      setDuration('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={s.card}>

      {/* section label — like "Air Conditioner" in reference */}
      <div style={s.sectionLabel}>Log entry</div>

      {/* activity input */}
      <input
        style={s.activityInput}
        placeholder="What did you do?"
        value={activity}
        onChange={e => setActivity(e.target.value)}
        required
      />

      {/* tag pills — like the Heat/Cold/Air/Humid mode buttons in reference */}
      <div style={s.tagSection}>
        <div style={s.tagSectionLabel}>Category</div>
        <div style={s.tagRow}>
          {TAGS.map(t => (
            <button
              key={t.key}
              type="button"
              style={{
                ...s.tagChip,
                background: tag === t.key ? t.bg    : 'var(--surface2)',
                color:      tag === t.key ? t.c     : 'var(--ink3)',
                border:     `1.5px solid ${tag === t.key ? t.c + '55' : 'var(--ink4)'}`,
                fontWeight: tag === t.key ? 600     : 400,
              }}
              onClick={() => setTag(t.key)}
            >
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: tag === t.key ? t.dot : 'var(--ink4)',
                display: 'inline-block',
                flexShrink: 0,
                transition: 'background 0.15s',
              }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* mode selection — dark pill for active, light for inactive */}
      <div style={s.modeSection}>
        <div style={s.tagSectionLabel}>Mode</div>
        <div style={s.modeRow}>
          {MODES.map(m => (
            <button
              key={m.key}
              type="button"
              style={{
                ...s.modeChip,
                background: mode === m.key ? 'var(--dark)' : 'var(--surface2)',
                color:      mode === m.key ? '#fff'        : 'var(--ink3)',
                border:     `1px solid ${mode === m.key ? 'var(--dark)' : 'var(--ink4)'}`,
                fontWeight: mode === m.key ? 600           : 400,
              }}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* extra inputs */}
      {mode !== 'now' && (
        <div style={s.extraRow}>
          <div style={s.extraField}>
            <div style={s.tagSectionLabel}>Duration</div>
            <input
              style={s.numInput}
              type="number"
              placeholder="min"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min="1"
              required
            />
          </div>
          {mode === 'manual' && (
            <div style={{ ...s.extraField, flex: 2 }}>
              <div style={s.tagSectionLabel}>Start time</div>
              <input
                style={s.dtInput}
                type="datetime-local"
                value={startedAt}
                onChange={e => setStartedAt(e.target.value)}
                required
              />
            </div>
          )}
        </div>
      )}

      {/* time preview — colored by active tag, like Schedule card in reference */}
      {endTime && (
        <div style={{ ...s.preview, background: activeTag.bg }}>
          <div style={s.previewLeft}>
            <span style={{ ...s.previewTime, color: activeTag.c }}>
              {fmt(new Date(resolvedStart))}
            </span>
            <span style={{ ...s.previewArrow, color: activeTag.c + '88' }}>→</span>
            <span style={{ ...s.previewTime, color: activeTag.c }}>
              {fmt(endTime)}
            </span>
          </div>
          <span style={s.previewDur}>{resolvedDur}m</span>
        </div>
      )}

      {err && <div style={s.err}>{err}</div>}

      <button type="submit" style={s.cta} disabled={loading}>
        {loading ? 'Saving…' : 'Log entry'}
      </button>
    </form>
  );
}

const s = {
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '20px 20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: 'var(--sh)',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--ink)',
    letterSpacing: '-0.02em',
  },
  activityInput: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--ink4)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink)',
    padding: '13px 16px',
    fontSize: 15,
    fontWeight: 500,
    width: '100%',
    letterSpacing: '-0.01em',
    transition: 'border-color 0.15s',
  },
  tagSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  modeSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  tagSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--ink3)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tagChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '7px 12px',
    borderRadius: 'var(--r-pill)',
    fontSize: 12,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  modeRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  modeChip: {
    padding: '11px 14px',
    borderRadius: 'var(--r-sm)',
    fontSize: 13,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  extraRow: { display: 'flex', gap: 10 },
  extraField: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  numInput: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--ink4)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink)',
    padding: '11px 14px',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: "'DM Mono', monospace",
    width: '100%',
  },
  dtInput: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--ink4)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink)',
    padding: '11px 14px',
    fontSize: 13,
    width: '100%',
  },
  preview: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 14px',
    borderRadius: 'var(--r-sm)',
  },
  previewLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  previewTime: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.01em',
  },
  previewArrow: { fontSize: 12 },
  previewDur: {
    fontSize: 12,
    color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
  },
  err: { fontSize: 12, color: 'var(--waste-c)', fontWeight: 500 },
  cta: {
    background: 'var(--dark)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    padding: '14px',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    transition: 'opacity 0.15s',
  },
};

'use client';
import { useState } from 'react';

const TAGS = [
  { key: 'study',   label: 'Study',   color: 'var(--study)', bg: 'var(--study-bg)', bd: 'var(--study-bd)' },
  { key: 'Wasting', label: 'Waste',   color: 'var(--waste)', bg: 'var(--waste-bg)', bd: 'var(--waste-bd)' },
  { key: 'prayer',  label: 'Prayer',  color: 'var(--pray)',  bg: 'var(--pray-bg)',  bd: 'var(--pray-bd)'  },
  { key: 'food',    label: 'Food',    color: 'var(--food)',  bg: 'var(--food-bg)',  bd: 'var(--food-bd)'  },
  { key: 'sleep',   label: 'Sleep',   color: 'var(--sleep)', bg: 'var(--sleep-bg)', bd: 'var(--sleep-bd)' },
  { key: 'other',   label: 'Other',   color: 'var(--other)', bg: 'var(--other-bg)', bd: 'var(--other-bd)' },
];

function fmt12(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function minutesSince(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}
function fmtDur(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity,  setActivity]  = useState('');
  const [tag,       setTag]       = useState('study');
  const [manual,    setManual]    = useState(false);
  const [duration,  setDuration]  = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState('');

  const tz      = -new Date().getTimezoneOffset();
  const base    = lastEntryEnd || new Date().toISOString();
  const autoMin = minutesSince(base);
  const aTag    = TAGS.find(t => t.key === tag);

  const resolvedStart = manual && startedAt ? new Date(startedAt).toISOString() : base;
  const resolvedDur   = manual ? (parseInt(duration) || 0) : autoMin;

  async function submit() {
    if (!activity.trim() || resolvedDur < 1) return;
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: activity.trim(), tag, started_at: resolvedStart, duration_minutes: resolvedDur, tz }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onEntryAdded(await res.json());
      setActivity(''); setDuration(''); setStartedAt(''); setManual(false);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.card}>
      {/* tag chips */}
      <div style={s.tagRow}>
        {TAGS.map(t => {
          const active = tag === t.key;
          return (
            <button
              key={t.key}
              style={{
                ...s.tagChip,
                color:       active ? t.color : 'var(--ink3)',
                background:  active ? t.bg    : 'transparent',
                borderColor: active ? t.bd    : 'var(--border)',
                fontWeight:  active ? 600     : 400,
              }}
              onClick={() => setTag(t.key)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* activity input + log button */}
      <div style={s.inputRow}>
        <input
          style={s.input}
          placeholder="what did you do?"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <button
          style={{
            ...s.logBtn,
            background: activity.trim() ? 'var(--ink)' : 'var(--ink4)',
            color: activity.trim() ? '#fff' : 'var(--ink3)',
          }}
          onClick={submit}
          disabled={loading || !activity.trim()}
        >
          {loading ? '…' : 'Log'}
        </button>
      </div>

      {/* time hint — key UX: shows from-last-entry info */}
      <div style={s.hintRow}>
        {!manual ? (
          <div style={s.autoHint}>
            <span style={s.hintDot} />
            <span style={s.hintTxt}>
              From {fmt12(base)} → now · <strong>{fmtDur(autoMin)}</strong>
            </span>
            <button style={s.manualToggle} onClick={() => setManual(true)}>
              Manual
            </button>
          </div>
        ) : (
          <div style={s.manualFields}>
            <div style={s.manualField}>
              <span style={s.fieldLbl}>Start</span>
              <input
                style={s.miniInput}
                type="datetime-local"
                value={startedAt}
                onChange={e => setStartedAt(e.target.value)}
              />
            </div>
            <div style={s.manualField}>
              <span style={s.fieldLbl}>Duration</span>
              <input
                style={{ ...s.miniInput, width: 70 }}
                type="number"
                placeholder="min"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                min="1"
              />
            </div>
            <button style={s.manualToggle} onClick={() => { setManual(false); setDuration(''); setStartedAt(''); }}>
              ← Auto
            </button>
          </div>
        )}
      </div>

      {err && <div style={s.err}>{err}</div>}
    </div>
  );
}

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  tagRow: {
    display: 'flex', gap: 6, flexWrap: 'wrap',
  },
  tagChip: {
    padding: '5px 13px',
    borderRadius: 'var(--r-pill)',
    fontSize: 12,
    border: '1.5px solid',
    transition: 'all 0.15s',
    letterSpacing: '0.02em',
  },
  inputRow: {
    display: 'flex', gap: 8,
  },
  input: {
    flex: 1,
    padding: '11px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    fontSize: 15,
    color: 'var(--ink)',
    background: 'var(--bg)',
    transition: 'border-color 0.15s',
  },
  logBtn: {
    padding: '11px 20px',
    borderRadius: 'var(--r-sm)',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  hintRow: {
    minHeight: 28,
  },
  autoHint: {
    display: 'flex', alignItems: 'center', gap: 7,
  },
  hintDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--study)',
    flexShrink: 0,
    display: 'block',
  },
  hintTxt: {
    fontSize: 12, color: 'var(--ink2)', flex: 1,
    lineHeight: 1.4,
  },
  manualToggle: {
    fontSize: 11, color: 'var(--ink3)',
    textDecoration: 'underline',
    flexShrink: 0,
    padding: '2px 0',
  },
  manualFields: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
  },
  manualField: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  fieldLbl: {
    fontSize: 11, color: 'var(--ink2)', fontWeight: 500, whiteSpace: 'nowrap',
  },
  miniInput: {
    padding: '7px 10px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-xs)',
    fontSize: 12,
    color: 'var(--ink)',
    background: 'var(--bg)',
  },
  err: {
    fontSize: 11, color: 'var(--waste)',
  },
};

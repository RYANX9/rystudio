'use client';
import { useState } from 'react';

const TAGS = ['study', 'break', 'prayer', 'food', 'other'];
// mode: 'now' | 'auto' | 'manual'
// now   = started_at is last entry end, duration = from that until right now (auto-calculated)
// auto  = started_at is last entry end, user types duration
// manual = user picks both start and duration

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [mode, setMode] = useState('now');
  const [duration, setDuration] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const base = lastEntryEnd || new Date().toISOString();

  // derived values per mode
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
    if (!activity.trim()) return;
    if (mode !== 'now' && !duration) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.trim(),
          tag,
          started_at: resolvedStart,
          duration_minutes: resolvedDuration,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      const entry = await res.json();
      onEntryAdded(entry);
      setActivity('');
      setDuration('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* activity + tag */}
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="what did you do"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          required
        />
        <select style={styles.select} value={tag} onChange={(e) => setTag(e.target.value)}>
          {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* mode selector */}
      <div style={styles.modeRow}>
        {['now', 'auto', 'manual'].map((m) => (
          <button
            key={m}
            type="button"
            style={{ ...styles.modeBtn, ...(mode === m ? styles.modeBtnActive : {}) }}
            onClick={() => setMode(m)}
          >
            {m === 'now' ? 'log now' : m}
          </button>
        ))}
      </div>

      {/* mode hint */}
      <div style={styles.hint}>
        {mode === 'now' && 'starts from last entry end, duration = until right now'}
        {mode === 'auto' && 'starts from last entry end, you set duration'}
        {mode === 'manual' && 'you set both start time and duration'}
      </div>

      {/* duration input - not needed for 'now' */}
      {mode !== 'now' && (
        <div style={styles.row}>
          <input
            style={{ ...styles.input, maxWidth: '120px' }}
            type="number"
            placeholder="duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            required
          />
          {mode === 'manual' && (
            <input
              style={styles.input}
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          )}
        </div>
      )}

      {/* time preview */}
      {(mode === 'now' || (mode !== 'now' && duration)) && endTime && (
        <div style={styles.preview}>
          {formatTime(new Date(resolvedStart))} → {formatTime(endTime)}
          {mode === 'now' && <span style={styles.previewNote}> ({resolvedDuration} min)</span>}
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <button type="submit" style={styles.submit} disabled={loading}>
        {loading ? '...' : 'log'}
      </button>
    </form>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    border: '1px solid #2a2a2a',
    background: '#1a1a1a',
    borderRadius: '4px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: '#141414',
    border: '1px solid #2e2e2e',
    color: '#e0e0e0',
    padding: '9px 11px',
    fontSize: '14px',
    outline: 'none',
    minWidth: '80px',
    borderRadius: '3px',
  },
  select: {
    background: '#141414',
    border: '1px solid #2e2e2e',
    color: '#9a9a9a',
    padding: '9px 10px',
    fontSize: '13px',
    outline: 'none',
    borderRadius: '3px',
  },
  modeRow: {
    display: 'flex',
    gap: '0',
    border: '1px solid #2e2e2e',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  modeBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRight: '1px solid #2e2e2e',
    color: '#666',
    padding: '8px 6px',
    fontSize: '12px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  modeBtnActive: {
    background: '#2a2a2a',
    color: '#e0e0e0',
  },
  hint: {
    fontSize: '11px',
    color: '#555',
    fontFamily: 'monospace',
    lineHeight: 1.4,
  },
  preview: {
    fontSize: '12px',
    color: '#7a7a7a',
    fontFamily: 'monospace',
  },
  previewNote: {
    color: '#555',
  },
  error: {
    fontSize: '12px',
    color: '#e05555',
  },
  submit: {
    background: '#e0e0e0',
    color: '#141414',
    border: 'none',
    padding: '11px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
    letterSpacing: '0.06em',
    borderRadius: '3px',
  },
};

'use client';
import { useState } from 'react';

const TAGS = ['study', 'Wasting', 'prayer', 'food', 'other'];

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [mode, setMode] = useState('now');
  const [duration, setDuration] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      <div style={styles.modeRow}>
        {[
          { key: 'now', label: 'log now' },
          { key: 'auto', label: 'set duration' },
          { key: 'manual', label: 'manual' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            style={{ ...styles.modeBtn, ...(mode === key ? styles.modeBtnActive : {}) }}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={styles.hint}>
        {mode === 'now' && 'duration calculated from last entry until now'}
        {mode === 'auto' && 'starts from last entry end — you set duration'}
        {mode === 'manual' && 'set both start time and duration manually'}
      </div>

      {mode !== 'now' && (
        <div style={styles.row}>
          <input
            style={{ ...styles.input, maxWidth: '130px' }}
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

      {endTime && (
        <div style={styles.preview}>
          {formatTime(new Date(resolvedStart))} → {formatTime(endTime)}
          {mode === 'now' && <span style={styles.previewNote}> · {resolvedDuration} min</span>}
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <button type="submit" style={styles.submit} disabled={loading}>
        {loading ? '...' : 'log entry'}
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
    background: '#fff',
    border: '1px solid #e0dfd8',
    borderRadius: '10px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: '#f5f5f0',
    border: '1px solid #ddddd5',
    color: '#1a1a1a',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    borderRadius: '8px',
    minWidth: '80px',
  },
  select: {
    background: '#f5f5f0',
    border: '1px solid #ddddd5',
    color: '#555',
    padding: '10px 10px',
    fontSize: '13px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    borderRadius: '8px',
  },
  modeRow: {
    display: 'flex',
    gap: '6px',
  },
  modeBtn: {
    flex: 1,
    background: '#f5f5f0',
    border: '1px solid #ddddd5',
    color: '#888',
    padding: '8px 6px',
    fontSize: '12px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  modeBtnActive: {
    background: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#fff',
  },
  hint: {
    fontSize: '11px',
    color: '#aaa',
    lineHeight: 1.4,
  },
  preview: {
    fontSize: '13px',
    color: '#555',
    fontWeight: '600',
    background: '#f5f5f0',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  previewNote: {
    color: '#aaa',
    fontWeight: '400',
  },
  error: {
    fontSize: '12px',
    color: '#c0392b',
  },
  submit: {
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    padding: '12px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '8px',
  },
};

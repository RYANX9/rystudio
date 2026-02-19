'use client';
import { useState } from 'react';

const TAGS = ['study', 'break', 'prayer', 'food', 'other'];

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {
  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [duration, setDuration] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [useAuto, setUseAuto] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // auto-fill: start = last entry's end time, or now
  const resolvedStart = useAuto
    ? (lastEntryEnd || new Date().toISOString())
    : (startedAt ? new Date(startedAt).toISOString() : new Date().toISOString());

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activity.trim() || !duration) return;

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
          duration_minutes: parseInt(duration),
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

  const endTime = duration
    ? new Date(new Date(resolvedStart).getTime() + parseInt(duration) * 60000)
    : null;

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

      <div style={styles.row}>
        <input
          style={{ ...styles.input, width: '100px' }}
          type="number"
          placeholder="min"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          required
        />

        <div style={styles.timeToggle}>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(useAuto ? styles.toggleActive : {}) }}
            onClick={() => setUseAuto(true)}
          >
            auto
          </button>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(!useAuto ? styles.toggleActive : {}) }}
            onClick={() => setUseAuto(false)}
          >
            manual
          </button>
        </div>

        {!useAuto && (
          <input
            style={{ ...styles.input, width: '160px' }}
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            required={!useAuto}
          />
        )}
      </div>

      {duration && (
        <div style={styles.preview}>
          {formatTime(new Date(resolvedStart))} → {formatTime(endTime)}
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
    border: '1px solid #222',
    background: '#111',
  },
  row: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: '#0a0a0a',
    border: '1px solid #333',
    color: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    outline: 'none',
    minWidth: '80px',
  },
  select: {
    background: '#0a0a0a',
    border: '1px solid #333',
    color: '#888',
    padding: '8px 10px',
    fontSize: '13px',
    outline: 'none',
  },
  timeToggle: {
    display: 'flex',
    border: '1px solid #333',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#555',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  toggleActive: {
    background: '#222',
    color: '#fff',
  },
  preview: {
    fontSize: '12px',
    color: '#555',
    fontFamily: 'monospace',
  },
  error: {
    fontSize: '12px',
    color: '#c0392b',
  },
  submit: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
};

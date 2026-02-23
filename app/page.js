'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import ReminderPanel from '@/components/ReminderPanel';
import TodoPanel from '@/components/TodoPanel';

const STUDY_GOAL_MINUTES = 360;

export default function Page() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const offset = -new Date().getTimezoneOffset();
      const res = await fetch(`/api/entries?date=${date}&tz=${offset}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (_) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate, fetchEntries]);

  function handleEntryAdded(entry) {
    const entryDate = new Date(
      new Date(entry.started_at).getTime() - new Date().getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    if (entryDate === selectedDate) {
      setEntries((prev) =>
        [...prev, entry].sort((a, b) => new Date(a.started_at) - new Date(b.started_at))
      );
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const lastEntryEnd =
    entries.length > 0
      ? (() => {
          const last = entries[entries.length - 1];
          return new Date(
            new Date(last.started_at).getTime() + last.duration_minutes * 60000
          ).toISOString();
        })()
      : null;

  function shiftDate(days) {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const isToday = selectedDate === todayStr();

  const studyMinutes = entries
    .filter((e) => e.tag === 'study')
    .reduce((sum, e) => sum + e.duration_minutes, 0);

  const studyPct = Math.min(100, Math.round((studyMinutes / STUDY_GOAL_MINUTES) * 100));
  const fillColor =
    studyPct >= 100 ? '#2d7a2d' :
    studyPct >= 60  ? '#5a9a40' :
    studyPct >= 30  ? '#c8a030' : '#c06030';

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <span style={styles.appName}>tracker</span>
        <div style={styles.dateNav}>
          <button style={styles.navBtn} onClick={() => shiftDate(-1)}>‹</button>
          <span style={styles.dateLabel}>
            {isToday ? 'today' : formatDate(selectedDate)}
          </span>
          <button
            style={{ ...styles.navBtn, opacity: isToday ? 0.25 : 1 }}
            onClick={() => shiftDate(1)}
            disabled={isToday}
          >
            ›
          </button>
        </div>
      </div>

      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${studyPct}%`, background: fillColor }} />
        </div>
        <span style={styles.progressLabel}>
          {formatDuration(studyMinutes)} studied · {studyPct}% of 6h goal
        </span>
      </div>

      <div style={styles.tabs}>
        {['log', 'todo', 'reminders'].map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'log' && (
          <>
            <EntryForm onEntryAdded={handleEntryAdded} lastEntryEnd={lastEntryEnd} />
            <div style={styles.divider} />
            {loading
              ? <div style={styles.loading}>loading...</div>
              : <Timeline entries={entries} onDelete={handleDelete} />
            }
          </>
        )}
        {tab === 'todo' && <TodoPanel date={selectedDate} />}
        {tab === 'reminders' && <ReminderPanel />}
      </div>
    </main>
  );
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#f5f5f0',
    color: '#1a1a1a',
    fontFamily: "'Cairo', sans-serif",
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0dfd8',
    background: '#fff',
  },
  appName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#888',
    letterSpacing: '0.08em',
  },
  dateNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    background: '#f0efe8',
    border: '1px solid #e0dfd8',
    color: '#555',
    fontSize: '18px',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    lineHeight: 1,
  },
  dateLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    minWidth: '80px',
    textAlign: 'center',
  },
  progressWrap: {
    padding: '8px 16px 10px',
    background: '#fff',
    borderBottom: '1px solid #e0dfd8',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  progressBar: {
    height: '5px',
    background: '#e8e8e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease, background 0.3s ease',
  },
  progressLabel: {
    fontSize: '11px',
    color: '#aaa',
    fontWeight: '600',
    letterSpacing: '0.02em',
  },
  tabs: {
    display: 'flex',
    background: '#fff',
    borderBottom: '1px solid #e0dfd8',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#aaa',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
  },
  tabActive: {
    color: '#1a1a1a',
    borderBottomColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  divider: {
    height: '1px',
    background: '#e0dfd8',
  },
  loading: {
    fontSize: '13px',
    color: '#aaa',
    textAlign: 'center',
    padding: '24px 0',
  },
};

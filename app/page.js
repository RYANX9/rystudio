'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import ReminderPanel from '@/components/ReminderPanel';

export default function Page() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?date=${date}`);
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
    const entryDate = entry.started_at.slice(0, 10);
    if (entryDate === selectedDate) {
      setEntries((prev) => [...prev, entry].sort((a, b) =>
        new Date(a.started_at) - new Date(b.started_at)
      ));
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const lastEntryEnd = entries.length > 0
    ? (() => {
        const last = entries[entries.length - 1];
        return new Date(
          new Date(last.started_at).getTime() + last.duration_minutes * 60000
        ).toISOString();
      })()
    : null;

  function shiftDate(days) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const isToday = selectedDate === todayStr();

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

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'log' ? styles.tabActive : {}) }}
          onClick={() => setTab('log')}
        >
          log
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'reminders' ? styles.tabActive : {}) }}
          onClick={() => setTab('reminders')}
        >
          reminders
        </button>
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
        {tab === 'reminders' && <ReminderPanel />}
      </div>
    </main>
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(str) {
  return new Date(str).toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric'
  });
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

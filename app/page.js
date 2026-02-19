'use client';
import { useState, useEffect, useCallback } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import ReminderPanel from '@/components/ReminderPanel';

export default function Page() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('log'); // 'log' | 'reminders'
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
    // only add to view if it belongs to the selected date
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

  // last entry's end time for auto-chaining in EntryForm
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
      {/* header */}
      <div style={styles.header}>
        <span style={styles.appName}>tracker</span>
        <div style={styles.dateNav}>
          <button style={styles.navBtn} onClick={() => shiftDate(-1)}>‹</button>
          <span style={styles.dateLabel}>
            {isToday ? 'today' : formatDate(selectedDate)}
          </span>
          <button
            style={{ ...styles.navBtn, opacity: isToday ? 0.2 : 1 }}
            onClick={() => shiftDate(1)}
            disabled={isToday}
          >
            ›
          </button>
        </div>
      </div>

      {/* tabs */}
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

      {/* content */}
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
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: "'Courier New', Courier, monospace",
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #1a1a1a',
  },
  appName: {
    fontSize: '13px',
    color: '#444',
    letterSpacing: '0.1em',
  },
  dateNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  dateLabel: {
    fontSize: '13px',
    color: '#888',
    minWidth: '80px',
    textAlign: 'center',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1a1a1a',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#444',
    padding: '12px',
    fontSize: '12px',
    letterSpacing: '0.08em',
    cursor: 'pointer',
  },
  tabActive: {
    color: '#fff',
    borderBottomColor: '#fff',
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
    background: '#1a1a1a',
  },
  loading: {
    fontSize: '12px',
    color: '#333',
    textAlign: 'center',
    padding: '20px 0',
  },
};

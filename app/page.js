'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import EntryForm from '@/components/EntryForm';
import Timeline from '@/components/Timeline';
import NowPanel from '@/components/NowPanel';
import TodoPanel from '@/components/TodoPanel';
import WeeklyView from '@/components/WeeklyView';
import StatsView from '@/components/StatsView';
import Ribbon24h from '@/components/Ribbon24h';

const STUDY_GOAL_MINUTES = 180; // 3h

export default function Page() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const offlineQueueRef = useRef([]);

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    try {
      const tz = -new Date().getTimezoneOffset();
      const res = await fetch(`/api/entries?date=${date}&tz=${tz}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (_) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(selectedDate); }, [selectedDate, fetchEntries]);

  useEffect(() => {
    const tz = -new Date().getTimezoneOffset();
    fetch(`/api/streak?tz=${tz}`)
      .then((r) => r.json())
      .then((d) => setStreak(d))
      .catch(() => {});
  }, [entries]);

  useEffect(() => {
    fetch('/api/budgets')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((b) => { map[b.tag] = b.daily_limit_min; });
          setBudgets(map);
        }
      })
      .catch(() => {});
  }, []);

  // offline detection + queue flush
  useEffect(() => {
    const onOnline = async () => {
      setIsOffline(false);
      const queue = [...offlineQueueRef.current];
      offlineQueueRef.current = [];
      for (const payload of queue) {
        try {
          const res = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const entry = await res.json();
            handleEntryAdded(entry);
          }
        } catch (_) {}
      }
    };
    const onOffline = () => setIsOffline(true);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  function handleEntryAdded(newEntries) {
    const arr = Array.isArray(newEntries) ? newEntries : [newEntries];
    setEntries((prev) => {
      const filtered = arr.filter((entry) => {
        const tz = -new Date().getTimezoneOffset();
        const entryDate = new Date(
          new Date(entry.started_at).getTime() + tz * 60000
        ).toISOString().slice(0, 10);
        return entryDate === selectedDate;
      });
      return [...prev, ...filtered].sort(
        (a, b) => new Date(a.started_at) - new Date(b.started_at)
      );
    });
  }

  function handleOfflineQueue(payload) {
    offlineQueueRef.current.push(payload);
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
    studyPct >= 100 ? '#22c55e' :
    studyPct >= 60  ? '#84cc16' :
    studyPct >= 30  ? '#f59e0b' : '#ef4444';

  const tagTotals = {};
  entries.forEach((e) => {
    tagTotals[e.tag] = (tagTotals[e.tag] || 0) + e.duration_minutes;
  });

  const budgetWarnings = Object.entries(budgets)
    .filter(([tag, limit]) => (tagTotals[tag] || 0) > limit)
    .map(([tag]) => tag);

  const TABS = [
    { key: 'log',   label: 'LOG' },
    { key: 'now',   label: 'NOW' },
    { key: 'todo',  label: 'TASKS' },
    { key: 'week',  label: 'WEEK' },
    { key: 'stats', label: 'STATS' },
  ];

  return (
    <main style={styles.main}>
      {/* offline banner */}
      {isOffline && (
        <div style={styles.offlineBanner}>
          offline — entries queued locally
        </div>
      )}

      {/* budget warnings */}
      {budgetWarnings.length > 0 && (
        <div style={styles.budgetWarn}>
          over limit: {budgetWarnings.join(', ')}
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.appName}>chronicle</span>
          {streak !== null && (
            <div style={styles.streakGroup}>
              {streak.streak > 0 && (
                <span style={styles.streakBadge}>{streak.streak}d</span>
              )}
              {streak.longest_streak > 0 && streak.longest_streak !== streak.streak && (
                <span style={styles.bestBadge}>best {streak.longest_streak}d</span>
              )}
            </div>
          )}
        </div>
        <div style={styles.dateNav}>
          <button style={styles.navBtn} onClick={() => shiftDate(-1)}>‹</button>
          <span style={styles.dateLabel}>
            {isToday ? 'today' : formatDate(selectedDate)}
          </span>
          <button
            style={{ ...styles.navBtn, opacity: isToday ? 0.25 : 1 }}
            onClick={() => shiftDate(1)}
            disabled={isToday}
          >›</button>
        </div>
      </div>

      {/* 24h ribbon */}
      <Ribbon24h entries={entries} selectedDate={selectedDate} />

      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${studyPct}%`, background: fillColor }} />
        </div>
        <div style={styles.progressMeta}>
          <span style={styles.progressLabel}>
            {formatDuration(studyMinutes)} studied · {studyPct}% of 3h goal
          </span>
          <span style={{ ...styles.progressLabel, color: studyPct >= 100 ? '#22c55e' : '#999' }}>
            {studyPct >= 100 ? 'GOAL HIT' : `${formatDuration(STUDY_GOAL_MINUTES - studyMinutes)} left`}
          </span>
        </div>
      </div>

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(tab === t.key ? styles.tabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'log' && (
          <>
            <EntryForm
              onEntryAdded={handleEntryAdded}
              onOfflineQueue={handleOfflineQueue}
              isOffline={isOffline}
              lastEntryEnd={lastEntryEnd}
            />
            <div style={styles.divider} />
            {loading
              ? <div style={styles.loading}>loading...</div>
              : <Timeline entries={entries} onDelete={handleDelete} budgets={budgets} />
            }
          </>
        )}
        {tab === 'now' && (
          <NowPanel
            entries={entries}
            onEntryAdded={handleEntryAdded}
            selectedDate={selectedDate}
          />
        )}
        {tab === 'todo' && <TodoPanel date={selectedDate} />}
        {tab === 'week' && <WeeklyView />}
        {tab === 'stats' && <StatsView />}
      </div>
    </main>
  );
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
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
    background: '#0f0f0d',
    color: '#e8e8e0',
    fontFamily: "'Cairo', sans-serif",
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  },
  offlineBanner: {
    background: '#7c2d12',
    color: '#fed7aa',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    padding: '6px',
  },
  budgetWarn: {
    background: '#451a03',
    color: '#fb923c',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    padding: '5px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid #1e1e1a',
    background: '#0f0f0d',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  appName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#555',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  streakGroup: {
    display: 'flex',
    gap: '5px',
  },
  streakBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#22c55e',
    background: '#052e16',
    border: '1px solid #166534',
    padding: '2px 7px',
    borderRadius: '20px',
  },
  bestBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#f59e0b',
    background: '#1c1003',
    border: '1px solid #78350f',
    padding: '2px 7px',
    borderRadius: '20px',
  },
  dateNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navBtn: {
    background: '#1a1a16',
    border: '1px solid #2a2a24',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
  },
  dateLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccc',
    minWidth: '80px',
    textAlign: 'center',
  },
  progressWrap: {
    padding: '8px 16px 10px',
    background: '#0f0f0d',
    borderBottom: '1px solid #1e1e1a',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  progressBar: {
    height: '3px',
    background: '#1e1e1a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease, background 0.3s ease',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: '11px',
    color: '#555',
    fontWeight: '600',
    letterSpacing: '0.02em',
  },
  tabs: {
    display: 'flex',
    background: '#0f0f0d',
    borderBottom: '1px solid #1e1e1a',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#444',
    padding: '10px 2px',
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.08em',
  },
  tabActive: {
    color: '#e8e8e0',
    borderBottomColor: '#e8e8e0',
  },
  content: {
    flex: 1,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  divider: {
    height: '1px',
    background: '#1e1e1a',
  },
  loading: {
    fontSize: '13px',
    color: '#555',
    textAlign: 'center',
    padding: '24px 0',
  },
};

'use client';
import { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { label: 'Block 1 — start studying', time: '12:30' },
  { label: 'Block 2 — resume after Asr', time: '16:15' },
  { label: 'Iftar soon — wrap up', time: '18:15' },
  { label: 'Block 3 — night session', time: '21:30' },
  { label: 'Sohour — wake up', time: '05:00' },
];

export default function ReminderPanel() {
  const [reminders, setReminders] = useState([]);
  const [label, setLabel] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    fetchReminders();
    checkPushStatus();
    return () => clearInterval(pollRef.current);
  }, []);

  // poll every 30 seconds, fire any reminder whose time has passed and not yet sent
  useEffect(() => {
    pollRef.current = setInterval(() => {
      setReminders((prev) => {
        const now = new Date();
        prev.forEach((r) => {
          if (!r.sent && new Date(r.remind_at) <= now) {
            triggerReminder(r);
          }
        });
        return prev;
      });
    }, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  async function triggerReminder(r) {
    // show browser notification directly if permission granted
    if (Notification.permission === 'granted') {
      new Notification(r.label, {
        body: new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: '/icon-192.png',
        tag: `reminder-${r.id}`,
      });
    }
    // also mark as sent on server
    try {
      await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, action: 'send' }),
      });
      setReminders((prev) => prev.map((x) => x.id === r.id ? { ...x, sent: true } : x));
    } catch (_) {}
  }

  async function fetchReminders() {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (_) {}
  }

  function checkPushStatus() {
    if (!('Notification' in window)) return;
    setPushEnabled(Notification.permission === 'granted');
  }

  async function enablePush() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permission denied. Enable notifications in browser settings.');
        return;
      }
      setPushEnabled(true);

      // also register with server for web push
      if ('serviceWorker' in navigator && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
        });
        await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
      }
    } catch (err) {
      setError('Failed: ' + err.message);
    }
  }

  async function addReminder(e) {
    e.preventDefault();
    if (!label.trim() || !remindAt) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          remind_at: new Date(remindAt).toISOString(),
        }),
      });
      const reminder = await res.json();
      setReminders((prev) => [...prev, reminder]);
      setLabel('');
      setRemindAt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addPreset(preset) {
    const today = new Date();
    const [h, m] = preset.time.split(':').map(Number);
    today.setHours(h, m, 0, 0);

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: preset.label, remind_at: today.toISOString() }),
      });
      const reminder = await res.json();
      setReminders((prev) => [...prev, reminder]);
    } catch (_) {}
  }

  async function deleteReminder(id) {
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'delete' }),
    });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  const upcoming = reminders
    .filter((r) => !r.sent)
    .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at));

  const past = reminders
    .filter((r) => r.sent)
    .sort((a, b) => new Date(b.remind_at) - new Date(a.remind_at));

  return (
    <div style={styles.wrapper}>
      {/* push status */}
      {!pushEnabled ? (
        <button style={styles.enableBtn} onClick={enablePush}>
          <span style={styles.enableIcon}>🔔</span>
          tap to enable notifications
        </button>
      ) : (
        <div style={styles.enabledBadge}>notifications enabled</div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {/* presets */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>study blocks — tap to add for today</div>
        <div style={styles.presets}>
          {PRESETS.map((p) => (
            <button key={p.time} style={styles.presetBtn} onClick={() => addPreset(p)}>
              <span style={styles.presetTime}>{p.time}</span>
              <span style={styles.presetLabel}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.divider} />

      {/* custom form */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>custom reminder</div>
        <form onSubmit={addReminder} style={styles.form}>
          <input
            style={styles.input}
            placeholder="reminder label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
          />
          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? '...' : 'set reminder'}
          </button>
        </form>
      </div>

      <div style={styles.divider} />

      {/* upcoming */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>upcoming ({upcoming.length})</div>
        {upcoming.length === 0 && <div style={styles.empty}>no reminders set</div>}
        {upcoming.map((r) => (
          <div key={r.id} style={styles.item}>
            <div style={styles.itemLeft}>
              <span style={styles.itemLabel}>{r.label}</span>
              <span style={styles.itemTime}>
                {new Date(r.remind_at).toLocaleString([], {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            <div style={styles.itemActions}>
              <button style={styles.actionBtn} onClick={() => triggerReminder(r)} title="test now">
                ▶
              </button>
              <button style={styles.deleteBtn} onClick={() => deleteReminder(r.id)} title="delete">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.section}>
            <div style={styles.sectionLabel}>sent</div>
            {past.map((r) => (
              <div key={r.id} style={{ ...styles.item, opacity: 0.4 }}>
                <div style={styles.itemLeft}>
                  <span style={styles.itemLabel}>{r.label}</span>
                  <span style={styles.itemTime}>
                    {new Date(r.remind_at).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <button style={styles.deleteBtn} onClick={() => deleteReminder(r.id)}>×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  enableBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#fff8e8',
    border: '1px solid #f0c040',
    color: '#996600',
    padding: '12px',
    fontSize: '13px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '10px',
  },
  enableIcon: { fontSize: '16px' },
  enabledBadge: {
    background: '#e8f5e8',
    border: '1px solid #a0d0a0',
    color: '#2d7a2d',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '8px',
    textAlign: 'center',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  presets: { display: 'flex', flexDirection: 'column', gap: '5px' },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    border: '1px solid #e0dfd8',
    color: '#1a1a1a',
    padding: '11px 14px',
    fontSize: '13px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '8px',
  },
  presetTime: {
    fontWeight: '700',
    color: '#555',
    fontSize: '13px',
    minWidth: '40px',
  },
  presetLabel: { color: '#333' },
  divider: { height: '1px', background: '#e0dfd8' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: {
    background: '#f5f5f0',
    border: '1px solid #ddddd5',
    color: '#1a1a1a',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    borderRadius: '8px',
  },
  submit: {
    background: '#1a1a1a',
    border: 'none',
    color: '#fff',
    padding: '11px',
    fontSize: '13px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 14px',
    background: '#fff',
    border: '1px solid #e0dfd8',
    borderRadius: '8px',
  },
  itemLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  itemLabel: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  itemTime: { fontSize: '11px', color: '#aaa', fontWeight: '500' },
  itemActions: { display: 'flex', gap: '6px', alignItems: 'center' },
  actionBtn: {
    background: '#f0f0e8',
    border: '1px solid #ddddd5',
    color: '#555',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  empty: { fontSize: '13px', color: '#bbb', padding: '8px 0' },
  error: {
    background: '#fef0f0',
    border: '1px solid #f0c0c0',
    color: '#c0392b',
    padding: '10px 12px',
    fontSize: '12px',
    borderRadius: '8px',
  },
};

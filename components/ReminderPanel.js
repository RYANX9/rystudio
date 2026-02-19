'use client';
import { useState, useEffect } from 'react';

export default function ReminderPanel() {
  const [reminders, setReminders] = useState([]);
  const [label, setLabel] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReminders();
    checkPushStatus();
  }, []);

  async function fetchReminders() {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(data);
    } catch (_) {}
  }

  function checkPushStatus() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    setPushEnabled(Notification.permission === 'granted');
  }

  async function enablePush() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

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

      setPushEnabled(true);
    } catch (err) {
      setError('push failed: ' + err.message);
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

  async function deleteReminder(id) {
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'delete' }),
    });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  async function sendNow(id) {
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'send' }),
    });
  }

  return (
    <div style={styles.wrapper}>
      {!pushEnabled && (
        <button style={styles.enableBtn} onClick={enablePush}>
          enable push notifications
        </button>
      )}

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
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.submit} disabled={loading}>
          {loading ? '...' : 'set reminder'}
        </button>
      </form>

      <div style={styles.list}>
        {reminders.length === 0 && <div style={styles.empty}>no reminders</div>}
        {reminders.map((r) => (
          <div key={r.id} style={{ ...styles.item, opacity: r.sent ? 0.4 : 1 }}>
            <div style={styles.itemLeft}>
              <span style={styles.itemLabel}>{r.label}</span>
              <span style={styles.itemTime}>
                {new Date(r.remind_at).toLocaleString([], {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <div style={styles.itemActions}>
              <button style={styles.actionBtn} onClick={() => sendNow(r.id)} title="send now">
                ▶
              </button>
              <button style={styles.actionBtn} onClick={() => deleteReminder(r.id)} title="delete">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
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
  wrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
  enableBtn: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#555',
    padding: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: {
    background: '#0a0a0a',
    border: '1px solid #333',
    color: '#fff',
    padding: '8px 10px',
    fontSize: '14px',
    outline: 'none',
  },
  submit: {
    background: '#1a1a1a',
    border: '1px solid #333',
    color: '#aaa',
    padding: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '2px' },
  empty: { fontSize: '12px', color: '#333', padding: '8px 0' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#111',
    border: '1px solid #1a1a1a',
  },
  itemLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  itemLabel: { fontSize: '13px', color: '#ddd' },
  itemTime: { fontSize: '11px', color: '#444', fontFamily: 'monospace' },
  itemActions: { display: 'flex', gap: '8px' },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#444',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  error: { fontSize: '12px', color: '#c0392b' },
};

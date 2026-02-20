'use client';
import { useState, useEffect } from 'react';

// Ramadan study block presets based on your schedule
const PRESETS = [
  { label: 'Block 1 - start studying', time: '12:30' },
  { label: 'Block 2 - resume after Asr', time: '16:15' },
  { label: 'Iftar coming - wrap up', time: '18:15' },
  { label: 'Block 3 - night session', time: '21:30' },
  { label: 'Sohour - wake up', time: '05:00' },
];

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
      setReminders(Array.isArray(data) ? data : []);
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

  // add a preset for today at the given time
  async function addPreset(preset) {
    const today = new Date();
    const [h, m] = preset.time.split(':').map(Number);
    today.setHours(h, m, 0, 0);

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: preset.label,
          remind_at: today.toISOString(),
        }),
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
          tap to enable push notifications
        </button>
      )}

      {/* Ramadan study presets */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>ramadan study blocks — add for today</div>
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

      {/* custom reminder form */}
      <form onSubmit={addReminder} style={styles.form}>
        <div style={styles.sectionLabel}>custom reminder</div>
        <input
          style={styles.input}
          placeholder="label"
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

      <div style={styles.divider} />

      {/* reminder list */}
      <div style={styles.list}>
        <div style={styles.sectionLabel}>upcoming</div>
        {reminders.length === 0 && <div style={styles.empty}>no reminders set</div>}
        {reminders
          .sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at))
          .map((r) => (
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
                <button style={styles.actionBtn} onClick={() => sendNow(r.id)} title="send now">▶</button>
                <button style={styles.actionBtn} onClick={() => deleteReminder(r.id)} title="delete">×</button>
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
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  enableBtn: {
    background: 'transparent',
    border: '1px solid #2e2e2e',
    color: '#7a7a7a',
    padding: '10px',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: '3px',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionLabel: {
    fontSize: '10px',
    color: '#555',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  presets: { display: 'flex', flexDirection: 'column', gap: '4px' },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1a1a1a',
    border: '1px solid #242424',
    color: '#c0c0c0',
    padding: '9px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '3px',
  },
  presetTime: {
    fontFamily: 'monospace',
    color: '#6a6a6a',
    fontSize: '12px',
    minWidth: '38px',
  },
  presetLabel: { color: '#b0b0b0', fontSize: '13px' },
  divider: { height: '1px', background: '#222' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: {
    background: '#141414',
    border: '1px solid #2e2e2e',
    color: '#e0e0e0',
    padding: '9px 11px',
    fontSize: '14px',
    outline: 'none',
    borderRadius: '3px',
  },
  submit: {
    background: '#1e1e1e',
    border: '1px solid #2e2e2e',
    color: '#b0b0b0',
    padding: '9px',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '3px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '6px' },
  empty: { fontSize: '12px', color: '#444', padding: '6px 0' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#1a1a1a',
    border: '1px solid #242424',
    borderRadius: '3px',
  },
  itemLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  itemLabel: { fontSize: '13px', color: '#d0d0d0' },
  itemTime: { fontSize: '11px', color: '#5a5a5a', fontFamily: 'monospace' },
  itemActions: { display: 'flex', gap: '8px' },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#4a4a4a',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  error: { fontSize: '12px', color: '#e05555' },
};
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

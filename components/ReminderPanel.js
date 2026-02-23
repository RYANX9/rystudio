'use client';
import { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { label: 'Wake up',                   time: '12:00' },
  { label: 'Block 1 — start studying',  time: '13:05' },
  { label: 'Block 1 — wrapping up',     time: '15:50' },
  { label: 'Block 2 — after Asr',       time: '17:00' },
  { label: 'Iftar soon — stop studying', time: '18:20' },
  { label: 'Leave friends — go home',   time: '22:15' },
  { label: 'Block 3 — night session',   time: '22:30' },
  { label: 'Sohour — wake up',          time: '05:00' },
];

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 520 + i * 120;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + delay + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch (_) {}
}

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
    setPushEnabled('Notification' in window && Notification.permission === 'granted');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'REMINDER_FIRED') {
          playAlertSound();
          fetchReminders();
        }
      });
    }

    pollRef.current = setInterval(pingServiceWorker, 30000);
    pingServiceWorker();

    return () => clearInterval(pollRef.current);
  }, []);

  async function pingServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'CHECK_REMINDERS' });
  }

  async function fetchReminders() {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (_) {}
  }

  async function enablePush() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permission denied — go to browser site settings and allow notifications.');
        return;
      }
      setPushEnabled(true);
      setError('');

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
        body: JSON.stringify({ label: label.trim(), remind_at: new Date(remindAt).toISOString() }),
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
    const d = new Date();
    const [h, m] = preset.time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    // if already past, schedule for tomorrow
    if (d < new Date()) d.setDate(d.getDate() + 1);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: preset.label, remind_at: d.toISOString() }),
      });
      const reminder = await res.json();
      setReminders((prev) => [...prev, reminder]);
    } catch (_) {}
  }

  // only plays sound — does NOT mark as sent
  function testSound() {
    playAlertSound();
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
    .sort((a, b) => new Date(b.remind_at) - new Date(a.remind_at))
    .slice(0, 5);

  return (
    <div style={s.wrapper}>
      {!pushEnabled ? (
        <button style={s.enableBtn} onClick={enablePush}>
          tap to enable notifications
        </button>
      ) : (
        <div style={s.enabledBadge}>notifications on</div>
      )}

      {error && <div style={s.error}>{error}</div>}

      <div style={s.note}>
        Reminders fire while this tab is open. Keep the PWA in the background for best results.
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>schedule — tap to add</div>
        <div style={s.presets}>
          {PRESETS.map((p) => (
            <button key={p.label} style={s.presetBtn} onClick={() => addPreset(p)}>
              <span style={s.presetTime}>{p.time}</span>
              <span style={s.presetLabel}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={s.divider} />

      <div style={s.section}>
        <div style={s.sectionLabel}>custom reminder</div>
        <form onSubmit={addReminder} style={s.form}>
          <input
            style={s.input}
            placeholder="reminder label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <input
            style={s.input}
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            required
          />
          <button type="submit" style={s.submit} disabled={loading}>
            {loading ? '...' : 'set reminder'}
          </button>
        </form>
      </div>

      <div style={s.divider} />

      <div style={s.section}>
        <div style={s.sectionLabel}>
          <span>upcoming ({upcoming.length})</span>
          <button style={s.testBtn} onClick={testSound}>test sound</button>
        </div>
        {upcoming.length === 0 && <div style={s.empty}>no reminders set</div>}
        {upcoming.map((r) => (
          <div key={r.id} style={s.item}>
            <div style={s.itemLeft}>
              <span style={s.itemLabel}>{r.label}</span>
              <span style={s.itemTime}>
                {new Date(r.remind_at).toLocaleString([], {
                  weekday: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            <button style={s.del} onClick={() => deleteReminder(r.id)}>×</button>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <>
          <div style={s.divider} />
          <div style={s.section}>
            <div style={s.sectionLabel}>sent</div>
            {past.map((r) => (
              <div key={r.id} style={{ ...s.item, opacity: 0.4 }}>
                <div style={s.itemLeft}>
                  <span style={s.itemLabel}>{r.label}</span>
                  <span style={s.itemTime}>
                    {new Date(r.remind_at).toLocaleString([], {
                      weekday: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <button style={s.del} onClick={() => deleteReminder(r.id)}>×</button>
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

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  enableBtn: {
    background: '#fff8e8', border: '1px solid #f0c040', color: '#996600',
    padding: '12px', fontSize: '13px', fontFamily: "'Cairo', sans-serif",
    fontWeight: '700', cursor: 'pointer', borderRadius: '10px', textAlign: 'center',
  },
  enabledBadge: {
    background: '#e8f5e8', border: '1px solid #a0d0a0', color: '#2d7a2d',
    padding: '8px 12px', fontSize: '12px', fontWeight: '700',
    borderRadius: '8px', textAlign: 'center', fontFamily: "'Cairo', sans-serif",
  },
  note: {
    fontSize: '11px', color: '#aaa', background: '#f5f5f0',
    padding: '8px 12px', borderRadius: '8px', lineHeight: 1.5,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionLabel: {
    fontSize: '11px', fontWeight: '700', color: '#aaa',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  testBtn: {
    background: '#f0f0e8', border: '1px solid #ddddd5', color: '#666',
    fontSize: '10px', fontWeight: '700', fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer', padding: '3px 8px', borderRadius: '5px',
    textTransform: 'none', letterSpacing: 0,
  },
  presets: { display: 'flex', flexDirection: 'column', gap: '5px' },
  presetBtn: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#fff', border: '1px solid #e0dfd8', color: '#1a1a1a',
    padding: '11px 14px', fontSize: '13px', fontFamily: "'Cairo', sans-serif",
    fontWeight: '500', cursor: 'pointer', textAlign: 'left', borderRadius: '8px',
  },
  presetTime: { fontWeight: '700', color: '#555', fontSize: '13px', minWidth: '44px' },
  presetLabel: { color: '#333' },
  divider: { height: '1px', background: '#e0dfd8' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: {
    background: '#f5f5f0', border: '1px solid #ddddd5', color: '#1a1a1a',
    padding: '10px 12px', fontSize: '14px', fontFamily: "'Cairo', sans-serif",
    outline: 'none', borderRadius: '8px',
  },
  submit: {
    background: '#1a1a1a', border: 'none', color: '#fff', padding: '11px',
    fontSize: '13px', fontFamily: "'Cairo', sans-serif", fontWeight: '700',
    cursor: 'pointer', borderRadius: '8px',
  },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '11px 14px', background: '#fff', border: '1px solid #e0dfd8', borderRadius: '8px',
  },
  itemLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  itemLabel: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  itemTime: { fontSize: '11px', color: '#aaa', fontWeight: '500' },
  del: {
    background: 'none', border: 'none', color: '#ccc',
    fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
  empty: { fontSize: '13px', color: '#bbb', padding: '8px 0' },
  error: {
    background: '#fef0f0', border: '1px solid #f0c0c0', color: '#c0392b',
    padding: '10px 12px', fontSize: '12px', fontFamily: "'Cairo', sans-serif", borderRadius: '8px',
  },
};

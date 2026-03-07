'use client';
import { useState, useEffect } from 'react';

const TAGS = [
  { key: 'study',   label: 'Study',  color: 'var(--study)', bg: 'var(--study-bg)', bd: 'var(--study-bd)' },
  { key: 'Wasting', label: 'Waste',  color: 'var(--waste)', bg: 'var(--waste-bg)', bd: 'var(--waste-bd)' },
  { key: 'prayer',  label: 'Prayer', color: 'var(--pray)',  bg: 'var(--pray-bg)',  bd: 'var(--pray-bd)'  },
  { key: 'food',    label: 'Food',   color: 'var(--food)',  bg: 'var(--food-bg)',  bd: 'var(--food-bd)'  },
  { key: 'sleep',   label: 'Sleep',  color: 'var(--sleep)', bg: 'var(--sleep-bg)', bd: 'var(--sleep-bd)' },
  { key: 'other',   label: 'Other',  color: 'var(--other)', bg: 'var(--other-bg)', bd: 'var(--other-bd)' },
];

function toLocalTime(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmt(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function minutesBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 60000);
}

function minutesSince(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function fmtDur(m) {
  if (!m || m <= 0) return '—';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}

export default function EntryForm({ onEntryAdded, lastEntryEnd }) {

  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [manual, setManual] = useState(false);
  const [manStart, setManStart] = useState('');
  const [manEnd, setManEnd] = useState('');
  const [now, setNow] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 60000);
    return () => clearInterval(id);
  }, []);

  const tz = -new Date().getTimezoneOffset();
  const base = lastEntryEnd || now;

  const autoMin = minutesSince(base);

  const today = new Date().toISOString().slice(0, 10);

  const manStartISO = manStart ? new Date(`${today}T${manStart}`).toISOString() : null;
  const manEndISO   = manEnd   ? new Date(`${today}T${manEnd}`).toISOString()   : null;

  const manMin   = manStartISO && manEndISO ? minutesBetween(manStartISO, manEndISO) : null;
  const manValid = manMin !== null && manMin > 0;

  const resolvedStart = manual ? (manStartISO || base) : base;
  const resolvedDur   = manual ? (manMin || 0) : autoMin;

  function openManual() {
    setManStart(toLocalTime(base));
    setManEnd(toLocalTime(now));
    setManual(true);
  }

  function closeManual() {
    setManual(false);
    setManStart('');
    setManEnd('');
  }

  async function submit() {

    if (!activity.trim() || resolvedDur < 1) return;

    setLoading(true);
    setErr('');

    try {

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.trim(),
          tag,
          started_at: resolvedStart,
          duration_minutes: resolvedDur,
          tz,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      onEntryAdded(await res.json());
      setActivity('');
      closeManual();

    } catch (e) {
      setErr(e.message);
    }

    finally {
      setLoading(false);
    }

  }

  const aTag = TAGS.find(t => t.key === tag);

  return (

    <div style={s.card}>

      <div style={s.tagRow}>
        {TAGS.map(t => {

          const active = tag === t.key;

          return (
            <button
              key={t.key}
              style={{
                ...s.tagChip,
                color: active ? t.color : 'var(--ink3)',
                background: active ? t.bg : 'transparent',
                borderColor: active ? t.bd : 'var(--border)',
                fontWeight: active ? 600 : 400,
              }}
              onClick={() => setTag(t.key)}
            >
              {t.label}
            </button>
          );

        })}
      </div>

      <div style={s.inputRow}>

        <input
          style={s.input}
          placeholder="what did you do?"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />

        <button
          style={{
            ...s.logBtn,
            background: activity.trim() ? 'var(--ink)' : 'var(--ink4)',
            color: activity.trim() ? '#fff' : 'var(--ink3)',
          }}
          onClick={submit}
          disabled={loading || !activity.trim()}
        >
          {loading ? '…' : 'Log'}
        </button>

      </div>

      {!manual ? (

        <div style={s.hintRow}>
          <span style={{ ...s.hintDot, background: aTag?.color }} />
          <span style={s.hintTxt}>
            From <strong>{fmt(base)}</strong> → now · <strong>{fmtDur(autoMin)}</strong>
          </span>
          <button style={s.toggleLink} onClick={openManual}>Manual</button>
        </div>

      ) : (

        <div style={s.manualWrap}>

          <div style={s.manualRow}>

            <div style={s.timeField}>
              <span style={s.fieldLbl}>Start</span>
              <input
                style={s.timeInput}
                type="time"
                step="60"
                value={manStart}
                onChange={e => setManStart(e.target.value)}
              />
            </div>

            <span style={s.arrow}>→</span>

            <div style={s.timeField}>
              <span style={s.fieldLbl}>End</span>
              <input
                style={s.timeInput}
                type="time"
                step="60"
                value={manEnd}
                onChange={e => setManEnd(e.target.value)}
              />
            </div>

          </div>

          <div style={s.hintRow}>

            <span
              style={{
                ...s.hintDot,
                background: manValid ? aTag?.color : 'var(--ink4)',
              }}
            />

            {manValid ? (
              <span style={s.hintTxt}>
                From <strong>{fmt(manStartISO)}</strong> → <strong>{fmt(manEndISO)}</strong> · <strong>{fmtDur(manMin)}</strong>
              </span>
            ) : (
              <span style={{ ...s.hintTxt, color: 'var(--ink3)' }}>
                {manStart && manEnd && !manValid
                  ? 'End must be after start'
                  : 'Pick a start and end time'}
              </span>
            )}

            <button style={s.toggleLink} onClick={closeManual}>← Auto</button>

          </div>

        </div>

      )}

      {err && <div style={s.err}>{err}</div>}

    </div>

  );

}

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },

  tagChip: {
    padding: '5px 13px',
    borderRadius: 'var(--r-pill)',
    fontSize: 12,
    border: '1.5px solid',
    transition: 'all 0.15s',
    letterSpacing: '0.02em',
  },

  inputRow: { display: 'flex', gap: 8 },

  input: {
    flex: 1,
    padding: '11px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    fontSize: 15,
    color: 'var(--ink)',
    background: 'var(--bg)',
  },

  logBtn: {
    padding: '11px 20px',
    borderRadius: 'var(--r-sm)',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    transition: 'all 0.15s',
    flexShrink: 0,
  },

  hintRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },

  hintDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
  },

  hintTxt: {
    fontSize: 12,
    color: 'var(--ink2)',
    flex: 1,
  },

  toggleLink: {
    fontSize: 11,
    color: 'var(--ink3)',
    textDecoration: 'underline',
  },

  manualWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  manualRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },

  timeField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },

  fieldLbl: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--ink2)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },

  timeInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-xs)',
    fontSize: 13,
    color: 'var(--ink)',
    background: 'var(--bg)',
  },

  arrow: {
    fontSize: 14,
    color: 'var(--ink3)',
    paddingBottom: 8,
  },

  err: { fontSize: 11, color: 'var(--waste)' },
};

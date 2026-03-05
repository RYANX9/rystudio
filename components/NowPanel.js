'use client';
import { useState, useEffect, useRef } from 'react';

const TAGS = ['study', 'Wasting', 'prayer', 'food', 'sleep', 'other'];

const TAG_COLORS = {
  study:   { bg: '#052e16', text: '#22c55e', border: '#166534' },
  Wasting: { bg: '#2d0a0a', text: '#ef4444', border: '#7f1d1d' },
  prayer:  { bg: '#0c1a3a', text: '#60a5fa', border: '#1e3a8a' },
  food:    { bg: '#1c0e04', text: '#f97316', border: '#7c2d12' },
  sleep:   { bg: '#150d2e', text: '#a78bfa', border: '#4c1d95' },
  other:   { bg: '#111', text: '#9ca3af', border: '#374151' },
};

export default function NowPanel({ entries, onEntryAdded, selectedDate }) {
  const [locked, setLocked] = useState(null);
  const [activity, setActivity] = useState('');
  const [tag, setTag] = useState('study');
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    fetch('/api/locked-session')
      .then((r) => r.json())
      .then((s) => { if (s?.id) setLocked(s); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!locked) { setElapsed(0); return; }
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(locked.started_at).getTime()) / 1000));
    };
    update();
    tickRef.current = setInterval(update, 1000);
    return () => clearInterval(tickRef.current);
  }, [locked]);

  async function lockSession() {
    if (!activity.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/locked-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.trim(),
          tag,
          started_at: new Date().toISOString(),
          note: note.trim() || null,
        }),
      });
      const session = await res.json();
      setLocked(session);
      setActivity('');
      setNote('');
    } finally {
      setLoading(false);
    }
  }

  async function commitSession() {
    if (!locked) return;
    setCommitting(true);
    const durationMin = Math.max(1, Math.round(elapsed / 60));
    const tz = -new Date().getTimezoneOffset();
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: locked.activity,
          tag: locked.tag,
          started_at: locked.started_at,
          duration_minutes: durationMin,
          tz,
        }),
      });
      const entry = await res.json();
      onEntryAdded(entry);
      await fetch('/api/locked-session', { method: 'DELETE' });
      setLocked(null);
    } finally {
      setCommitting(false);
    }
  }

  async function discardSession() {
    await fetch('/api/locked-session', { method: 'DELETE' });
    setLocked(null);
  }

  function exportDay() {
    const tz = -new Date().getTimezoneOffset();
    const lines = [`Chronicle — ${selectedDate}`, ''];
    const sorted = [...entries].sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    for (const e of sorted) {
      const start = new Date(new Date(e.started_at).getTime() + tz * 60000);
      const end = new Date(start.getTime() + e.duration_minutes * 60000);
      const fmt = (d) => d.toISOString().slice(11, 16);
      lines.push(`${fmt(start)}–${fmt(end)}  [${e.tag}]  ${e.activity}  (${e.duration_minutes}min)`);
    }
    lines.push('');
    const studyMin = entries.filter((e) => e.tag === 'study').reduce((s, e) => s + e.duration_minutes, 0);
    lines.push(`study total: ${fmtDur(studyMin)}`);
    lines.push(`entries: ${entries.length}`);
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }

  function exportCSV() {
    const tz = -new Date().getTimezoneOffset();
    const from = selectedDate;
    const url = `/api/export?from=${from}&to=${from}&tz=${tz}&format=csv`;
    window.open(url, '_blank');
  }

  const colors = TAG_COLORS[locked?.tag] || TAG_COLORS.other;

  return (
    <div style={s.wrapper}>

      {/* active lock display */}
      {locked ? (
        <div style={{ ...s.lockCard, borderColor: colors.border, background: colors.bg }}>
          <div style={s.lockHeader}>
            <div style={s.lockDot} />
            <span style={{ ...s.lockTag, color: colors.text }}>{locked.tag}</span>
            <span style={s.lockSince}>
              since {new Date(new Date(locked.started_at).getTime() + (-new Date().getTimezoneOffset()) * 60000)
                .toISOString().slice(11, 16)}
            </span>
          </div>
          <div style={s.lockActivity}>{locked.activity}</div>
          {locked.note && <div style={s.lockNote}>{locked.note}</div>}
          <div style={{ ...s.elapsed, color: colors.text }}>{formatElapsed(elapsed)}</div>
          <div style={s.lockActions}>
            <button style={{ ...s.commitBtn, borderColor: colors.border, color: colors.text }}
              onClick={commitSession} disabled={committing}>
              {committing ? '...' : `commit ${fmtDur(Math.max(1, Math.round(elapsed / 60)))}`}
            </button>
            <button style={s.discardBtn} onClick={discardSession}>discard</button>
          </div>
        </div>
      ) : (
        <div style={s.idleCard}>
          <div style={s.idleLabel}>nothing locked</div>
          <div style={s.idleHint}>lock a session to track it in real time</div>
        </div>
      )}

      {/* lock new session form */}
      {!locked && (
        <div style={s.form}>
          <div style={s.sectionLabel}>lock session</div>
          <input
            style={s.input}
            placeholder="what are you starting now?"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lockSession()}
          />
          <div style={s.tagRow}>
            {TAGS.map((t) => {
              const c = TAG_COLORS[t];
              const active = tag === t;
              return (
                <button
                  key={t}
                  style={{
                    ...s.tagBtn,
                    background: active ? c.bg : 'transparent',
                    color: active ? c.text : '#444',
                    borderColor: active ? c.border : '#222',
                  }}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <input
            style={s.input}
            placeholder="note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button style={s.lockBtn} onClick={lockSession} disabled={loading || !activity.trim()}>
            {loading ? '...' : '🔒 lock & start timer'}
          </button>
        </div>
      )}

      <div style={s.divider} />

      {/* export section */}
      <div style={s.exportSection}>
        <div style={s.sectionLabel}>export — {selectedDate}</div>
        <div style={s.exportRow}>
          <button style={s.exportBtn} onClick={exportDay}>
            copy day summary
          </button>
          <button style={s.exportBtn} onClick={exportCSV}>
            download CSV
          </button>
        </div>
        <div style={s.exportNote}>
          CSV includes all entries for this day with timestamps and durations.
        </div>
      </div>

      <div style={s.divider} />

      {/* quick day stats */}
      <div style={s.statsSection}>
        <div style={s.sectionLabel}>today at a glance</div>
        {entries.length === 0 ? (
          <div style={s.noData}>no entries yet</div>
        ) : (
          <div style={s.statGrid}>
            {Object.entries(
              entries.reduce((acc, e) => {
                acc[e.tag] = (acc[e.tag] || 0) + e.duration_minutes;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([tag, min]) => {
                const c = TAG_COLORS[tag] || TAG_COLORS.other;
                return (
                  <div key={tag} style={{ ...s.statPill, background: c.bg, borderColor: c.border }}>
                    <span style={{ color: c.text, fontSize: '11px', fontWeight: '700' }}>{tag}</span>
                    <span style={{ color: '#888', fontSize: '12px', fontWeight: '600' }}>{fmtDur(min)}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatElapsed(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

function fmtDur(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  lockCard: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  lockHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  lockDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
    animation: 'pulse 2s infinite',
  },
  lockTag: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
  lockSince: { fontSize: '11px', color: '#555', marginLeft: 'auto' },
  lockActivity: { fontSize: '20px', fontWeight: '700', color: '#e8e8e0', lineHeight: 1.2 },
  lockNote: { fontSize: '12px', color: '#666', fontStyle: 'italic' },
  elapsed: {
    fontSize: '42px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  lockActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  commitBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '8px',
  },
  discardBtn: {
    background: 'transparent',
    border: '1px solid #2a2a24',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  idleCard: {
    border: '1px solid #1e1e1a',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  idleLabel: { fontSize: '15px', fontWeight: '700', color: '#444' },
  idleHint: { fontSize: '12px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: '700', color: '#444',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  input: {
    background: '#111',
    border: '1px solid #222',
    color: '#e8e8e0',
    padding: '11px 13px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    borderRadius: '8px',
  },
  tagRow: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  tagBtn: {
    border: '1px solid',
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  lockBtn: {
    background: '#1a1a16',
    border: '1px solid #2a2a24',
    color: '#e8e8e0',
    padding: '12px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  divider: { height: '1px', background: '#1e1e1a' },
  exportSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  exportRow: { display: 'flex', gap: '8px' },
  exportBtn: {
    flex: 1,
    background: '#111',
    border: '1px solid #222',
    color: '#888',
    padding: '10px',
    fontSize: '12px',
    fontFamily: "'Cairo', sans-serif",
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  exportNote: { fontSize: '10px', color: '#333' },
  statsSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  statGrid: { display: 'flex', flexDirection: 'column', gap: '5px' },
  statPill: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '8px',
  },
  noData: { fontSize: '12px', color: '#333', padding: '8px 0' },
};

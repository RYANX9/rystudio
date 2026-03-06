'use client';
import { useState, useEffect, useRef } from 'react';

function localNow() {
  const now = new Date();
  const tz  = -now.getTimezoneOffset();
  const loc = new Date(now.getTime() + tz * 60000);
  return {
    local_date: loc.toISOString().slice(0, 10),
    local_time: loc.toISOString().slice(11, 16),
  };
}

function fmtDate(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function NowPanel() {
  const [notes, setNotes]     = useState([]);
  const [body, setBody]       = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState(false);
  const ref = useRef(null);

  const todayStr = localNow().local_date;

  useEffect(() => {
    fetch('/api/now-notes')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotes(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function lock() {
    const text = body.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      const { local_date, local_time } = localNow();
      const res = await fetch('/api/now-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text, local_date, local_time }),
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes(prev => [note, ...prev]);
      setBody('');
      ref.current?.focus();
    } catch (_) {
      alert('Failed to save note. Check your connection.');
    } finally { setSaving(false); }
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); lock(); }
  }

  function exportAll() {
    const grouped = {};
    [...notes].reverse().forEach(n => {
      if (!grouped[n.local_date]) grouped[n.local_date] = [];
      grouped[n.local_date].push(n);
    });
    const lines = ['NOW NOTES', '─'.repeat(30)];
    Object.keys(grouped).sort((a, b) => b.localeCompare(a)).forEach(d => {
      lines.push('', d === todayStr ? `Today — ${d}` : d);
      grouped[d].forEach(n => lines.push(`[${n.local_time}]  ${n.body}`));
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  // group by date newest first
  const grouped = {};
  notes.forEach(n => { if (!grouped[n.local_date]) grouped[n.local_date] = []; grouped[n.local_date].push(n); });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={s.wrap}>

      {/* ── compose ── */}
      <div style={s.composeCard}>
        <div style={s.composeHeader}>
          <div>
            <div style={s.composeTitle}>Capture a thought</div>
            <div style={s.composeSub}>Once locked, it stays forever</div>
          </div>
          {notes.length > 0 && (
            <button style={s.exportBtn} onClick={exportAll}>
              {copied ? '✓ Copied' : `Export (${notes.length})`}
            </button>
          )}
        </div>

        <textarea
          ref={ref}
          style={s.textarea}
          placeholder="An idea, a plan, something on your mind…"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
        />

        <div style={s.composeFooter}>
          <span style={s.hint}>Ctrl + Enter to lock</span>
          <button
            style={{
              ...s.lockBtn,
              opacity: (!body.trim() || saving) ? 0.4 : 1,
              cursor: (!body.trim() || saving) ? 'not-allowed' : 'pointer',
            }}
            onClick={lock}
            disabled={!body.trim() || saving}
          >
            {saving ? 'Locking…' : '🔒 Lock it'}
          </button>
        </div>
      </div>

      {/* ── feed ── */}
      {loading ? (
        <div style={s.loading}>Loading notes…</div>
      ) : notes.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>🔒</div>
          <div style={s.emptyTitle}>No locked thoughts yet</div>
          <div style={s.emptySub}>Write something above and lock it. It will live here permanently.</div>
        </div>
      ) : (
        dates.map(date => (
          <div key={date} style={s.group}>
            <div style={s.dateSep}>
              <div style={s.dateLine} />
              <span style={s.dateLabel}>
                {date === todayStr ? 'Today' : fmtDate(date)}
              </span>
              <div style={s.dateLine} />
              <span style={s.dateCount}>{grouped[date].length}</span>
            </div>
            {grouped[date].map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function NoteCard({ note }) {
  return (
    <div style={s.noteCard}>
      <div style={s.noteTop}>
        <span style={s.noteTime}>{note.local_time}</span>
        <div style={s.lockedPill}>
          <span style={{ fontSize: 10 }}>🔒</span>
          <span style={s.lockedTxt}>locked</span>
        </div>
      </div>
      <p style={s.noteBody}>{note.body}</p>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },

  composeCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: 20,
    boxShadow: 'var(--sh)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  composeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  composeTitle: { fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' },
  composeSub: { fontSize: 12, color: 'var(--ink3)', marginTop: 2 },
  exportBtn: {
    background: 'var(--surface2)',
    border: '1px solid var(--ink4)',
    color: 'var(--ink2)',
    borderRadius: 'var(--r-pill)',
    padding: '6px 14px',
    fontSize: 12, fontWeight: 500,
    flexShrink: 0,
  },

  textarea: {
    background: 'var(--surface2)',
    border: '1.5px solid var(--ink4)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink)',
    padding: '13px 16px',
    fontSize: 15,
    lineHeight: 1.65,
    resize: 'vertical',
    width: '100%',
    minHeight: 100,
    fontFamily: "'DM Sans', sans-serif",
  },

  composeFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  hint: { fontSize: 11, color: 'var(--ink3)' },
  lockBtn: {
    background: 'var(--orange)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    padding: '11px 20px',
    fontSize: 14, fontWeight: 700,
    letterSpacing: '-0.01em',
    transition: 'opacity 0.15s',
  },

  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '24px 0' },

  emptyCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: 'var(--sh)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: 'var(--ink2)' },
  emptySub: { fontSize: 13, color: 'var(--ink3)', maxWidth: 260 },

  group: { display: 'flex', flexDirection: 'column', gap: 8 },

  dateSep: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '4px 0',
  },
  dateLine: { flex: 1, height: 1, background: 'var(--ink4)' },
  dateLabel: {
    fontSize: 11, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  dateCount: {
    background: 'var(--dark)',
    color: '#fff',
    fontSize: 10, fontWeight: 600,
    borderRadius: 'var(--r-pill)',
    padding: '2px 8px',
  },

  noteCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '16px 18px',
    boxShadow: 'var(--sh)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  noteTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  noteTime: {
    fontSize: 12, color: 'var(--ink3)',
    fontFamily: "'DM Mono',monospace", fontWeight: 500,
  },
  lockedPill: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'var(--surface2)',
    border: '1px solid var(--ink4)',
    borderRadius: 'var(--r-pill)',
    padding: '3px 10px',
  },
  lockedTxt: {
    fontSize: 10, fontWeight: 600, color: 'var(--ink3)',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  noteBody: {
    fontSize: 15,
    color: 'var(--ink)',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};

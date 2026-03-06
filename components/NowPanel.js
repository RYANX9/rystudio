'use client';
import { useState, useEffect, useRef } from 'react';

export default function NowPanel() {
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch('/api/now-notes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotes(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleLock() {
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    try {
      const now = new Date();
      const tz = -now.getTimezoneOffset();
      const local = new Date(now.getTime() + tz * 60000);
      const local_date = local.toISOString().slice(0, 10);
      const local_time = local.toISOString().slice(11, 16);

      const res = await fetch('/api/now-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text, local_date, local_time }),
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes(prev => [note, ...prev]);
      setBody('');
      textareaRef.current?.focus();
    } catch (_) {}
    finally { setSaving(false); }
  }

  function handleKeyDown(e) {
    // Ctrl+Enter to lock
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleLock();
    }
  }

  function exportNotes() {
    const today = new Date().toISOString().slice(0, 10);
    const grouped = {};
    for (const n of notes) {
      if (!grouped[n.local_date]) grouped[n.local_date] = [];
      grouped[n.local_date].push(n);
    }
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const lines = ['NOW NOTES', '─'.repeat(30), ''];
    for (const d of dates) {
      lines.push(d === today ? `Today — ${d}` : d);
      for (const n of grouped[d]) lines.push(`[${n.local_time}]  ${n.body}`);
      lines.push('');
    }
    navigator.clipboard.writeText(lines.join('\n').trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  // Group notes by local_date, newest date first
  const grouped = {};
  for (const n of notes) {
    if (!grouped[n.local_date]) grouped[n.local_date] = [];
    grouped[n.local_date].push(n);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={s.wrapper}>
      {/* Input area */}
      <div style={s.inputCard}>
        <div style={s.inputHeader}>
          <span style={s.inputLabel}>Capture a thought</span>
          <span style={s.inputHint}>Ctrl + Enter to lock</span>
        </div>
        <textarea
          ref={textareaRef}
          style={s.textarea}
          placeholder="An idea, a decision, something on your mind... once locked, it stays forever."
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
        />
        <button
          style={{ ...s.lockBtn, opacity: (!body.trim() || saving) ? 0.5 : 1 }}
          onClick={handleLock}
          disabled={!body.trim() || saving}
        >
          <span style={s.lockIcon}>🔒</span>
          {saving ? 'Locking...' : 'Lock it'}
        </button>
      </div>

      {/* Export */}
      {notes.length > 0 && (
        <button style={s.exportBtn} onClick={exportNotes}>
          {copied ? '✓ Copied' : `Export all (${notes.length})`}
        </button>
      )}

      {/* Notes feed */}
      {loading ? (
        <div style={s.loading}>Loading...</div>
      ) : notes.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyLock}>🔒</div>
          <div style={s.emptyTitle}>Locked thoughts appear here</div>
          <div style={s.emptyHint}>Cannot be edited or deleted.</div>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} style={s.dateGroup}>
            <div style={s.dateSep}>
              <div style={s.dateLine} />
              <span style={s.dateText}>
                {date === today ? 'Today' : formatDate(date)}
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
        <div style={s.lockedBadge}>
          <span>🔒</span>
          <span style={s.lockedText}>locked</span>
        </div>
      </div>
      <p style={s.noteBody}>{note.body}</p>
    </div>
  );
}

function formatDate(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: 16,
    boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  inputHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
  },
  inputLabel: { fontSize: 12, fontWeight: 600, color: 'var(--ink2)' },
  inputHint: { fontSize: 10, color: 'var(--ink3)' },
  textarea: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink)',
    padding: '11px 13px',
    fontSize: 14,
    lineHeight: 1.6,
    resize: 'none',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  },
  lockBtn: {
    background: 'var(--ink)',
    color: 'var(--surface)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '11px',
    fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    transition: 'opacity 0.15s',
  },
  lockIcon: { fontSize: 14 },
  exportBtn: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--ink2)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 14px',
    fontSize: 12, fontWeight: 500,
    boxShadow: 'var(--shadow)',
    alignSelf: 'flex-start',
    transition: 'all 0.15s',
  },
  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '24px 0' },
  empty: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '40px 20px',
    textAlign: 'center',
    boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  emptyLock: { fontSize: 32, opacity: 0.3 },
  emptyTitle: { fontSize: 14, fontWeight: 600, color: 'var(--ink2)' },
  emptyHint: { fontSize: 12, color: 'var(--ink3)' },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  dateSep: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  dateLine: { flex: 1, height: 1, background: 'var(--border)' },
  dateText: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--ink3)', whiteSpace: 'nowrap',
  },
  dateCount: {
    fontSize: 10, fontWeight: 600, color: 'var(--surface)',
    background: 'var(--ink3)', borderRadius: 100,
    padding: '1px 6px', minWidth: 18, textAlign: 'center',
  },
  noteCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  noteTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  noteTime: {
    fontSize: 11, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace", fontWeight: 500,
  },
  lockedBadge: {
    display: 'flex', alignItems: 'center', gap: 3,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 100, padding: '2px 8px',
  },
  lockedText: { fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--ink3)', textTransform: 'uppercase' },
  noteBody: {
    fontSize: 14, color: 'var(--ink)', lineHeight: 1.65,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
};

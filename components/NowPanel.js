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
function fmtDateFull(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function NowPanel() {
  const [notes,   setNotes]   = useState([]);
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState(false);
  const ref = useRef(null);
  const today = localNow().local_date;

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
    } catch { alert('Failed to save.'); }
    finally { setSaving(false); }
  }

  function exportAll() {
    const lines = ['MY NOTES', '─'.repeat(30)];
    [...notes].reverse().forEach(n => {
      lines.push('', `${n.local_date}  ${n.local_time}`, n.body);
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const grouped = {};
  notes.forEach(n => { if (!grouped[n.local_date]) grouped[n.local_date] = []; grouped[n.local_date].push(n); });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const bodyLen = body.trim().length;

  return (
    <div style={s.wrap}>

      {/* compose */}
      <div style={s.composeCard}>
        <div style={s.composeHeader}>
          <span style={s.composeTitle}>Capture a thought</span>
          {notes.length > 0 && (
            <button style={s.exportBtn} onClick={exportAll}>
              {copied ? '✓ Copied' : `Export (${notes.length})`}
            </button>
          )}
        </div>
        <textarea
          ref={ref}
          style={s.textarea}
          placeholder="Write something…"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && lock()}
          rows={4}
        />
        <div style={s.composeFooter}>
          <span style={s.hint}>{bodyLen > 0 ? `${bodyLen} chars · ` : ''}Ctrl+Enter to save</span>
          <button
            style={{
              ...s.lockBtn,
              background:  bodyLen > 0 && !saving ? 'var(--ink)' : 'var(--ink4)',
              color: bodyLen > 0 && !saving ? '#fff' : 'var(--ink3)',
            }}
            onClick={lock}
            disabled={!bodyLen || saving}
          >
            {saving ? 'Saving…' : 'Lock it'}
          </button>
        </div>
      </div>

      {/* feed */}
      {loading ? (
        <div style={s.loading}>Loading…</div>
      ) : notes.length === 0 ? (
        <div style={s.empty}>
          <span style={s.emptyTxt}>No locked thoughts yet</span>
        </div>
      ) : (
        <div style={s.feed}>
          {dates.map(date => (
            <div key={date} style={s.group}>
              <div style={s.dateRow}>
                <div style={s.dateLine} />
                <span style={s.dateLbl}>
                  {date === today ? 'Today' : fmtDateFull(date)}
                </span>
                <div style={s.dateLine} />
              </div>
              {grouped[date].map(note => (
                <div key={note.id} style={s.noteCard}>
                  <div style={s.noteHeader}>
                    <span style={s.noteTime}>{note.local_time}</span>
                    <span style={s.lockedBadge}>locked</span>
                  </div>
                  <p style={s.noteBody}>{note.body}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },

  composeCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  composeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  composeTitle: { fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
  exportBtn: {
    fontSize: 11, color: 'var(--ink2)',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-pill)',
    padding: '4px 12px',
  },
  textarea: {
    width: '100%',
    background: 'var(--bg)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px',
    fontSize: 14,
    color: 'var(--ink)',
    lineHeight: 1.65,
    resize: 'vertical',
    minHeight: 90,
    fontFamily: "'DM Sans', sans-serif",
  },
  composeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 11, color: 'var(--ink3)' },
  lockBtn: {
    padding: '9px 20px',
    borderRadius: 'var(--r-sm)',
    fontSize: 13, fontWeight: 600,
    border: 'none', transition: 'all 0.15s',
  },

  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '40px 0' },
  empty: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '36px 20px',
    textAlign: 'center',
  },
  emptyTxt: { fontSize: 13, color: 'var(--ink3)' },

  feed: { display: 'flex', flexDirection: 'column', gap: 10 },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  dateRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dateLine: { flex: 1, height: 1, background: 'var(--border)' },
  dateLbl: { fontSize: 11, color: 'var(--ink2)', fontWeight: 500, whiteSpace: 'nowrap' },

  noteCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  noteHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  noteTime: { fontSize: 11, color: 'var(--ink2)', fontWeight: 500 },
  lockedBadge: {
    fontSize: 10, color: 'var(--ink3)',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-pill)',
    padding: '2px 9px',
    letterSpacing: '0.04em',
  },
  noteBody: {
    fontSize: 14, color: 'var(--ink)', lineHeight: 1.65,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
};

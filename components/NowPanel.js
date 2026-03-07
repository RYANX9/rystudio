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
  }).toUpperCase();
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
      lines.push('', d === today ? `TODAY — ${d}` : d);
      grouped[d].forEach(n => lines.push(`[${n.local_time}]  ${n.body}`));
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

      {/* compose card — terminal feel */}
      <div style={s.composeCard}>
        <div style={s.composeHeader}>
          <div style={s.composeHeaderLeft}>
            <div style={s.composeTitle}>CAPTURE</div>
            <div style={s.composeSub}>permanently locked on save</div>
          </div>
          {notes.length > 0 && (
            <button style={s.exportBtn} onClick={exportAll}>
              {copied ? '✓ COPIED' : `EXPORT (${notes.length})`}
            </button>
          )}
        </div>

        {/* terminal input area */}
        <div style={s.terminalWrap}>
          <span style={s.terminalPrompt}>›</span>
          <textarea
            ref={ref}
            style={s.terminal}
            placeholder="write something…"
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            rows={4}
          />
        </div>

        <div style={s.composeFooter}>
          <span style={s.hint}>
            {bodyLen > 0 ? `${bodyLen} chars · ` : ''}ctrl+enter to lock
          </span>
          <button
            style={{
              ...s.lockBtn,
              background:  bodyLen > 0 && !saving ? 'var(--or)' : 'var(--s3)',
              boxShadow:   bodyLen > 0 && !saving ? '0 0 16px var(--or-glow)' : 'none',
              borderColor: bodyLen > 0 && !saving ? 'var(--or)' : 'var(--border)',
            }}
            onClick={lock}
            disabled={!bodyLen || saving}
          >
            {saving ? 'LOCKING…' : 'LOCK IT'}
          </button>
        </div>
      </div>

      {/* notes feed */}
      {loading ? (
        <div style={s.loading}>loading…</div>
      ) : notes.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--ink3)" strokeWidth="1.5"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--ink3)" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={s.emptyTxt}>NO LOCKED THOUGHTS YET</div>
        </div>
      ) : (
        <div style={s.feed}>
          {dates.map(date => (
            <div key={date} style={s.group}>
              <div style={s.dateRow}>
                <div style={s.dateLine} />
                <span style={s.dateLabel}>{date === today ? 'TODAY' : fmtDate(date)}</span>
                <div style={s.dateLine} />
                <span style={s.dateBadge}>{grouped[date].length}</span>
              </div>
              {grouped[date].map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }) {
  return (
    <div style={s.noteCard}>
      <div style={s.noteHeader}>
        <span style={s.noteTime}>{note.local_time}</span>
        <div style={s.lockedBadge}>
          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
            <rect x="0.75" y="4.25" width="6.5" height="5.5" rx="1" stroke="var(--ink3)" strokeWidth="1.2"/>
            <path d="M2 4.25V3A2 2 0 016 3v1.25" stroke="var(--ink3)" strokeWidth="1.2"/>
          </svg>
          <span style={s.lockedTxt}>LOCKED</span>
        </div>
      </div>
      <p style={s.noteBody}>{note.body}</p>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },

  composeCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  composeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  composeHeaderLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  composeTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
  },
  composeSub: { fontSize: 11, color: 'var(--ink3)' },
  exportBtn: {
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    color: 'var(--ink3)',
    borderRadius: 'var(--r-pill)',
    padding: '5px 12px',
    fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
    fontFamily: "'DM Mono', monospace",
    flexShrink: 0,
  },

  terminalWrap: {
    display: 'flex',
    gap: 10,
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px',
    alignItems: 'flex-start',
  },
  terminalPrompt: {
    fontSize: 16, color: 'var(--or)', fontFamily: "'DM Mono', monospace",
    lineHeight: 1.4, flexShrink: 0, paddingTop: 2,
    textShadow: '0 0 8px var(--or)',
  },
  terminal: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--ink)',
    fontSize: 14,
    lineHeight: 1.65,
    resize: 'vertical',
    minHeight: 80,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 300,
  },

  composeFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  hint: {
    fontSize: 9, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em',
  },
  lockBtn: {
    color: '#fff', border: '1px solid',
    borderRadius: 'var(--r-xs)',
    padding: '9px 18px',
    fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
    fontFamily: "'DM Mono', monospace",
    transition: 'all 0.2s',
  },

  loading: {
    textAlign: 'center', color: 'var(--ink3)', fontSize: 10,
    padding: '24px 0', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },

  emptyCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '40px 24px',
    textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  emptyIcon: { opacity: 0.4 },
  emptyTxt: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace",
  },

  feed: { display: 'flex', flexDirection: 'column', gap: 10 },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  dateRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dateLine: { flex: 1, height: 1, background: 'var(--border)' },
  dateLabel: {
    fontSize: 8, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap',
  },
  dateBadge: {
    background: 'var(--s3)',
    color: 'var(--ink2)',
    fontSize: 8, fontWeight: 700,
    borderRadius: 'var(--r-pill)', padding: '2px 8px',
    fontFamily: "'DM Mono', monospace",
  },

  noteCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  noteHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  noteTime: {
    fontSize: 10, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace", fontWeight: 500,
  },
  lockedBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'var(--s2)',
    border: '1px solid var(--border-md)',
    borderRadius: 'var(--r-pill)',
    padding: '3px 8px',
  },
  lockedTxt: {
    fontSize: 7, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
  noteBody: {
    fontSize: 14, color: 'var(--ink)', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    fontFamily: "'DM Mono', monospace", fontWeight: 300,
  },
};

'use client';
import { useState, useEffect, useRef } from 'react';

const DEFAULTS = [
  'Block 1 — microcontroller study (13:05 → 16:00)',
  'Block 2 — electronics / signal (17:00 → 18:20)',
  'Block 3 — night session (22:30 → 01:00)',
  'Read Quran after Fajr',
];

function todayStr() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const RAIL_COLORS = [
  'var(--or)', 'var(--study)', 'var(--pray)', 'var(--sleep)', 'var(--food)', 'var(--waste)',
];

export default function TodoPanel({ date }) {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoad]    = useState(true);
  const [input,   setInput]   = useState('');
  const [adding,  setAdding]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { load(date); }, [date]);

  async function load(d) {
    setLoad(true);
    try {
      const res  = await fetch(`/api/todos?date=${d}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length === 0 && d === todayStr()) {
        const seeded = await Promise.all(
          DEFAULTS.map((text, i) =>
            fetch('/api/todos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: d, text, position: i }),
            }).then(r => r.json())
          )
        );
        setTodos(seeded.filter(t => t?.id));
      } else {
        setTodos(Array.isArray(data) ? data : []);
      }
    } catch { setTodos([]); } finally { setLoad(false); }
  }

  async function addTask() {
    const text = input.trim();
    if (!text) return;
    setAdding(true);
    try {
      const res  = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, text, position: -1 }),
      });
      const todo = await res.json();
      if (todo?.id) { setTodos(prev => [todo, ...prev]); setInput(''); inputRef.current?.focus(); }
    } finally { setAdding(false); }
  }

  async function toggle(todo) {
    const updated = { ...todo, done: !todo.done };
    setTodos(prev => prev.map(t => t.id === todo.id ? updated : t));
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id, done: updated.done }),
    });
  }

  async function remove(id) {
    await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  const pending = todos.filter(t => !t.done);
  const done    = todos.filter(t => t.done);
  const pct     = todos.length ? Math.round((done.length / todos.length) * 100) : 0;
  const arcColor = pct === 100 ? 'var(--study)' : 'var(--or)';

  if (loading) return <div style={s.loading}>loading tasks…</div>;

  return (
    <div style={s.wrap}>

      {/* ── score readout ── */}
      <div style={s.scoreCard}>
        <div style={s.scoreLeft}>
          <div style={s.scoreLine}>
            <span style={{ ...s.scoreNum, color: pct === 100 ? 'var(--study)' : 'var(--ink)' }}>
              {done.length}
            </span>
            <span style={s.scoreSlash}>/</span>
            <span style={s.scoreTotal}>{todos.length}</span>
          </div>
          <div style={s.scoreLabel}>TASKS DONE</div>

          {/* segmented progress */}
          <div style={s.segments}>
            {todos.map((t, i) => (
              <div key={t.id} style={{
                ...s.segment,
                background: t.done ? arcColor : 'var(--s3)',
                boxShadow:  t.done && pct === 100 ? `0 0 4px ${arcColor}` : 'none',
              }} />
            ))}
          </div>
        </div>

        <div style={s.pctDisplay}>
          <span style={{ ...s.pctNum, color: arcColor }}>{pct}</span>
          <span style={s.pctSign}>%</span>
        </div>
      </div>

      {/* ── add task ── */}
      <div style={s.addRow}>
        <input
          ref={inputRef}
          style={s.addInput}
          placeholder="add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button
          style={{
            ...s.addBtn,
            background:  input.trim() ? 'var(--or)' : 'var(--s3)',
            boxShadow:   input.trim() ? '0 0 12px var(--or-glow)' : 'none',
          }}
          onClick={addTask}
          disabled={adding || !input.trim()}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── pending ── */}
      {pending.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionLabel}>PENDING</span>
            <span style={s.sectionCount}>{pending.length}</span>
          </div>
          {pending.map((todo, i) => (
            <TaskRow
              key={todo.id}
              todo={todo}
              color={RAIL_COLORS[i % RAIL_COLORS.length]}
              onToggle={toggle}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      {/* ── done ── */}
      {done.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionLabel}>COMPLETED</span>
            <span style={{ ...s.sectionCount, color: 'var(--study)', background: 'var(--study-dim)' }}>
              {done.length}
            </span>
          </div>
          {done.map(todo => (
            <TaskRow key={todo.id} todo={todo} color="var(--ink4)" onToggle={toggle} onRemove={remove} done />
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div style={s.empty}>no tasks for this day</div>
      )}
    </div>
  );
}

function TaskRow({ todo, color, onToggle, onRemove, done }) {
  return (
    <div style={{ ...s.row, opacity: done ? 0.5 : 1 }}>
      <div style={{ ...s.rowRail, background: color, boxShadow: !done ? `0 0 6px ${color}40` : 'none' }} />
      <button
        style={{
          ...s.checkbox,
          borderColor: done ? 'var(--study)'   : color,
          background:  done ? 'var(--study)'   : 'transparent',
        }}
        onClick={() => onToggle(todo)}
      >
        {done && (
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <path d="M1 3.5l2 2L7 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span style={{
        ...s.rowText,
        textDecoration: done ? 'line-through' : 'none',
        color:          done ? 'var(--ink3)'  : 'var(--ink)',
      }}>
        {todo.text}
      </span>
      <button style={s.removeBtn} onClick={() => onRemove(todo.id)}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: {
    textAlign: 'center', color: 'var(--ink3)', fontSize: 10,
    padding: '40px 0', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },

  scoreCard: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  scoreLeft: { display: 'flex', flexDirection: 'column', gap: 8 },
  scoreLine: { display: 'flex', alignItems: 'baseline', gap: 4 },
  scoreNum: {
    fontSize: 48, fontWeight: 300, lineHeight: 1,
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.05em',
    transition: 'color 0.3s',
  },
  scoreSlash: { fontSize: 24, color: 'var(--ink4)', fontFamily: "'DM Mono', monospace" },
  scoreTotal: {
    fontSize: 24, color: 'var(--ink3)', fontFamily: "'DM Mono', monospace",
    fontWeight: 300,
  },
  scoreLabel: {
    fontSize: 8, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
  },
  segments: { display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 200 },
  segment: {
    width: 14, height: 4,
    borderRadius: 2,
    transition: 'background 0.2s, box-shadow 0.2s',
  },

  pctDisplay: { display: 'flex', alignItems: 'flex-start' },
  pctNum: {
    fontSize: 64, fontWeight: 300, lineHeight: 0.9,
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.06em',
    transition: 'color 0.3s',
  },
  pctSign: {
    fontSize: 20, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
    marginTop: 8,
  },

  addRow: {
    display: 'flex',
    gap: 8,
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '8px 8px 8px 16px',
    alignItems: 'center',
  },
  addInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: 'var(--ink)', fontSize: 14, fontWeight: 400,
  },
  addBtn: {
    width: 36, height: 36,
    borderRadius: 'var(--r-xs)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, border: 'none',
    transition: 'all 0.2s',
  },

  section: { display: 'flex', flexDirection: 'column', gap: 6 },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2px',
  },
  sectionLabel: {
    fontSize: 8, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.14em', fontFamily: "'DM Mono', monospace",
  },
  sectionCount: {
    fontSize: 9, fontWeight: 700,
    color: 'var(--or)', background: 'var(--or-dim)',
    borderRadius: 'var(--r-pill)', padding: '2px 8px',
    fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em',
  },

  row: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px 12px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    position: 'relative', overflow: 'hidden',
    transition: 'opacity 0.2s',
  },
  rowRail: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, transition: 'box-shadow 0.2s',
  },
  checkbox: {
    width: 20, height: 20,
    border: '1.5px solid',
    borderRadius: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  rowText: {
    flex: 1, fontSize: 13, lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  removeBtn: {
    color: 'var(--ink4)', padding: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  empty: {
    textAlign: 'center', color: 'var(--ink3)', fontSize: 10,
    padding: '24px 0', letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
  },
};

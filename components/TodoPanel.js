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

const DOT_COLORS = ['var(--orange)', 'var(--study-c)', 'var(--pray-c)', 'var(--sleep-c)', 'var(--food-c)', 'var(--waste-c)'];

export default function TodoPanel({ date }) {
  const [todos, setTodos]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [input, setInput]   = useState('');
  const [adding, setAdding] = useState(false);
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

  async function addTask(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setAdding(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, text, position: -1 }),
      });
      const todo = await res.json();
      if (todo?.id) {
        setTodos(prev => [todo, ...prev]); // add at TOP
        setInput('');
        inputRef.current?.focus();
      }
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

  if (loading) return <div style={s.loading}>Loading tasks…</div>;

  return (
    <div style={s.wrap}>

      {/* ── score card ── */}
      <div style={s.scoreCard}>
        <div style={s.scoreDark}>
          <span style={s.scoreBig}>{done.length}</span>
          <span style={s.scoreOf}> / {todos.length}</span>
          <span style={s.scoreLbl}>tasks done</span>
        </div>
        <div style={s.scoreLight}>
          <div style={s.scoreTrack}>
            <div style={{
              ...s.scoreFill,
              width: `${pct}%`,
              background: pct === 100 ? 'var(--study-c)' : 'var(--orange)',
            }} />
          </div>
          <span style={s.scorePct}>{pct}%</span>
        </div>
      </div>

      {/* ── add input at the TOP ── */}
      <div style={s.addCard}>
        <input
          ref={inputRef}
          style={s.addInput}
          placeholder="Add a new task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button
          style={{
            ...s.addBtn,
            background: input.trim() ? 'var(--dark)' : 'var(--ink4)',
          }}
          onClick={addTask}
          disabled={adding || !input.trim()}
        >
          +
        </button>
      </div>

      {/* ── pending ── */}
      {pending.length > 0 && (
        <div style={s.section}>
          {pending.map((todo, i) => (
            <TodoItem key={todo.id} todo={todo} color={DOT_COLORS[i % DOT_COLORS.length]} onToggle={toggle} onRemove={remove} />
          ))}
        </div>
      )}

      {/* ── done ── */}
      {done.length > 0 && (
        <>
          <div style={s.sectionHead}>
            <div style={s.headLine} />
            <span style={s.headLabel}>Completed ({done.length})</span>
            <div style={s.headLine} />
          </div>
          <div style={s.section}>
            {done.map((todo, i) => (
              <TodoItem key={todo.id} todo={todo} color="var(--ink4)" onToggle={toggle} onRemove={remove} done />
            ))}
          </div>
        </>
      )}

      {todos.length === 0 && (
        <div style={s.empty}>No tasks for this day</div>
      )}
    </div>
  );
}

function TodoItem({ todo, color, onToggle, onRemove, done }) {
  return (
    <div style={{ ...s.item, opacity: done ? 0.6 : 1 }}>
      <div style={{ ...s.itemAccent, background: color }} />
      <button
        style={{
          ...s.checkbox,
          background: done ? 'var(--study-c)' : 'transparent',
          borderColor: done ? 'var(--study-c)' : 'var(--ink4)',
        }}
        onClick={() => onToggle(todo)}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span style={{
        ...s.itemText,
        textDecoration: done ? 'line-through' : 'none',
        color: done ? 'var(--ink3)' : 'var(--ink)',
      }}>
        {todo.text}
      </span>
      <button style={s.removeBtn} onClick={() => onRemove(todo.id)}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '32px 0' },

  scoreCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
    boxShadow: 'var(--sh)',
  },
  scoreDark: {
    background: 'var(--dark)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreBig: {
    fontSize: 36, fontWeight: 800, color: '#fff',
    fontFamily: "'DM Mono',monospace", letterSpacing: '-0.03em',
  },
  scoreOf: {
    fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.35)',
    fontFamily: "'DM Mono',monospace",
  },
  scoreLbl: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    fontWeight: 400, marginLeft: 8,
  },
  scoreLight: {
    padding: '12px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  scoreTrack: {
    flex: 1, height: 6,
    background: 'var(--bg2)',
    borderRadius: 'var(--r-pill)',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 'var(--r-pill)',
    transition: 'width 0.5s ease',
  },
  scorePct: {
    fontSize: 14, fontWeight: 700, color: 'var(--ink2)',
    fontFamily: "'DM Mono',monospace",
    minWidth: 36, textAlign: 'right',
  },

  addCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '10px 12px 10px 20px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: 'var(--sh)',
    border: '1.5px solid transparent',
  },
  addInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--ink)',
    fontSize: 15,
    fontWeight: 500,
  },
  addBtn: {
    width: 38, height: 38,
    borderRadius: 'var(--r-sm)',
    color: '#fff',
    fontSize: 22, fontWeight: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
    lineHeight: 1,
    paddingBottom: 2,
  },

  section: { display: 'flex', flexDirection: 'column', gap: 7 },

  sectionHead: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginTop: 4,
  },
  headLine: { flex: 1, height: 1, background: 'var(--ink4)' },
  headLabel: {
    fontSize: 11, fontWeight: 600, color: 'var(--ink3)',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  item: {
    background: 'var(--surface)',
    borderRadius: 'var(--r-sm)',
    padding: '13px 14px 13px 20px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: 'var(--sh)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'opacity 0.2s',
  },
  itemAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, borderRadius: '0 4px 4px 0',
  },
  checkbox: {
    width: 24, height: 24,
    border: '2px solid',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  itemText: {
    flex: 1,
    fontSize: 14, lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  removeBtn: {
    color: 'var(--ink4)', padding: 4, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  empty: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '20px 0' },
};

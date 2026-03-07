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
      if (todo?.id) { setTodos(prev => [...prev, todo]); setInput(''); inputRef.current?.focus(); }
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

  const done    = todos.filter(t => t.done);
  const pending = todos.filter(t => !t.done);
  const pct     = todos.length ? Math.round((done.length / todos.length) * 100) : 0;

  if (loading) return <div style={s.loading}>Loading tasks…</div>;

  return (
    <div style={s.wrap}>

      {/* score card */}
      <div style={s.scoreCard}>
        <div style={s.scoreLeft}>
          <div style={s.scoreLine}>
            <span style={s.scoreBig}>{done.length}</span>
            <span style={s.scoreSlash}>/</span>
            <span style={s.scoreOf}>{todos.length}</span>
            <span style={s.scoreLbl}>tasks done</span>
          </div>
          <div style={s.progTrack}>
            <div style={{
              ...s.progFill,
              width: `${pct}%`,
              background: pct === 100 ? 'var(--study)' : 'var(--ink)',
            }} />
          </div>
        </div>
        <span style={{
          ...s.pctBig,
          color: pct === 100 ? 'var(--study)' : 'var(--ink2)',
        }}>
          {pct}%
        </span>
      </div>

      {/* add input */}
      <div style={s.addCard}>
        <input
          ref={inputRef}
          style={s.addInput}
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button
          style={{
            ...s.addBtn,
            background: input.trim() ? 'var(--ink)' : 'var(--ink4)',
            color: input.trim() ? '#fff' : 'var(--ink3)',
          }}
          onClick={addTask}
          disabled={adding || !input.trim()}
        >
          Add
        </button>
      </div>

      {/* pending */}
      {pending.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLbl}>To do · {pending.length}</div>
          <div style={s.taskList}>
            {pending.map((todo, i) => (
              <TaskRow key={todo.id} todo={todo} isLast={i === pending.length - 1}
                onToggle={toggle} onRemove={remove} />
            ))}
          </div>
        </div>
      )}

      {/* done */}
      {done.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLbl}>Done · {done.length}</div>
          <div style={s.taskList}>
            {done.map((todo, i) => (
              <TaskRow key={todo.id} todo={todo} isLast={i === done.length - 1}
                onToggle={toggle} onRemove={remove} />
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div style={s.emptyMsg}>No tasks for this day</div>
      )}
    </div>
  );
}

function TaskRow({ todo, isLast, onToggle, onRemove }) {
  return (
    <div style={{
      ...s.taskRow,
      borderBottom: isLast ? 'none' : '1px solid var(--border2)',
      opacity: todo.done ? 0.5 : 1,
    }}>
      <button
        style={{
          ...s.checkbox,
          borderColor:  todo.done ? 'var(--study)' : 'var(--border)',
          background:   todo.done ? 'var(--study)' : 'transparent',
        }}
        onClick={() => onToggle(todo)}
      >
        {todo.done && (
          <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
            <path d="M1 4l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span style={{
        ...s.taskText,
        textDecoration: todo.done ? 'line-through' : 'none',
        color: todo.done ? 'var(--ink3)' : 'var(--ink)',
      }}>
        {todo.text}
      </span>
      <button style={s.removeBtn} onClick={() => onRemove(todo.id)}>×</button>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '40px 0' },

  scoreCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: { display: 'flex', flexDirection: 'column', gap: 10, flex: 1, paddingRight: 16 },
  scoreLine: { display: 'flex', alignItems: 'baseline', gap: 5 },
  scoreBig: {
    fontFamily: "'Lora', serif",
    fontSize: 42, fontWeight: 500, color: 'var(--ink)', lineHeight: 1,
  },
  scoreSlash: { fontSize: 22, color: 'var(--ink4)', fontFamily: "'Lora', serif" },
  scoreOf: { fontSize: 22, color: 'var(--ink3)', fontFamily: "'Lora', serif" },
  scoreLbl: { fontSize: 12, color: 'var(--ink2)', marginLeft: 4 },
  progTrack: { height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease, background 0.3s' },
  pctBig: {
    fontFamily: "'Lora', serif",
    fontSize: 36, fontWeight: 400, lineHeight: 1,
    transition: 'color 0.3s',
  },

  addCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '8px 8px 8px 16px',
    display: 'flex', gap: 8, alignItems: 'center',
  },
  addInput: {
    flex: 1, background: 'transparent', border: 'none',
    fontSize: 14, color: 'var(--ink)',
  },
  addBtn: {
    padding: '9px 18px',
    borderRadius: 'var(--r-sm)',
    fontSize: 13, fontWeight: 600,
    border: 'none', transition: 'all 0.15s',
    flexShrink: 0,
  },

  section: { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionLbl: {
    fontSize: 10, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    paddingLeft: 4,
  },
  taskList: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
  },
  taskRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 14px',
    transition: 'opacity 0.2s',
  },
  checkbox: {
    width: 20, height: 20,
    border: '1.5px solid',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  taskText: { flex: 1, fontSize: 14, lineHeight: 1.4, transition: 'all 0.15s' },
  removeBtn: { fontSize: 18, color: 'var(--ink4)', padding: '2px 4px', lineHeight: 1 },
  emptyMsg: { textAlign: 'center', fontSize: 13, color: 'var(--ink3)', padding: '24px 0' },
};

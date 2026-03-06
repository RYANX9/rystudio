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

const ACCENT_COLORS = [
  'var(--orange)',
  'var(--study-c)',
  'var(--pray-c)',
  'var(--sleep-c)',
  'var(--food-c)',
  'var(--waste-c)',
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
    } catch { setTodos([]); }
    finally  { setLoad(false); }
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

  if (loading) return <div style={s.loading}>Loading tasks…</div>;

  return (
    <div style={s.wrap}>

      {/* score card: dark/light split matching reference card style */}
      <div style={s.scoreCard}>
        <div style={s.scoreDark}>
          <div style={s.scoreLeft}>
            <div style={s.scoreBolt}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8 1.5L3 8h4.5L6 12.5l5-6.5H7L8 1.5z" fill="var(--orange)"/>
              </svg>
            </div>
            <div>
              <div style={s.scoreNumRow}>
                <span style={s.scoreBig}>{done.length}</span>
                <span style={s.scoreOf}>/{todos.length}</span>
              </div>
              <div style={s.scoreSub}>tasks completed</div>
            </div>
          </div>
          <div style={{ ...s.scorePctBadge, background: pct === 100 ? 'rgba(42,122,80,0.25)' : 'rgba(232,98,42,0.2)' }}>
            <span style={{ ...s.scorePctNum, color: pct === 100 ? 'var(--study-c)' : 'var(--orange)' }}>
              {pct}%
            </span>
          </div>
        </div>
        <div style={s.scoreLight}>
          <div style={s.progressTrack}>
            <div style={{
              ...s.progressFill,
              width: `${pct}%`,
              background: pct === 100 ? 'var(--study-c)' : 'var(--orange)',
            }} />
          </div>
        </div>
      </div>

      {/* add task input */}
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
            background: input.trim() ? 'var(--dark)' : 'var(--ink4)',
          }}
          onClick={addTask}
          disabled={adding || !input.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* pending tasks */}
      {pending.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionLabel}>Pending</span>
            <span style={s.sectionCount}>{pending.length}</span>
          </div>
          <div style={s.taskList}>
            {pending.map((todo, i) => (
              <TaskItem
                key={todo.id}
                todo={todo}
                color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                onToggle={toggle}
                onRemove={remove}
              />
            ))}
          </div>
        </div>
      )}

      {/* done tasks */}
      {done.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionLabel}>Completed</span>
            <span style={{ ...s.sectionCount, background: 'var(--study-bg)', color: 'var(--study-c)' }}>
              {done.length}
            </span>
          </div>
          <div style={s.taskList}>
            {done.map(todo => (
              <TaskItem
                key={todo.id}
                todo={todo}
                color="var(--ink4)"
                onToggle={toggle}
                onRemove={remove}
                done
              />
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div style={s.empty}>No tasks for this day</div>
      )}
    </div>
  );
}

function TaskItem({ todo, color, onToggle, onRemove, done }) {
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
            <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  scoreBolt: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'rgba(232,98,42,0.15)',
    border: '1.5px solid rgba(232,98,42,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  scoreNumRow: { display: 'flex', alignItems: 'baseline', gap: 3 },
  scoreBig: {
    fontSize: 30, fontWeight: 800, color: '#fff',
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.03em',
  },
  scoreOf: {
    fontSize: 18, fontWeight: 400,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: "'DM Mono', monospace",
  },
  scoreSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  scorePctBadge: {
    borderRadius: 'var(--r-pill)',
    padding: '5px 12px',
  },
  scorePctNum: {
    fontSize: 14, fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  scoreLight: { padding: '12px 20px' },
  progressTrack: {
    height: 5,
    background: 'var(--bg2)',
    borderRadius: 'var(--r-pill)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 'var(--r-pill)',
    transition: 'width 0.5s ease',
  },

  addCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '10px 10px 10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: 'var(--sh)',
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  },

  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: 'var(--ink3)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  sectionCount: {
    background: 'var(--orange-bg)',
    color: 'var(--orange)',
    fontSize: 10, fontWeight: 700,
    borderRadius: 'var(--r-pill)',
    padding: '3px 10px',
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: 7 },

  item: {
    background: 'var(--surface)',
    borderRadius: 'var(--r-sm)',
    padding: '13px 14px 13px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: 'var(--sh)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'opacity 0.2s',
  },
  itemAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4,
  },
  checkbox: {
    width: 22, height: 22,
    border: '2px solid',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  itemText: { flex: 1, fontSize: 14, lineHeight: 1.4, transition: 'all 0.15s' },
  removeBtn: {
    color: 'var(--ink4)', padding: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  empty: { textAlign: 'center', color: 'var(--ink3)', fontSize: 13, padding: '24px 0' },
};

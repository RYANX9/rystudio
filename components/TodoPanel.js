'use client';
import { useState, useEffect } from 'react';

const DEFAULT_TASKS = [
  { text: 'Block 1 — microcontroller study (13:05–16:00)', position: 0 },
  { text: 'Block 2 — electronics / signal processing (17:00–18:20)', position: 1 },
  { text: 'Block 3 — night session (22:30–01:00)', position: 2 },
  { text: 'Read Quran after Fajr', position: 3 },
  { text: 'Daily note — what did I cover today?', position: 4 },
];

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function TodoPanel({ date }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    load(date);
  }, [date]);

  async function load(d) {
    setLoading(true);
    try {
      const res = await fetch(`/api/todos?date=${d}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length === 0 && d === todayStr()) {
        const seeded = await Promise.all(
          DEFAULT_TASKS.map((t) =>
            fetch('/api/todos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: d, text: t.text, position: t.position }),
            }).then((r) => r.json())
          )
        );
        setTodos(seeded.filter((t) => t.id));
      } else {
        setTodos(Array.isArray(data) ? data : []);
      }
    } catch (_) {
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(todo) {
    const next = { ...todo, done: !todo.done };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? next : t)));
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id, done: next.done }),
    });
  }

  async function addTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, text: input.trim(), position: todos.length }),
      });
      const todo = await res.json();
      if (todo.id) {
        setTodos((prev) => [...prev, todo]);
        setInput('');
      }
    } finally {
      setAdding(false);
    }
  }

  async function remove(id) {
    await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const doneCount = todos.filter((t) => t.done).length;

  if (loading) return <div style={s.loading}>loading...</div>;

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.label}>tasks</span>
        <span style={s.count}>{doneCount}/{todos.length} done</span>
      </div>

      <div style={s.list}>
        {todos.length === 0 && <div style={s.empty}>no tasks — add one below</div>}
        {todos.map((todo) => (
          <div key={todo.id} style={s.item}>
            <button
              style={{
                ...s.checkbox,
                background: todo.done ? '#1a1a1a' : '#f5f5f0',
                borderColor: todo.done ? '#1a1a1a' : '#ccc',
              }}
              onClick={() => toggle(todo)}
            >
              {todo.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5L4 7.5L8.5 2.5"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span
              style={{
                ...s.text,
                textDecoration: todo.done ? 'line-through' : 'none',
                color: todo.done ? '#bbb' : '#1a1a1a',
              }}
            >
              {todo.text}
            </span>
            <button style={s.del} onClick={() => remove(todo.id)}>×</button>
          </div>
        ))}
      </div>

      <form onSubmit={addTask} style={s.form}>
        <input
          style={s.input}
          placeholder="add task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" style={s.addBtn} disabled={adding || !input.trim()}>
          {adding ? '...' : '+'}
        </button>
      </form>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontSize: '11px', fontWeight: '700', color: '#aaa',
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  count: { fontSize: '11px', fontWeight: '700', color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 14px', background: '#fff',
    border: '1px solid #e0dfd8', borderRadius: '10px',
  },
  checkbox: {
    width: '22px', height: '22px', border: '2px solid',
    borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', padding: 0,
  },
  text: { flex: 1, fontSize: '14px', lineHeight: 1.4, transition: 'color 0.15s' },
  del: {
    background: 'none', border: 'none', color: '#ddd',
    fontSize: '20px', cursor: 'pointer', padding: '0 2px',
    lineHeight: 1, flexShrink: 0,
  },
  form: { display: 'flex', gap: '8px' },
  input: {
    flex: 1, background: '#fff', border: '1px solid #e0dfd8',
    color: '#1a1a1a', padding: '11px 13px', fontSize: '14px',
    fontFamily: "'Cairo', sans-serif", outline: 'none', borderRadius: '10px',
  },
  addBtn: {
    background: '#1a1a1a', border: 'none', color: '#fff',
    fontSize: '22px', width: '44px', cursor: 'pointer',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, paddingBottom: '2px',
  },
  loading: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '24px 0' },
  empty: { fontSize: '13px', color: '#bbb', padding: '20px 0', textAlign: 'center' },
};

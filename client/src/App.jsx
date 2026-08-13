import React, { useEffect, useState } from 'react';

// A small task manager frontend that talks to the Express/MongoDB
// backend at /api/tasks. In dev, Vite proxies /api to the backend
// (see vite.config.js); in production, this same origin is served
// directly by the Express app on Azure (see server/app.js).

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    setTasks(await res.json());
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error || 'Failed to add task');
      return;
    }
    setTitle('');
    loadTasks();
  }

  async function toggleTask(task) {
    await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    });
    loadTasks();
  }

  async function deleteTask(task) {
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    loadTasks();
  }

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '2rem auto' }}>
      <h1>Azure MERN Task Manager</h1>
      <p>
        A minimal MERN app (MongoDB + Express + React + Node) built for the
        checkpoint: hosting a MERN app on Microsoft Azure.
      </p>

      <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <input type="checkbox" checked={task.done} onChange={() => toggleTask(task)} />
            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task)}>Delete</button>
          </li>
        ))}
        {tasks.length === 0 && <p>No tasks yet - add one above.</p>}
      </ul>
    </main>
  );
}

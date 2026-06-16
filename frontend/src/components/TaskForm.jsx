import { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, onClose, initial, tasks = [] }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'todo',
  });

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (isExactDuplicate) return;
    onSubmit(form);
  };

  const today = new Date().toISOString().split('T')[0];
  const isBackdating = form.due_date && form.due_date < today;

  const normalize = (str) => (str || '').trim().toLowerCase();

  const isExactDuplicate = !initial && tasks.some(t =>
    normalize(t.title) === normalize(form.title) &&
    normalize(t.description) === normalize(form.description) &&
    t.priority === form.priority &&
    (t.due_date || '').slice(0, 10) === (form.due_date || '').slice(0, 10)
  );

  const isTitleDuplicate = !initial && !isExactDuplicate && tasks.some(
    t => normalize(t.title) === normalize(form.title)
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initial ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          {isExactDuplicate && (
            <p className="backdate-warning" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
              🚫 This exact task already exists. Change at least one field to continue.
            </p>
          )}
          {isTitleDuplicate && (
            <p className="backdate-warning">
              ⚠️ A task with this title already exists.
            </p>
          )}
          <textarea
            placeholder="Description (optional)"
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value })}
          >
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
          {initial && (
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          <input
            type="date"
            value={form.due_date || ''}
            onChange={e => setForm({ ...form, due_date: e.target.value })}
          />
          {isBackdating && !initial && (
            <p className="backdate-warning">
              ⚠️ This date is in the past. Task will be marked as <strong>Backdated</strong>.
            </p>
          )}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isExactDuplicate}>
              {initial ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
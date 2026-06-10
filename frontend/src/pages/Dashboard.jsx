import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import api from '../services/api';
import { requestPermission, checkDueTasks } from '../utils/notifications';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', {
        params: { search, priority: filterPriority, status: filterStatus },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filterPriority, filterStatus]);

  const handleCreate = async (form) => {
    await api.post('/tasks', form);
    setShowForm(false);
    fetchTasks();
    toast.success('Task created!');
  };

  const handleUpdate = async (form) => {
    await api.put(`/tasks/${editTask.id}`, form);
    setEditTask(null);
    fetchTasks();
    toast.success('Task updated!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
    toast.success('Task deleted!');
  };

  const handleToggle = async (id) => {
    await api.patch(`/tasks/${id}/status`);
    fetchTasks();
    toast.success('Status updated!');
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
  };
  
  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) checkDueTasks(tasks);
  }, [tasks]);

  return (
    <div className="dashboard">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="dashboard-content">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.high}</span>
            <span className="stat-label">High priority</span>
          </div>
        </div>

        <div className="controls">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Task
          </button>
        </div>

        {loading ? (
          <p className="empty-msg">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-msg">No tasks yet. Create your first task!</p>
        ) : (
          <div className="task-grid">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onEdit={setEditTask}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
      {editTask && (
        <TaskForm
          initial={editTask}
          onSubmit={handleUpdate}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
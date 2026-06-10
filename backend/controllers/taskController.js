const db = require('../config/db');

exports.getTasks = async (req, res) => {
  const { search, status, priority } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.user.id];

  if (status)   { query += ' AND status = ?';       params.push(status); }
  if (priority) { query += ' AND priority = ?';     params.push(priority); }
  if (search)   { query += ' AND title LIKE ?';     params.push(`%${search}%`); }

  query += ' ORDER BY FIELD(priority,"high","medium","low"), created_at DESC';

  try {
    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, priority || 'medium', due_date || null]
    );
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  try {
    await db.query(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=? WHERE id=? AND user_id=?',
      [title, description, status, priority, due_date || null, req.params.id, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT status FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });

    const newStatus = rows[0].status === 'completed' ? 'todo' : 'completed';
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ status: newStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
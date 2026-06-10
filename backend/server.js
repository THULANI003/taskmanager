const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');  
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

//  Limiters defined before use
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again later' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', generalLimiter, taskRoutes);

app.get('/', (req, res) => res.send('TaskManager API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
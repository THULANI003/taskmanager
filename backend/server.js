require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');  


const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.set('trust proxy', 1);

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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', generalLimiter, taskRoutes);

app.get('/', (req, res) => res.send('TaskManager API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import './env.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initDb, pool } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import bookingRoutes from './routes/bookings.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Backend on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('DB init failed:', e);
    process.exit(1);
  });
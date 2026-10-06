import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Create booking
router.post('/', requireAuth, async (req, res) => {
  const { event_id, seat_ids } = req.body;
  if (!event_id || !Array.isArray(seat_ids) || seat_ids.length === 0)
    return res.status(400).json({ error: 'Missing event_id or seat_ids' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const created = [];
    for (const seatId of seat_ids) {
      // Atomic claim — only succeeds if seat is still available
      const { rows } = await client.query(
        `UPDATE seats SET status='booked'
         WHERE id=$1 AND event_id=$2 AND status='available'
         RETURNING id`,
        [seatId, event_id]
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `Seat ${seatId} already taken` });
      }
      const { rows: bk } = await client.query(
        `INSERT INTO bookings (user_id, event_id, seat_id) VALUES ($1,$2,$3) RETURNING *`,
        [req.user.id, event_id, seatId]
      );
      created.push(bk[0]);
    }

    await client.query('COMMIT');
    res.json({ ok: true, bookings: created });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// My bookings
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT b.id, b.created_at, s.seat_number, e.title, e.event_date, e.venue
     FROM bookings b
     JOIN seats s ON s.id = b.seat_id
     JOIN events e ON e.id = b.event_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default router;
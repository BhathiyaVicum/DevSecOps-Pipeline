import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list events
router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*, 
      (SELECT COUNT(*) FROM seats s WHERE s.event_id = e.id AND s.status='available') AS available_seats,
      (SELECT COUNT(*) FROM seats s WHERE s.event_id = e.id) AS total_seats
     FROM events e
     ORDER BY e.event_date ASC`
  );
  res.json(rows);
});

// Public: single event + seats
router.get('/:id', async (req, res) => {
  const { rows: ev } = await pool.query('SELECT * FROM events WHERE id=$1', [req.params.id]);
  if (!ev[0]) return res.status(404).json({ error: 'Not found' });

  const { rows: seats } = await pool.query(
    'SELECT id, seat_number, status FROM seats WHERE event_id=$1 ORDER BY seat_number',
    [req.params.id]
  );

  res.json({ ...ev[0], seats });
});

// Admin: create event (auto-generates 50 seats)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, venue, event_date, price_cents, image_url } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO events (title, description, venue, event_date, price_cents, image_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, venue, event_date, price_cents, image_url, req.user.id]
    );
    const event = rows[0];

    // generate 50 seats: A1..A10, B1..B10, ... E10
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const values = [];
    for (const l of letters) {
      for (let i = 1; i <= 10; i++) values.push([event.id, `${l}${i}`]);
    }
    for (const v of values) {
      await client.query('INSERT INTO seats (event_id, seat_number) VALUES ($1,$2)', v);
    }

    await client.query('COMMIT');
    res.json(event);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Admin: update event
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, venue, event_date, price_cents, image_url } = req.body;
  const { rows } = await pool.query(
    `UPDATE events SET title=$1, description=$2, venue=$3, event_date=$4, price_cents=$5, image_url=$6
     WHERE id=$7 RETURNING *`,
    [title, description, venue, event_date, price_cents, image_url, req.params.id]
  );
  res.json(rows[0]);
});

// Admin: delete event
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM events WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
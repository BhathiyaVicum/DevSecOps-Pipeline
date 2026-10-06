import bcrypt from 'bcrypt';
import { pool, initDb } from './db.js';

async function seed() {
  await initDb();

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1,$2,$3,'admin'), ($4,$5,$6,'user')
     ON CONFLICT (email) DO NOTHING`,
    ['admin@test.com', adminHash, 'Admin', 'user@test.com', userHash, 'User']
  );

  const { rows: admins } = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  const adminId = admins[0].id;

  const events = [
    ['React Summit 2025', 'A conference for React devs', 'Colombo', '2025-12-01 18:00:00', 5000, 'https://picsum.photos/seed/react/600/400'],
    ['Node.js Meetup', 'Monthly backend meetup', 'Kandy', '2025-11-15 19:00:00', 2000, 'https://picsum.photos/seed/node/600/400'],
    ['DevOps Night', 'CI/CD & Cloud talks', 'Galle', '2025-11-30 17:30:00', 3500, 'https://picsum.photos/seed/devops/600/400'],
  ];

  for (const [title, description, venue, date, price, img] of events) {
    const { rows } = await pool.query(
      `INSERT INTO events (title, description, venue, event_date, price_cents, image_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, description, venue, date, price, img, adminId]
    );
    const eventId = rows[0].id;
    const letters = ['A', 'B', 'C', 'D', 'E'];
    for (const l of letters) {
      for (let i = 1; i <= 10; i++) {
        await pool.query('INSERT INTO seats (event_id, seat_number) VALUES ($1,$2)', [eventId, `${l}${i}`]);
      }
    }
  }

  console.log('✅ Seeded: admin@test.com/admin123, user@test.com/user123');
  await pool.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
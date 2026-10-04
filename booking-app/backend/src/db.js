import './env.js';
import pg from 'pg';

const isProd = process.env.NODE_ENV === 'production';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      venue TEXT,
      event_date TIMESTAMPTZ NOT NULL,
      price_cents INTEGER NOT NULL,
      image_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS seats (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      seat_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      UNIQUE(event_id, seat_number)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      event_id INTEGER REFERENCES events(id),
      seat_id INTEGER REFERENCES seats(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log(' DB schema ready');
}
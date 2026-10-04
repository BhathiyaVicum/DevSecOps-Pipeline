import { useEffect, useState } from 'react';
import api from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings/me').then((r) => setBookings(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded-lg shadow flex justify-between">
              <div>
                <h2 className="font-bold">{b.title}</h2>
                <p className="text-sm text-gray-500">{b.venue} · {new Date(b.event_date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Seat {b.seat_number}</p>
                <p className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
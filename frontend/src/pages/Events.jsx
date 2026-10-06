import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((e) => (
          <Link
            key={e.id}
            to={`/events/${e.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <img src={e.image_url} alt={e.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="font-bold text-lg">{e.title}</h2>
              <p className="text-sm text-gray-500">{e.venue}</p>
              <p className="text-sm text-gray-500">{new Date(e.event_date).toLocaleString()}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-semibold text-blue-600">
                  LKR {(e.price_cents / 100).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  {e.available_seats}/{e.total_seats} left
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎭</div>
        <h2 className="text-xl font-semibold text-gray-800">No events yet</h2>
        <p className="text-gray-500 mt-1">Check back soon.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming events</h1>
        <p className="text-gray-500 mt-1">Pick an event and grab your seat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((e) => {
          const left = Number(e.available_seats);
          const total = Number(e.total_seats);
          const soldOut = left === 0;

          return (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={e.image_url || 'https://picsum.photos/seed/event/600/400'}
                  alt={e.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {soldOut && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Sold out
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{e.title}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  📍 {e.venue}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  🗓️ {new Date(e.event_date).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-blue-600 text-lg">
                    LKR {(e.price_cents / 100).toFixed(0)}
                  </span>
                  <span className={`text-xs font-medium ${soldOut ? 'text-red-500' : 'text-gray-500'}`}>
                    {left}/{total} left
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
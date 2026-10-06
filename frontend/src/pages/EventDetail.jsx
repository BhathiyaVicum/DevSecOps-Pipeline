import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useAuth((s) => s.user);
  const [event, setEvent] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setEvent(r.data));
  }, [id]);

  const toggle = (seat) => {
    if (seat.status !== 'available') return;
    setSelected((s) =>
      s.includes(seat.id) ? s.filter((x) => x !== seat.id) : [...s, seat.id]
    );
  };

  const book = async () => {
    if (!user) return nav('/login');
    setError('');
    setLoading(true);
    try {
      await api.post('/bookings', { event_id: Number(id), seat_ids: selected });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <p className="text-center py-20 text-gray-500">Loading event...</p>;

  const totalPrice = (event.price_cents / 100) * selected.length;
  const seatRows = {};
  event.seats.forEach((s) => {
    const row = s.seat_number.match(/[A-Z]+/)?.[0] || 'A';
    if (!seatRows[row]) seatRows[row] = [];
    seatRows[row].push(s);
  });

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking confirmed!</h1>
        <p className="text-gray-500 mb-6">Your seats are saved. See you there.</p>
        <Link
          to="/my-bookings"
          className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          View my bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover rounded-2xl"
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-4">
            <span>📍 {event.venue}</span>
            <span>
              🗓️ {new Date(event.event_date).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
          <p className="text-gray-700 mt-4 leading-relaxed">{event.description}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select your seats</h2>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-x-auto">
            <div className="inline-block">
              <div className="text-center text-xs text-gray-400 mb-4 tracking-widest">
                — STAGE —
              </div>
              {Object.keys(seatRows)
                .sort()
                .map((row) => (
                  <div key={row} className="flex items-center gap-2 mb-2">
                    <span className="w-5 text-xs text-gray-400 font-mono">{row}</span>
                    <div className="flex gap-1.5">
                      {seatRows[row]
                        .sort((a, b) =>
                          a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })
                        )
                        .map((seat) => {
                          const isSelected = selected.includes(seat.id);
                          const isBooked = seat.status !== 'available';
                          return (
                            <button
                              key={seat.id}
                              onClick={() => toggle(seat)}
                              disabled={isBooked}
                              className={`w-8 h-8 text-[10px] rounded-md font-medium transition ${
                                isBooked
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-blue-600 text-white shadow-md scale-105'
                                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                              }`}
                            >
                              {seat.seat_number.replace(/[A-Z]+/, '')}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-green-50 border border-green-200" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-blue-600" /> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-gray-200" /> Booked
              </span>
            </div>
          </div>
        </div>
      </div>

      <aside className="md:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Your order</h3>

          {selected.length === 0 ? (
            <p className="text-sm text-gray-500">No seats selected yet.</p>
          ) : (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                {selected.length} seat{selected.length !== 1 ? 's' : ''} × LKR{' '}
                {(event.price_cents / 100).toFixed(0)}
              </p>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-lg text-gray-900">LKR {totalPrice.toFixed(0)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={book}
            disabled={selected.length === 0 || loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Booking...' : user ? 'Book now' : 'Sign in to book'}
          </button>
        </div>
      </aside>
    </div>
  );
}
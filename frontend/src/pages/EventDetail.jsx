import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser } from '../auth';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const user = getUser();

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
    try {
      await api.post('/bookings', { event_id: Number(id), seat_ids: selected });
      nav('/my-bookings');
    } catch (e) {
      setError(e.response?.data?.error || 'Booking failed');
    }
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <img src={event.image_url} alt={event.title} className="w-full h-64 object-cover rounded-lg" />
      <h1 className="text-3xl font-bold mt-6">{event.title}</h1>
      <p className="text-gray-600 mt-2">{event.venue} · {new Date(event.event_date).toLocaleString()}</p>
      <p className="mt-4">{event.description}</p>
      <p className="mt-4 font-semibold">LKR {(event.price_cents / 100).toFixed(2)} per seat</p>

      <h2 className="text-xl font-bold mt-8 mb-3">Select Seats</h2>
      <div className="grid grid-cols-10 gap-2 max-w-lg">
        {event.seats.map((seat) => {
          const isSelected = selected.includes(seat.id);
          const isBooked = seat.status !== 'available';
          return (
            <button
              key={seat.id}
              onClick={() => toggle(seat)}
              disabled={isBooked}
              className={`w-9 h-9 text-xs rounded ${
                isBooked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-100 hover:bg-green-200'
              }`}
            >
              {seat.seat_number}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <button
        onClick={book}
        disabled={selected.length === 0}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Book {selected.length} seat{selected.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}
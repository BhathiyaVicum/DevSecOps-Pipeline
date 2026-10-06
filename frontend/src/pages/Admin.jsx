import { useEffect, useState } from 'react';
import api from '../api';

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', venue: '', event_date: '', price_cents: 1000, image_url: ''
  });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/events').then((r) => setEvents(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', {
        ...form,
        price_cents: Number(form.price_cents),
        event_date: new Date(form.event_date).toISOString(),
      });
      setMsg('Event created ✅');
      setForm({ title: '', description: '', venue: '', event_date: '', price_cents: 1000, image_url: '' });
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <form onSubmit={create} className="bg-white p-4 rounded-lg shadow mb-8 grid gap-3">
        <h2 className="font-bold">Create Event</h2>
        {msg && <p className="text-blue-600 text-sm">{msg}</p>}
        <input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded px-3 py-2" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        <input type="datetime-local" className="border rounded px-3 py-2" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
        <input type="number" className="border rounded px-3 py-2" placeholder="Price (cents)" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
        <input className="border rounded px-3 py-2" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create</button>
      </form>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{e.title}</h3>
              <p className="text-sm text-gray-500">{new Date(e.event_date).toLocaleString()}</p>
            </div>
            <button onClick={() => remove(e.id)} className="text-red-600 hover:underline text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
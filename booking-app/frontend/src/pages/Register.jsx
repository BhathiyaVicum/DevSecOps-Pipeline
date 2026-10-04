import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { saveAuth } from '../auth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      saveAuth(data.user, data.token);
      nav('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Register failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full border rounded px-3 py-2 mb-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
      <p className="text-sm mt-3 text-center">Have account? <Link to="/login" className="text-blue-600">Login</Link></p>
    </form>
  );
}
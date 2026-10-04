import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { saveAuth } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveAuth(data.user, data.token);
      nav('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full border rounded px-3 py-2 mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      <p className="text-sm mt-3 text-center">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
    </form>
  );
}
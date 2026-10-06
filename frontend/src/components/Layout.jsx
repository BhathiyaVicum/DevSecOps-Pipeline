import { Link } from 'react-router-dom';
import { getUser, logout } from '../auth';

export default function Layout({ children }) {
  const user = getUser();

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">🎟️ TicketBook</Link>
          <div className="flex gap-4 items-center text-sm">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link to="/my-bookings" className="hover:text-blue-600">My Bookings</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-blue-600">Admin</Link>
                )}
                <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
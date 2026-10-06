import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Layout({ children }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { pathname } = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
        pathname === to
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <span className="text-2xl">🎟️</span>
            <span>TicketBook</span>
          </Link>

          <div className="flex gap-2 items-center">
            {user ? (
              <>
                {navLink('/', 'Events')}
                {user.role !== 'admin' && navLink('/my-bookings', 'My Bookings')}
                {user.role === 'admin' && navLink('/admin', 'Admin')}

                <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:inline">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        TicketBook · A portfolio project
      </footer>
    </div>
  );
}
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">Mezgeb</Link>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-gray-600">{user.phoneNumber}</span>}
            <button onClick={logout} className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded">Logout</button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white border rounded p-3 space-y-1">
            <NavLink to="/" end className={({isActive})=>`block px-3 py-2 rounded ${isActive? 'bg-gray-900 text-white':'hover:bg-gray-100'}`}>Overview</NavLink>
            <NavLink to="/clients" className={({isActive})=>`block px-3 py-2 rounded ${isActive? 'bg-gray-900 text-white':'hover:bg-gray-100'}`}>Clients</NavLink>
            <NavLink to="/leads" className={({isActive})=>`block px-3 py-2 rounded ${isActive? 'bg-gray-900 text-white':'hover:bg-gray-100'}`}>Leads</NavLink>
            <NavLink to="/call-today" className={({isActive})=>`block px-3 py-2 rounded ${isActive? 'bg-gray-900 text-white':'hover:bg-gray-100'}`}>Call Today</NavLink>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

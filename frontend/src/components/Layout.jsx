import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when location changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <Link to="/" className="font-semibold text-lg">Mezgeb</Link>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-600" />
                </div>
                <span className="text-sm text-gray-600">{user.phoneNumber}</span>
              </div>
            )}
            <button 
              onClick={logout} 
              className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 bg-white border-r z-20 transition-transform duration-200 ease-in-out`}
        >
          <nav className="h-full overflow-y-auto p-4 space-y-1">
            <NavLink 
              to="/clients" 
              className={({isActive}) => `block px-4 py-3 rounded-lg ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
            >
              Clients
            </NavLink>
            <NavLink 
              to="/leads" 
              className={({isActive}) => `block px-4 py-3 rounded-lg ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
            >
              Leads
            </NavLink>
            <NavLink 
              to="/call-today" 
              className={({isActive}) => `block px-4 py-3 rounded-lg ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
            >
              Call Today
            </NavLink>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

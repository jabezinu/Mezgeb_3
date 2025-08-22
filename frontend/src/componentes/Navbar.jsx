import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Users, Phone, UserPlus, Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!currentUser) return null;

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-shadow ${scrolled ? 'bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-indigo-600 font-semibold text-lg">
            Mezgeb CRM
          </NavLink>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-indigo-600 hover:bg-indigo-50 lg:hidden"
            onClick={() => setIsOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <ul className="hidden list-none items-center gap-1 lg:flex">
            <li>
              <NavLink to="/" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                <Home size={18} /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/clients" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                <Users size={18} /> Clients
              </NavLink>
            </li>
            <li>
              <NavLink to="/call-today" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                <Phone size={18} /> Call Today
              </NavLink>
            </li>
            <li>
              <NavLink to="/leads" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                <UserPlus size={18} /> Leads
              </NavLink>
            </li>
            <li className="ml-2">
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:border-red-200"
              >
                <LogOut size={18} /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-b border-gray-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <ul className="flex flex-col gap-1 py-1">
              <li>
                <NavLink to="/" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <Home size={18} /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/clients" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <Users size={18} /> Clients
                </NavLink>
              </li>
              <li>
                <NavLink to="/call-today" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <Phone size={18} /> Call Today
                </NavLink>
              </li>
              <li>
                <NavLink to="/leads" className={({isActive}) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                  <UserPlus size={18} /> Leads
                </NavLink>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => { setIsOpen(false); logout(); navigate('/login'); }}
                  className="inline-flex w-full items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:border-red-200"
                >
                  <LogOut size={18} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
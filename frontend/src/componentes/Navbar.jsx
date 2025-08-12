import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Using NavLink for active link styling
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Title */}
        <h1 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          <NavLink to="/">My Application</NavLink>
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav
          className={`${
            isOpen ? 'block' : 'hidden'
          } md:block absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none`}
        >
          <ul className="flex flex-col md:flex-row md:items-center md:space-x-2 p-4 md:p-0">
            <li className="mb-2 md:mb-0">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block py-2 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-100' : ''
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  `block py-2 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-100' : ''
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Clients
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/lead"
                className={({ isActive }) =>
                  `block py-2 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-100' : ''
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Leads
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/call-today"
                className={({ isActive }) =>
                  `block py-2 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-100' : ''
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                Call Today
              </NavLink>
            </li>
            <li className="mt-2 md:mt-0 md:ml-4">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200 hover:border-red-300"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
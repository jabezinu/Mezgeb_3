import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Using NavLink for active link styling

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <ul className="flex flex-col md:flex-row md:space-x-6 p-4 md:p-0">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block py-2 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ${
                    isActive ? 'text-blue-600 font-semibold bg-blue-100' : ''
                  }`
                }
                onClick={() => setIsOpen(false)} // Close menu on link click
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
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
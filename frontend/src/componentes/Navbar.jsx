import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const navStyle = {
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    padding: '10px 20px'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const logoStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#333'
  };

  const menuButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'none'
  };

  const navLinksStyle = {
    display: 'flex',
    listStyle: 'none',
    gap: '20px',
    alignItems: 'center'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    padding: '8px 12px'
  };

  const activeLinkStyle = {
    ...linkStyle,
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0'
  };

  const logoutButtonStyle = {
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    padding: '8px 12px',
    cursor: 'pointer'
  };

  const mobileMenuStyle = {
    display: isOpen ? 'block' : 'none',
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    padding: '10px 20px'
  };

  const mobileNavLinksStyle = {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    gap: '10px'
  };

  return (
    <header style={navStyle}>
      <div style={containerStyle}>
        <h1>
          <NavLink to="/" style={logoStyle}>
            My Application
          </NavLink>
        </h1>

        <button
          style={{
            ...menuButtonStyle,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
          onClick={toggleMenu}
        >
          ☰
        </button>

        <nav style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }}>
          <ul style={navLinksStyle}>
            <li>
              <NavLink
                to="/"
                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/clients"
                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              >
                Clients
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/lead"
                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              >
                Leads
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/call-today"
                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              >
                Call Today
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div style={mobileMenuStyle}>
        <ul style={mobileNavLinksStyle}>
          <li>
            <NavLink
              to="/"
              style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/clients"
              style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              onClick={() => setIsOpen(false)}
            >
              Clients
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/lead"
              style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              onClick={() => setIsOpen(false)}
            >
              Leads
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/call-today"
              style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
              onClick={() => setIsOpen(false)}
            >
              Call Today
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
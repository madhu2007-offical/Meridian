import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const renderBrand = () => (
    <Link to={user ? "/feed" : "/"} className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="24" height="24" style={{ flexShrink: 0 }}>
        <circle cx="30" cy="30" r="28" fill="none" stroke="var(--text)" stroke-width="2.5"/>
        <line x1="2" y1="30" x2="58" y2="30" stroke="var(--text-muted)" stroke-width="1"/>
        <line x1="30" y1="2" x2="30" y2="58" stroke="var(--text-muted)" stroke-width="1"/>
        <ellipse cx="30" cy="30" rx="10" ry="28" fill="none" stroke="var(--primary)" stroke-width="1.5"/>
        <ellipse cx="30" cy="30" rx="20" ry="28" fill="none" stroke="var(--primary)" stroke-opacity="0.5" stroke-width="1"/>
        <circle cx="30" cy="30" r="3" fill="var(--primary)"/>
      </svg>
      <span>Meridian</span>
    </Link>
  );

  // Common theme toggle button styling
  const renderThemeToggle = () => (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.4rem',
        borderRadius: '50%',
        color: 'var(--text)',
        transition: 'var(--transition)',
        width: '38px',
        height: '38px'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );

  // If user is not logged in, render a clean public header
  if (!user) {
    return (
      <nav className="navbar public-navbar">
        <div className="navbar-inner">
          {renderBrand()}
          <div className="navbar-links-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {renderThemeToggle()}
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
          </div>
        </div>
      </nav>
    );
  }

  const links = [
    { to: '/feed', label: 'Feed' },
    { to: '/composer', label: 'Compose' },
  ];

  if (user.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {renderBrand()}
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* User initials circle avatar and dropdown */}
        <div className="navbar-user" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          {renderThemeToggle()}
          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--transition)'
            }}
          >
            {getInitials(user.name)}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="user-dropdown-menu"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '220px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: 'var(--shadow)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div className="dropdown-user-info" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', fontStyle: 'normal', fontFamily: 'var(--font-sans, inherit)' }}>
                    {user.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {user.email}
                  </p>
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-customer'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    {user.role}
                  </span>
                </div>
                <button
                  className="btn btn-danger btn-sm btn-full"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

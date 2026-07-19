import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { to: '/composer', label: 'Compose' },
    { to: '/feed', label: 'Feed' },
  ];

  if (user.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/feed" className="navbar-brand">
          Post Composer
        </Link>
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
        <div className="navbar-user">
          <span className="user-name">{user.name}</span>
          {user.role === 'admin' && <span className="badge badge-admin">Admin</span>}
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

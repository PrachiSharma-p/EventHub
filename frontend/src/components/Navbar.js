// components/Navbar.js — Top navigation, shows different links by role
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout, theme, onThemeToggle }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">EventHub</Link>
      <div className="nav-links">
        <Link to="/">Browse Events</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        <button type="button" className="theme-toggle" onClick={onThemeToggle}
          aria-label="Toggle dark mode" title="Toggle dark mode" aria-pressed={theme === 'dark'}>
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </button>
        {user && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}

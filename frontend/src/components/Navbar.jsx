import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">QUINIELA<span className="logo-accent">2026</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/partidos" className={`nav-link ${isActive('/partidos') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Partidos
          </Link>
          <Link to="/tabla" className={`nav-link ${isActive('/tabla') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Tabla
          </Link>

          {user ? (
            <>
              <Link to="/mis-pronosticos" className={`nav-link ${isActive('/mis-pronosticos') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                Mis Pronósticos
              </Link>
              {user.is_admin && (
                <Link to="/admin" className={`nav-link nav-admin ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <div className="nav-user">
                <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
                <span className="nav-name">{user.name.split(' ')[0]}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Salir</button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Ingresar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

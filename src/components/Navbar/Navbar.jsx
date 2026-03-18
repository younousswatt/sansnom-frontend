import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar({ activePage, onNavigate, onShowAuth, isAdmin }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const links = [
    { id: 'forum', label: 'Forum' },
    { id: 'chat', label: 'Chat' },
    { id: 'resources', label: 'Ressources' },
    { id: 'settings', label: 'Paramètres' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <span className="navbar__logo">SansNom</span>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {links.map(link => (
            <button
              key={link.id}
              className={`navbar__link ${activePage === link.id ? 'navbar__link--active' : ''}`}
              onClick={() => { onNavigate(link.id); setMenuOpen(false); }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="navbar__right">
          <button className="navbar__theme" onClick={toggleTheme} aria-label="Changer le thème">
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          {user?.is_anonymous ? (
            <button className="navbar__login-btn" onClick={onShowAuth}>
              Se connecter
            </button>
          ) : (
            <div className="navbar__user-wrap">
              <button
                className="navbar__avatar navbar__avatar--active"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user?.pseudo?.charAt(0) || 'A'}
              </button>
              {userMenuOpen && (
                <div className="navbar__user-menu">
                  <p className="navbar__user-pseudo">{user?.pseudo}</p>
                  <button className="navbar__user-logout" onClick={() => { logout(); setUserMenuOpen(false); }}>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="navbar__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar__mobile-menu">
          {links.map(link => (
            <button
              key={link.id}
              className={`navbar__mobile-link ${activePage === link.id ? 'navbar__mobile-link--active' : ''}`}
              onClick={() => { onNavigate(link.id); setMenuOpen(false); }}
            >
              {link.label}
            </button>
          ))}
          {user?.is_anonymous && (
            <button className="navbar__mobile-link" onClick={() => { onShowAuth(); setMenuOpen(false); }}>
              Se connecter
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

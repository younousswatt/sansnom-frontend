import { useState } from 'react';
import './AuthModal.css';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const fn = tab === 'login' ? authAPI.login : authAPI.register;
      const { token, user } = await fn({ email, password });
      localStorage.setItem('sansnom_token', token);
      setUser(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = () => {
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>

        <button className="auth-modal__close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
          </svg>
        </button>

        <div className="auth-modal__logo">SansNom</div>
        <p className="auth-modal__tagline">
          {tab === 'login' ? 'Content de te revoir.' : 'Rejoins la communauté.'}
        </p>

        <div className="auth-modal__tabs">
          <button
            className={`auth-modal__tab ${tab === 'login' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Connexion
          </button>
          <button
            className={`auth-modal__tab ${tab === 'register' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Inscription
          </button>
        </div>

        {error && <p className="auth-modal__error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-modal__form">
          <div className="auth-modal__field">
            <label className="auth-modal__label">Email</label>
            <input
              type="email"
              className="auth-modal__input"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-modal__field">
            <label className="auth-modal__label">Mot de passe</label>
            <input
              type="password"
              className="auth-modal__input"
              placeholder={tab === 'register' ? 'Au moins 8 caractères' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {tab === 'register' && (
            <div className="auth-modal__field">
              <label className="auth-modal__label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="auth-modal__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-modal__submit" disabled={loading}>
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-modal__divider">
          <span>ou</span>
        </div>

        <button className="auth-modal__anon" onClick={handleAnonymous}>
          Continuer anonymement
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </button>

        {tab === 'register' && (
          <p className="auth-modal__notice">
            Ton pseudo sera généré aléatoirement. Ton email ne sera jamais visible par les autres utilisateurs.
          </p>
        )}
      </div>
    </div>
  );
}

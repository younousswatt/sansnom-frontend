import { useState } from 'react';
import './Modal.css';
import { THEMES } from '../../data/mockData';
import { postsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function Modal({ onClose, onPostCreated }) {
  const [text, setText] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !theme) return;
    setLoading(true);
    setError('');
    try {
      const newPost = await postsAPI.create({ theme, content: text.trim() });
      if (onPostCreated) onPostCreated(newPost);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Partager anonymement</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
            </svg>
          </button>
        </div>

        <p className="modal__notice">
          Tu postes en tant que <strong>{user?.pseudo || 'Anonyme'}</strong>. Aucune donnée personnelle n'est enregistrée.
        </p>

        {error && <p className="modal__error">{error}</p>}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label className="modal__label">Thématique</label>
            <div className="modal__themes">
              {THEMES.filter(t => t.id !== 'all').map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`modal__theme-btn ${theme === t.id ? 'modal__theme-btn--active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label">Ton message</label>
            <textarea
              className="modal__textarea"
              placeholder="Écris ce que tu ressens, ce dont tu as besoin..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              maxLength={800}
            />
            <span className="modal__count">{text.length}/800</span>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="modal__submit" disabled={!text.trim() || !theme || loading}>
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

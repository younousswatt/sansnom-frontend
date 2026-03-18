import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { volunteersAPI } from '../../api/api';
import { useSocket } from '../../context/SocketContext';
import './Settings.css';

const YEARS = [
  'Licence 1', 'Licence 2', 'Licence 3',
  'Master 1', 'Master 2', 'Doctorat', 'Autre'
];

const STATUS_OPTIONS = [
  { value: 'online', label: 'Disponible', color: '#4caf50' },
  { value: 'busy',   label: 'Occupé',     color: '#ff9800' },
  { value: 'offline',label: 'Hors ligne', color: '#888' },
];

export default function Settings() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tab, setTab] = useState('profil');
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    university: '',
    year: '',
    bio: '',
  });

  const [registerForm, setRegisterForm] = useState({
    university: '',
    year: '',
    bio: '',
  });

  useEffect(() => {
    if (user?.role === 'volunteer' || user?.role === 'moderator' || user?.role === 'admin') {
      volunteersAPI.getMyProfile()
        .then(profile => {
          setVolunteerProfile(profile);
          setIsVolunteer(true);
          setForm({
            university: profile.university || '',
            year: profile.year || '',
            bio: profile.bio || '',
          });
        })
        .catch(() => setIsVolunteer(false))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await volunteersAPI.updateProfile(form);
      setVolunteerProfile(prev => ({ ...prev, ...updated }));
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const profile = await volunteersAPI.register(registerForm);
      setVolunteerProfile(profile);
      setIsVolunteer(true);
      setForm({ university: profile.university || '', year: profile.year || '', bio: profile.bio || '' });
      setSuccess('Tu es maintenant volontaire !');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await volunteersAPI.updateStatus(status);
      setVolunteerProfile(prev => ({ ...prev, status }));
      if (socket) socket.emit('volunteer_status', { status });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="settings"><div className="settings__loading">Chargement...</div></div>;
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Paramètres</h1>

      <div className="settings__layout">
        <nav className="settings__nav">
          <button
            className={`settings__nav-item ${tab === 'profil' ? 'settings__nav-item--active' : ''}`}
            onClick={() => setTab('profil')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
            </svg>
            Mon profil
          </button>
          <button
            className={`settings__nav-item ${tab === 'volontaire' ? 'settings__nav-item--active' : ''}`}
            onClick={() => setTab('volontaire')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1l1.9 3.8 4.1.6-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.1-.6z"/>
            </svg>
            Volontaire
          </button>
        </nav>

        <div className="settings__content">
          {success && <p className="settings__success">{success}</p>}
          {error && <p className="settings__error">{error}</p>}

          {tab === 'profil' && (
            <div className="settings__section">
              <h2 className="settings__section-title">Mon profil</h2>
              <div className="settings__info-card">
                <div className="settings__avatar">
                  {user?.pseudo?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="settings__pseudo">{user?.pseudo}</p>
                  <p className="settings__role">
                    {user?.is_anonymous ? 'Utilisateur anonyme' : user?.role === 'volunteer' ? 'Volontaire' : 'Membre'}
                  </p>
                </div>
              </div>
              <p className="settings__hint">
                Ton pseudo est généré aléatoirement et ne peut pas être modifié. Il garantit ton anonymat.
              </p>
            </div>
          )}

          {tab === 'volontaire' && !isVolunteer && user?.is_anonymous && (
            <div className="settings__section">
              <h2 className="settings__section-title">Devenir volontaire</h2>
              <p className="settings__desc">
                Tu dois créer un compte pour devenir volontaire. Les utilisateurs anonymes ne peuvent pas accéder à cette fonctionnalité.
              </p>
              <div className="settings__hint">
                Crée un compte depuis le bouton "Se connecter" dans la barre de navigation.
              </div>
            </div>
          )}

          {tab === 'volontaire' && !isVolunteer && !user?.is_anonymous && (
            <div className="settings__section">
              <h2 className="settings__section-title">Devenir volontaire</h2>
              <p className="settings__desc">
                En tant que volontaire, tu pourras être disponible pour écouter les autres membres en chat 1:1. C'est gratuit, anonyme, et tu choisis tes disponibilités.
              </p>
              <form onSubmit={handleRegister} className="settings__form">
                <div className="settings__field">
                  <label className="settings__label">Université</label>
                  <input
                    type="text"
                    className="settings__input"
                    placeholder="Ex : Université Cheikh Anta Diop"
                    value={registerForm.university}
                    onChange={e => setRegisterForm(p => ({ ...p, university: e.target.value }))}
                  />
                </div>
                <div className="settings__field">
                  <label className="settings__label">Année d'études</label>
                  <select
                    className="settings__input"
                    value={registerForm.year}
                    onChange={e => setRegisterForm(p => ({ ...p, year: e.target.value }))}
                  >
                    <option value="">Sélectionner</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="settings__field">
                  <label className="settings__label">Biographie courte</label>
                  <textarea
                    className="settings__textarea"
                    placeholder="Quelques mots sur toi, pourquoi tu veux aider..."
                    value={registerForm.bio}
                    onChange={e => setRegisterForm(p => ({ ...p, bio: e.target.value }))}
                    maxLength={300}
                    rows={3}
                  />
                  <span className="settings__count">{registerForm.bio.length}/300</span>
                </div>
                <button type="submit" className="settings__submit" disabled={saving}>
                  {saving ? 'Inscription...' : 'Devenir volontaire'}
                </button>
              </form>
            </div>
          )}

          {tab === 'volontaire' && isVolunteer && (
            <div className="settings__section">
              <h2 className="settings__section-title">Profil volontaire</h2>

              <div className="settings__status-section">
                <p className="settings__label">Mon statut</p>
                <div className="settings__status-btns">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`settings__status-btn ${volunteerProfile?.status === opt.value ? 'settings__status-btn--active' : ''}`}
                      style={volunteerProfile?.status === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                      onClick={() => handleStatusChange(opt.value)}
                    >
                      <span className="settings__status-dot" style={{ background: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings__form">
                <div className="settings__field">
                  <label className="settings__label">Université</label>
                  <input
                    type="text"
                    className="settings__input"
                    placeholder="Ex : Université Cheikh Anta Diop"
                    value={form.university}
                    onChange={e => setForm(p => ({ ...p, university: e.target.value }))}
                  />
                </div>
                <div className="settings__field">
                  <label className="settings__label">Année d'études</label>
                  <select
                    className="settings__input"
                    value={form.year}
                    onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  >
                    <option value="">Sélectionner</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="settings__field">
                  <label className="settings__label">Biographie courte</label>
                  <textarea
                    className="settings__textarea"
                    placeholder="Quelques mots sur toi..."
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    maxLength={300}
                    rows={3}
                  />
                  <span className="settings__count">{form.bio.length}/300</span>
                </div>
                <div className="settings__stats">
                  <div className="settings__stat">
                    <span className="settings__stat-num">{volunteerProfile?.conversation_count || 0}</span>
                    <span className="settings__stat-label">conversations</span>
                  </div>
                </div>
                <button type="submit" className="settings__submit" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

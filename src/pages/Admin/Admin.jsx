import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/api';
import './Admin.css';

const TABS = [
  { id: 'stats',      label: 'Statistiques', icon: '◈' },
  { id: 'reports',    label: 'Signalements',  icon: '⚑' },
  { id: 'posts',      label: 'Posts',         icon: '≡' },
  { id: 'users',      label: 'Utilisateurs',  icon: '◎' },
  { id: 'volunteers', label: 'Volontaires',   icon: '★' },
];

const ROLES = ['user', 'volunteer', 'moderator', 'admin'];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [reportStatus, setReportStatus] = useState('pending');
  const [showHidden, setShowHidden] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const flash = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'stats') {
        setStats(await adminAPI.getStats());
      } else if (tab === 'reports') {
        setReports(await adminAPI.getReports(reportStatus));
      } else if (tab === 'posts') {
        setPosts(await adminAPI.getPosts(showHidden));
      } else if (tab === 'users') {
        setUsers(await adminAPI.getUsers(userSearch));
      } else if (tab === 'volunteers') {
        setVolunteers(await adminAPI.getVolunteers());
      }
    } catch (err) {
      flash('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, reportStatus, showHidden, userSearch]);

  useEffect(() => { load(); }, [load]);

  if (user?.role !== 'admin') {
    return (
      <div className="admin">
        <div className="admin__forbidden">
          <p>Accès réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const handleResolveReport = async (id, action) => {
    try {
      await adminAPI.resolveReport(id, action);
      setReports(prev => prev.filter(r => r.id !== id));
      flash(`Signalement ${action === 'resolved' ? 'résolu' : 'ignoré'}.`);
    } catch (err) { flash('Erreur : ' + err.message); }
  };

  const handleTogglePost = async (id) => {
    try {
      const { is_hidden } = await adminAPI.togglePostVisibility(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_hidden } : p));
      flash(is_hidden ? 'Post masqué.' : 'Post rétabli.');
    } catch (err) { flash('Erreur : ' + err.message); }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      const updated = await adminAPI.updateUser(id, data);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
      flash('Utilisateur mis à jour.');
    } catch (err) { flash('Erreur : ' + err.message); }
  };

  return (
    <div className="admin">
      <div className="admin__header">
        <h1 className="admin__title">Administration</h1>
        <span className="admin__badge">Admin</span>
      </div>

      {feedback && <div className="admin__feedback">{feedback}</div>}

      <div className="admin__layout">
        <nav className="admin__nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin__nav-item ${tab === t.id ? 'admin__nav-item--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="admin__nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin__content">

          {/* STATS */}
          {tab === 'stats' && stats && (
            <div className="admin__section">
              <h2 className="admin__section-title">Vue d'ensemble</h2>
              <div className="admin__stats-grid">
                {[
                  { label: 'Utilisateurs total', value: stats.total_users },
                  { label: 'Posts actifs', value: stats.total_posts },
                  { label: 'Signalements en attente', value: stats.pending_reports, warn: stats.pending_reports > 0 },
                  { label: 'Volontaires en ligne', value: stats.online_volunteers },
                  { label: 'Posts aujourd\'hui', value: stats.posts_today },
                  { label: 'Nouveaux membres aujourd\'hui', value: stats.users_today },
                ].map((s, i) => (
                  <div key={i} className={`admin__stat-card ${s.warn ? 'admin__stat-card--warn' : ''}`}>
                    <div className="admin__stat-num">{s.value}</div>
                    <div className="admin__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <div className="admin__section">
              <div className="admin__toolbar">
                <h2 className="admin__section-title">Signalements</h2>
                <div className="admin__filters">
                  {['pending', 'resolved', 'dismissed'].map(s => (
                    <button
                      key={s}
                      className={`admin__filter-btn ${reportStatus === s ? 'admin__filter-btn--active' : ''}`}
                      onClick={() => setReportStatus(s)}
                    >
                      {s === 'pending' ? 'En attente' : s === 'resolved' ? 'Résolus' : 'Ignorés'}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <p className="admin__loading">Chargement...</p> : (
                reports.length === 0
                  ? <p className="admin__empty">Aucun signalement.</p>
                  : reports.map(r => (
                    <div key={r.id} className="admin__card">
                      <div className="admin__card-meta">
                        <span className="admin__tag">{r.target_type}</span>
                        <span className="admin__muted">par {r.reporter_pseudo}</span>
                        <span className="admin__muted">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {r.target_content && (
                        <p className="admin__card-content">"{r.target_content}"</p>
                      )}
                      {r.reason && <p className="admin__card-reason">Raison : {r.reason}</p>}
                      {r.status === 'pending' && (
                        <div className="admin__card-actions">
                          <button className="admin__btn admin__btn--danger" onClick={() => handleResolveReport(r.id, 'resolved')}>
                            Masquer le contenu
                          </button>
                          <button className="admin__btn" onClick={() => handleResolveReport(r.id, 'dismissed')}>
                            Ignorer
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {/* POSTS */}
          {tab === 'posts' && (
            <div className="admin__section">
              <div className="admin__toolbar">
                <h2 className="admin__section-title">Posts</h2>
                <button
                  className={`admin__filter-btn ${showHidden ? 'admin__filter-btn--active' : ''}`}
                  onClick={() => setShowHidden(!showHidden)}
                >
                  {showHidden ? 'Posts masqués' : 'Posts visibles'}
                </button>
              </div>
              {loading ? <p className="admin__loading">Chargement...</p> : (
                posts.length === 0
                  ? <p className="admin__empty">Aucun post.</p>
                  : posts.map(p => (
                    <div key={p.id} className={`admin__card ${p.is_hidden ? 'admin__card--hidden' : ''}`}>
                      <div className="admin__card-meta">
                        <span className="admin__tag">{p.theme}</span>
                        <span className="admin__muted">{p.pseudo}</span>
                        {p.report_count > 0 && (
                          <span className="admin__tag admin__tag--warn">{p.report_count} signalement(s)</span>
                        )}
                        <span className="admin__muted">{new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="admin__card-content">{p.content}</p>
                      <div className="admin__card-actions">
                        <button
                          className={`admin__btn ${p.is_hidden ? 'admin__btn--success' : 'admin__btn--danger'}`}
                          onClick={() => handleTogglePost(p.id)}
                        >
                          {p.is_hidden ? 'Rétablir' : 'Masquer'}
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="admin__section">
              <div className="admin__toolbar">
                <h2 className="admin__section-title">Utilisateurs</h2>
                <input
                  className="admin__search"
                  placeholder="Rechercher un pseudo..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              {loading ? <p className="admin__loading">Chargement...</p> : (
                users.length === 0
                  ? <p className="admin__empty">Aucun utilisateur.</p>
                  : <div className="admin__table-wrap">
                    <table className="admin__table">
                      <thead>
                        <tr>
                          <th>Pseudo</th>
                          <th>Rôle</th>
                          <th>Posts</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className={!u.is_active ? 'admin__row--inactive' : ''}>
                            <td>
                              <span className="admin__pseudo">{u.pseudo}</span>
                              {u.is_anonymous && <span className="admin__anon-tag">anon</span>}
                            </td>
                            <td>
                              <select
                                className="admin__select"
                                value={u.role}
                                onChange={e => handleUpdateUser(u.id, { role: e.target.value })}
                              >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </td>
                            <td>{u.post_count}</td>
                            <td>
                              <span className={`admin__status-tag ${u.is_active ? 'admin__status-tag--active' : 'admin__status-tag--blocked'}`}>
                                {u.is_active ? 'Actif' : 'Bloqué'}
                              </span>
                            </td>
                            <td>
                              <button
                                className={`admin__btn admin__btn--sm ${u.is_active ? 'admin__btn--danger' : 'admin__btn--success'}`}
                                onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                              >
                                {u.is_active ? 'Bloquer' : 'Débloquer'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
          )}

          {/* VOLUNTEERS */}
          {tab === 'volunteers' && (
            <div className="admin__section">
              <h2 className="admin__section-title">Volontaires</h2>
              {loading ? <p className="admin__loading">Chargement...</p> : (
                volunteers.length === 0
                  ? <p className="admin__empty">Aucun volontaire.</p>
                  : volunteers.map(v => (
                    <div key={v.id} className="admin__card">
                      <div className="admin__card-meta">
                        <span className={`admin__dot admin__dot--${v.status}`} />
                        <strong>{v.pseudo}</strong>
                        <span className="admin__muted">{v.university || 'Université non renseignée'}</span>
                        <span className="admin__muted">{v.year || ''}</span>
                        <span className="admin__tag">{v.conversation_count} conv.</span>
                      </div>
                      {v.bio && <p className="admin__card-content">{v.bio}</p>}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

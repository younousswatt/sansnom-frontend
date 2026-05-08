import { useState, useEffect } from 'react';
import './Resources.css';
import { resourcesAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Article', 'Guide', 'Urgence', 'Vidéo'];

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Article', title: '', description: '', read_time: '', phone: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    resourcesAPI.getAll()
      .then(setResources)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const newRes = await resourcesAPI.create(form);
      setResources(prev => [...prev, newRes]);
      setForm({ category: 'Article', title: '', description: '', read_time: '', phone: '', url: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await resourcesAPI.delete(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="resources">
      <h2 className="resources__heading">Ressources</h2>
      <div className="resources__grid">
        {[1,2,3,4].map(i => <div key={i} className="resource-card resource-card--skeleton" />)}
      </div>
    </div>
  );

  return (
    <div className="resources">
      <div className="resources__header">
        <div>
          <h2 className="resources__heading">Ressources</h2>
          <p className="resources__sub">Articles, guides et contacts utiles pour t'accompagner.</p>
        </div>
        {isAdmin && (
          <button className="resources__add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        )}
      </div>

      {error && <p className="resources__error">{error}</p>}

      {isAdmin && showForm && (
        <form onSubmit={handleCreate} className="resources__form">
          <h3 className="resources__form-title">Nouvelle ressource</h3>
          <div className="resources__form-grid">
            <div className="resources__field">
              <label className="resources__label">Catégorie</label>
              <select className="resources__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="resources__field">
              <label className="resources__label">Temps de lecture</label>
              <input className="resources__input" placeholder="Ex : 5 min" value={form.read_time} onChange={e => setForm(p => ({ ...p, read_time: e.target.value }))} />
            </div>
          </div>
          <div className="resources__field">
            <label className="resources__label">Titre *</label>
            <input className="resources__input" required placeholder="Titre de la ressource" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="resources__field">
            <label className="resources__label">Description *</label>
            <textarea className="resources__textarea" required rows={3} placeholder="Description courte..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="resources__form-grid">
            <div className="resources__field">
              <label className="resources__label">Téléphone (urgence)</label>
              <input className="resources__input" placeholder="+221 XX XXX XX XX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="resources__field">
              <label className="resources__label">URL (article/guide)</label>
              <input className="resources__input" placeholder="https://..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="resources__submit" disabled={saving}>
            {saving ? 'Publication...' : 'Publier la ressource'}
          </button>
        </form>
      )}

      <div className="resources__grid">
        {resources.map(r => (
          <div key={r.id} className={`resource-card ${r.category === 'Urgence' ? 'resource-card--urgent' : ''}`}>
            <div className="resource-card__top">
              <span className={`resource-card__cat resource-card__cat--${r.category.toLowerCase()}`}>
                {r.category}
              </span>
              {r.read_time && <span className="resource-card__time">{r.read_time}</span>}
              {isAdmin && (
                <button className="resource-card__delete" onClick={() => handleDelete(r.id)} title="Supprimer">
                  ×
                </button>
              )}
            </div>
            <h3 className="resource-card__title">{r.title}</h3>
            <p className="resource-card__desc">{r.description}</p>
            {r.phone && (
              <a href={`tel:${r.phone}`} className="resource-card__phone">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 11.5c0 .3-.1.6-.2.9-.1.3-.4.6-.7.8-.5.4-1 .6-1.6.6-1.5 0-3.3-.8-5.1-2.6C4.6 9.4 3.8 7.6 3.8 6.1c0-.6.2-1.1.5-1.6.2-.3.5-.5.8-.7.3-.2.6-.2.9-.2.2 0 .3 0 .4.1.2.1.4.3.5.5l1.7 2.4c.1.2.3.4.3.6 0 .2-.1.4-.2.5l-.6.6c.2.4.6.9 1 1.4.5.5 1 .9 1.4 1.1l.6-.6c.2-.2.4-.3.6-.3.2 0 .4.1.6.3l2.4 1.7c.3.2.5.4.5.6z"/>
                </svg>
                {r.phone}
              </a>
            )}
            {!r.phone && (
              <a href={r.url || '#'} target="_blank" rel="noopener noreferrer" className="resource-card__btn">
                Lire l'article
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

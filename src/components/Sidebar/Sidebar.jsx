import './Sidebar.css';
import { THEMES } from '../../data/mockData';

export default function Sidebar({ activeTheme, onThemeChange, onCompose }) {
  return (
    <aside className="sidebar">
      <span className="sidebar__label">Thématiques</span>
      <div className="sidebar__tags">
        {THEMES.map(t => (
          <button
            key={t.id}
            className={`sidebar__tag ${activeTheme === t.id ? 'sidebar__tag--active' : ''}`}
            onClick={() => onThemeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button className="sidebar__compose" onClick={onCompose}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
        </svg>
        Partager
      </button>
    </aside>
  );
}

import { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Feed from '../../components/Feed/Feed';
import Modal from '../../components/Modal/Modal';
import './Forum.css';
import { useVolunteers } from '../../hooks/useVolunteers';

export default function Forum({ onNavigateChat }) {
  const [activeTheme, setActiveTheme] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const { volunteers } = useVolunteers();

  const onlinePeers = volunteers.filter(v => v.status === 'online');

  return (
    <div className="forum">
      <div className="forum__sidebar">
        <Sidebar
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
          onCompose={() => setShowModal(true)}
        />
      </div>

      <div className="forum__feed">
        <Feed activeTheme={activeTheme} />
      </div>

      <aside className="forum__right">
        <div className="forum__widget">
          <p className="forum__widget-title">Pairs disponibles</p>
          {onlinePeers.length === 0 && (
            <p className="forum__no-peers">Aucun pair disponible pour le moment.</p>
          )}
          {onlinePeers.map(p => (
            <div key={p.id} className="forum__peer">
              <span className="chat-peer__dot chat-peer__dot--online" />
              <div>
                <div className="forum__peer-name">{p.pseudo}</div>
                <div className="forum__peer-role">{p.university || 'Volontaire'}</div>
              </div>
            </div>
          ))}
          <button className="forum__chat-btn" onClick={onNavigateChat}>
            Parler à quelqu'un
          </button>
        </div>

        <div className="forum__widget">
          <p className="forum__widget-title">Aujourd'hui</p>
          <div className="forum__stats">
            <div className="forum__stat">
              <div className="forum__stat-num">{volunteers.length}</div>
              <div className="forum__stat-label">pairs</div>
            </div>
            <div className="forum__stat">
              <div className="forum__stat-num">{onlinePeers.length}</div>
              <div className="forum__stat-label">en ligne</div>
            </div>
          </div>
        </div>
      </aside>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
}

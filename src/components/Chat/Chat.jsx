import { useState, useRef, useEffect, useCallback } from 'react';
import './Chat.css';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/api';

export default function Chat({ onShowAuth }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const isAnonymous = user?.is_anonymous;
  const isVolunteer = ['volunteer', 'moderator', 'admin'].includes(user?.role);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [activeWaitingRoom, setActiveWaitingRoom] = useState(null);
  const [input, setInput] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Utilisateur normal : créer/récupérer sa room
  const initUserRoom = useCallback(async () => {
    if (isAnonymous || isVolunteer) return;
    setLoading(true);
    try {
      const r = await chatAPI.getOrCreateRoom();
      setRoom(r);
      setStatus(r.status);
      if (socket) socket.emit('join_room', { roomId: r.id });
      const { messages: msgs } = await chatAPI.getMessages(r.id);
      setMessages(msgs.map(m => ({ ...m, from: m.pseudo === user?.pseudo ? 'me' : 'peer' })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAnonymous, isVolunteer, socket, user]);

  // Volontaire : charger rooms en attente + ses rooms actives
  const loadVolunteerRooms = useCallback(async () => {
    if (!isVolunteer) return;
    try {
      const [waiting, mine] = await Promise.all([chatAPI.getWaitingRooms(), chatAPI.getMyRooms()]);
      setWaitingRooms(waiting);
      setMyRooms(mine);
    } catch (err) {
      console.error(err);
    }
  }, [isVolunteer]);

  useEffect(() => {
    if (isVolunteer) loadVolunteerRooms();
    else initUserRoom();
  }, [isVolunteer, initUserRoom, loadVolunteerRooms]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, { ...msg, from: msg.pseudo === user?.pseudo ? 'me' : 'peer' }]);
    });

    socket.on('peer_typing', () => setIsPeerTyping(true));
    socket.on('peer_stop_typing', () => setIsPeerTyping(false));

    socket.on('room_accepted', ({ volunteer }) => {
      setStatus('active');
      setMessages(prev => [...prev, {
        id: Date.now(), from: 'system',
        content: `${volunteer} a rejoint la conversation.`,
        created_at: new Date().toISOString(),
      }]);
    });

    socket.on('room_updated', () => {
      if (isVolunteer) loadVolunteerRooms();
    });

    return () => {
      socket.off('new_message');
      socket.off('peer_typing');
      socket.off('peer_stop_typing');
      socket.off('room_accepted');
      socket.off('room_updated');
    };
  }, [socket, user, isVolunteer, loadVolunteerRooms]);

  const sendMessage = () => {
    const roomId = room?.id || activeWaitingRoom?.id;
    if (!input.trim() || !socket || !roomId) return;
    socket.emit('send_message', { roomId, content: input.trim() });
    setInput('');
    socket.emit('stop_typing', { roomId });
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const roomId = room?.id || activeWaitingRoom?.id;
    if (!socket || !roomId) return;
    socket.emit('typing', { roomId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stop_typing', { roomId }), 1500);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleAcceptRoom = async (waitingRoom) => {
    try {
      await chatAPI.acceptRoom(waitingRoom.id);
      socket.emit('join_room', { roomId: waitingRoom.id });
      socket.emit('accept_room', { roomId: waitingRoom.id });
      setActiveWaitingRoom(waitingRoom);
      const { messages: msgs } = await chatAPI.getMessages(waitingRoom.id);
      setMessages(msgs.map(m => ({ ...m, from: m.pseudo === user?.pseudo ? 'me' : 'peer' })));
      loadVolunteerRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMyRoom = async (r) => {
    setActiveWaitingRoom(r);
    socket.emit('join_room', { roomId: r.id });
    const { messages: msgs } = await chatAPI.getMessages(r.id);
    setMessages(msgs.map(m => ({ ...m, from: m.pseudo === user?.pseudo ? 'me' : 'peer' })));
  };

  const handleCloseRoom = async () => {
    const roomId = room?.id || activeWaitingRoom?.id;
    if (!roomId) return;
    await chatAPI.closeRoom(roomId);
    setStatus('closed');
    setActiveWaitingRoom(null);
    if (isVolunteer) loadVolunteerRooms();
  };

  // ─── Écran anonyme ───
  if (isAnonymous) {
    return (
      <div className="chat-layout chat-layout--blocked">
        <div className="chat-blocked">
          <div className="chat-blocked__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="chat-blocked__title">Chat réservé aux membres</h3>
          <p className="chat-blocked__desc">Crée un compte gratuit pour parler en privé avec un pair volontaire. Ton anonymat est préservé.</p>
          <button className="chat-blocked__btn" onClick={onShowAuth}>Créer un compte ou se connecter</button>
          <p className="chat-blocked__hint">Tu peux continuer à lire et commenter le forum anonymement.</p>
        </div>
      </div>
    );
  }

  const showChat = (!isVolunteer && room) || (isVolunteer && activeWaitingRoom);

  return (
    <div className="chat-layout">
      {/* ─── Sidebar ─── */}
      <aside className="chat-peers">
        {isVolunteer ? (
          <>
            <p className="chat-peers__title">Demandes en attente</p>
            {waitingRooms.length === 0 && (
              <p className="chat-peers__empty">Aucune demande pour le moment.</p>
            )}
            {waitingRooms.map(r => (
              <button key={r.id} className={`chat-peer ${activeWaitingRoom?.id === r.id ? 'chat-peer--active' : ''}`}
                onClick={() => handleAcceptRoom(r)}>
                <span className="chat-peer__dot chat-peer__dot--online" />
                <div className="chat-peer__info">
                  <span className="chat-peer__name">{r.user_pseudo}</span>
                  <span className="chat-peer__role">En attente · {r.message_count} msg</span>
                </div>
              </button>
            ))}
            {myRooms.length > 0 && (
              <>
                <p className="chat-peers__title" style={{ marginTop: '16px' }}>Mes conversations</p>
                {myRooms.map(r => (
                  <button key={r.id} className={`chat-peer ${activeWaitingRoom?.id === r.id ? 'chat-peer--active' : ''}`}
                    onClick={() => handleOpenMyRoom(r)}>
                    <span className="chat-peer__dot chat-peer__dot--busy" />
                    <div className="chat-peer__info">
                      <span className="chat-peer__name">{r.user_pseudo}</span>
                      <span className="chat-peer__role">Active · {r.message_count} msg</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <p className="chat-peers__title">Ma conversation</p>
            {loading && <p className="chat-peers__empty">Chargement...</p>}
            {room && (
              <div className={`chat-peer chat-peer--active`}>
                <span className={`chat-peer__dot chat-peer__dot--${status === 'active' ? 'online' : status === 'waiting' ? 'busy' : 'offline'}`} />
                <div className="chat-peer__info">
                  <span className="chat-peer__name">
                    {status === 'waiting' ? 'En attente d\'un pair...' : status === 'active' ? 'Conversation active' : 'Terminée'}
                  </span>
                  <span className="chat-peer__role">{messages.length} message(s)</span>
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* ─── Zone de chat ─── */}
      <div className="chat-main">
        {!showChat ? (
          <div className="chat-empty">
            {isVolunteer
              ? 'Sélectionne une demande pour commencer à aider.'
              : loading ? 'Chargement...' : 'Initialisation de ta conversation...'}
          </div>
        ) : (
          <>
            <div className="chat-header">
              <span className={`chat-peer__dot chat-peer__dot--${status === 'active' ? 'online' : 'busy'}`} />
              <div>
                <span className="chat-header__name">
                  {isVolunteer ? activeWaitingRoom?.user_pseudo : 'Pair volontaire'}
                </span>
                <span className="chat-header__role">
                  {status === 'waiting' ? 'En attente d\'un volontaire' : status === 'active' ? 'Conversation en cours' : 'Terminée'}
                </span>
              </div>
              <div className="chat-header__actions">
                <button className="chat-icon-btn" title="Terminer la conversation" onClick={handleCloseRoom}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 8H3M3 8l3-3M3 8l3 3M13 3v10"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {status === 'waiting' && messages.length === 0 && (
                <div className="chat-waiting-notice">
                  <div className="chat-waiting-spinner" />
                  <p>Ta demande a été envoyée. Un pair volontaire va te rejoindre bientôt.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                msg.from === 'system'
                  ? <p key={i} className="chat-system-msg">{msg.content}</p>
                  : (
                    <div key={msg.id || i} className={`chat-msg chat-msg--${msg.from}`}>
                      <div className="chat-bubble">{msg.content}</div>
                      <span className="chat-msg__time">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
              ))}
              {isPeerTyping && (
                <div className="chat-msg chat-msg--peer">
                  <div className="chat-bubble chat-typing"><span /><span /><span /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <p className="chat-notice">Cette conversation est anonyme et privée.</p>

            {status !== 'closed' && (
              <div className="chat-input-area">
                <textarea className="chat-input" placeholder="Écris un message..." value={input}
                  onChange={handleInput} onKeyDown={handleKey} rows={1} />
                <button className="chat-send" onClick={sendMessage} disabled={!input.trim()}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2L2 7l5 2 2 5 5-12z"/>
                  </svg>
                </button>
              </div>
            )}

            {status === 'closed' && (
              <p className="chat-closed-notice">Cette conversation est terminée.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

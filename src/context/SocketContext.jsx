import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || undefined;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const joinedRooms = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem('sansnom_token');
    if (!token) return;

    const socketOptions = {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    };

    const s = SOCKET_URL ? io(SOCKET_URL, socketOptions) : io(socketOptions);

    s.on('connect', () => {
      setConnected(true);
      console.log('✓ Socket connecté');

      // Rejoindre automatiquement les rooms précédentes après reconnexion
      joinedRooms.current.forEach(roomId => {
        s.emit('join_room', roomId);
        console.log(`Rejoint automatiquement la room: ${roomId}`);
      });
    });

    s.on('disconnect', (reason) => {
      setConnected(false);
      console.log('✗ Socket déconnecté:', reason);

      if (reason === 'io server disconnect') {
        // Le serveur a forcé la déconnexion, essayer de reconnecter
        setTimeout(() => s.connect(), 1000);
      }
    });

    s.on('connect_error', (err) => {
      console.error('Socket erreur de connexion:', err.message);
      setConnected(false);
    });

    s.on('reconnect', (attemptNumber) => {
      console.log(`✓ Socket reconnecté après ${attemptNumber} tentatives`);
      setConnected(true);
    });

    s.on('reconnect_error', (err) => {
      console.error('Échec de reconnexion socket:', err.message);
    });

    s.on('reconnect_failed', () => {
      console.error('Échec définitif de reconnexion socket');
      setConnected(false);
    });

    setSocket(s);

    return () => {
      const currentRooms = joinedRooms.current;
      currentRooms.clear();
      s.disconnect();
    };
  }, []);

  // Fonction pour rejoindre une room et la mémoriser
  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('join_room', roomId);
      joinedRooms.current.add(roomId);
    }
  };

  // Fonction pour quitter une room
  const leaveRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('leave_room', roomId);
      joinedRooms.current.delete(roomId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sansnom_token');
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('✓ Socket connecté');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('Socket erreur :', err.message);
    });

    setSocket(s);

    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

import { useState, useEffect } from 'react';
import { volunteersAPI } from '../api/api';
import { useSocket } from '../context/SocketContext';

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    volunteersAPI.getAll()
      .then(setVolunteers)
      .catch(err => console.error('Erreur volontaires :', err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('volunteer_update', ({ pseudo, status }) => {
      setVolunteers(prev => prev.map(v =>
        v.pseudo === pseudo ? { ...v, status } : v
      ));
    });
    return () => socket.off('volunteer_update');
  }, [socket]);

  return { volunteers, loading };
}

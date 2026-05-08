import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sansnom_token');
    if (token) {
      authAPI.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('sansnom_token');
          initAnonymous();
        })
        .finally(() => setLoading(false));
    } else {
      initAnonymous();
    }
  }, []);

  async function initAnonymous() {
    try {
      const { token, user } = await authAPI.createAnonymous();
      localStorage.setItem('sansnom_token', token);
      setUser(user);
    } catch (err) {
      console.error('Erreur auth anonyme :', err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('sansnom_token');
    setUser(null);
    initAnonymous();
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

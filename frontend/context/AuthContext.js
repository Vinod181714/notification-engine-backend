import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { initSocket, disconnectSocket, refreshAuth } from '../lib/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      // ensure socket disconnected when no token
      disconnectSocket();
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      // initialize socket after user is loaded and ensure auth is refreshed
      initSocket();
      refreshAuth();
    } catch (err) {
      setUser(null);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const login = async (token) => {
    Cookies.set('token', token, { expires: 7 });
    await loadUser();
  };

  const logout = () => {
    Cookies.remove('token');
    disconnectSocket();
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session — always re-fetch profile from server to get latest role/isPro
  useEffect(() => {
    const storedToken = localStorage.getItem('zorovex_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    // Fetch fresh profile (catches role changes, isPro updates, etc.)
    authAPI.getProfile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('zorovex_user', JSON.stringify(res.data));
      })
      .catch(() => {
        // Token invalid/expired — clear session
        localStorage.removeItem('zorovex_token');
        localStorage.removeItem('zorovex_user');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('zorovex_token', tokenValue);
    localStorage.setItem('zorovex_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zorovex_token');
    localStorage.removeItem('zorovex_user');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('zorovex_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch {
      logout();
    }
  }, [logout]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

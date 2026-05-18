import { createContext, useState, useEffect } from 'react';
import { getToken, removeToken, setToken } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setTokenState(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        removeToken();
        localStorage.removeItem('user');
        setTokenState(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setTokenState(token);
    setUser(userData);
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
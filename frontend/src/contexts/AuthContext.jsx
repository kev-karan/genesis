import { createContext, useState, useEffect } from 'react';
import { getToken, removeToken, setToken } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      try {
        const parsed = JSON.parse(atob(storedToken.split('.')[1]));
        setUser(parsed);
      } catch (e) {
        removeToken();
        setTokenState(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setToken(token);
    setTokenState(token);
    setUser(userData);
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
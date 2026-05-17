import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.me();
      setUser(u);
      setFavorites(u.favorites || []);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { user: u, token } = await api.login({ email, password });
    localStorage.setItem('token', token);
    setUser(u);
    setFavorites(u.favorites || []);
    return u;
  };

  const register = async (name, email, password) => {
    const { user: u, token } = await api.register({ name, email, password });
    localStorage.setItem('token', token);
    setUser(u);
    setFavorites([]);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (markerId) => {
    const updated = await api.toggleFavorite(markerId);
    setFavorites(updated.favorites);
    if (user) setUser({ ...user, favorites: updated.favorites });
    return updated.favorites;
  };

  const isFavorite = (id) =>
    favorites.some((f) => String(f._id || f) === String(id));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, favorites, toggleFavorite, isFavorite, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

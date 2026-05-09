import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { listFavoritos, addFavorito, removeFavorito } from '../api/favoritos';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, loading: authLoading } = useContext(AuthContext);

  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await listFavoritos();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      loadFavorites();
    }
  }, [loadFavorites, authLoading]);

  const addToFavorites = useCallback(async (fluxogramaId) => {
    try {
      setError(null);
      await addFavorito(fluxogramaId);
      await loadFavorites();
    } catch (err) {
      setError(err.message);
      console.error('Erro ao favoritar:', err);
      throw err;
    }
  }, [loadFavorites]);

  const removeFromFavorites = useCallback(async (fluxogramaId) => {
    try {
      setError(null);
      await removeFavorito(fluxogramaId);
      await loadFavorites();
    } catch (err) {
      setError(err.message);
      console.error('Erro ao remover favorito:', err);
      throw err;
    }
  }, [loadFavorites]);

  const isFavorited = useCallback((fluxogramaId) => {
    return favorites.some(fav => fav.fluxograma_id === fluxogramaId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        loadFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorited,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

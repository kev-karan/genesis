import { apiCall } from './client';

export const listFavoritos = async () => {
  return apiCall('/favoritos/meus-favoritos/');
};

export const addFavorito = async (fluxogramaId) => {
  return apiCall(`/favoritos/favoritar/${fluxogramaId}/`, {
    method: 'POST',
  });
};

export const removeFavorito = async (fluxogramaId) => {
  return apiCall(`/favoritos/remover/${fluxogramaId}/`, {
    method: 'DELETE',
  });
};

import { apiCall } from './client';

export const fetchFluxogramas = async (busca = '') => {
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : '';
  return apiCall(`/fluxogramas/${query}`);
};

export const getFluxograma = async (id) => {
  return apiCall(`/fluxogramas/${id}/`);
};

import { apiCall } from './client';

export const registrarAcesso = async (fluxogramaId) => {
  return apiCall(`/acessos/registrar/${fluxogramaId}/`, {
    method: 'POST',
  });
};

export const listAcessosRecentes = async () => {
  return apiCall('/acessos/recentes/');
};

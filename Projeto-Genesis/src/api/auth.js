import { apiCall, setToken, removeToken } from './client';

export const login = async (username, password) => {
  const data = await apiCall('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(data.token);
  return data;
};

export const logout = async () => {
  removeToken();
  return apiCall('/auth/logout/', {
    method: 'POST',
  });
};

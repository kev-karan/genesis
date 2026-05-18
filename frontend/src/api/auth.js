import { apiCall, setToken, removeToken } from './client';

export const login = async (username, password) => {
  const data = await apiCall('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(data.token);
  return data;
};

export const cadastro = async ({ email, password, confirmPassword }) => {
  return apiCall('/auth/cadastro/', {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
  });
};

export const logout = async () => {
  try {
    return await apiCall('/auth/logout/', {
      method: 'POST',
    });
  } finally {
    removeToken();
  }
};
import api from './axios';

export const getUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

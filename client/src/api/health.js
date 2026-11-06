import api from './axios';

export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

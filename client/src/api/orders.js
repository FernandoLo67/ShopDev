import api from './axios';

export const createOrder = async (payment) => {
  const { data } = await api.post('/orders', { payment });
  return data;
};

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

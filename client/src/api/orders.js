import api from './axios';

export const createOrder = async (payment) => {
  const { data } = await api.post('/orders', { payment });
  return data;
};

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

// Solo ADMIN: devuelve los pedidos de todo el sistema
export const getAllOrders = async (params = {}) => {
  const { data } = await api.get('/orders/all', { params });
  return data;
};

// Solo ADMIN: metricas agregadas para el dashboard
export const getOrderStats = async () => {
  const { data } = await api.get('/orders/stats');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (id, estado) => {
  const { data } = await api.put(`/orders/${id}/status`, { estado });
  return data;
};

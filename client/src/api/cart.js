import api from './axios';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addCartItem = async (productId, cantidad) => {
  const { data } = await api.post('/cart', { productId, cantidad });
  return data;
};

export const updateCartItem = async (itemId, cantidad) => {
  const { data } = await api.put(`/cart/${itemId}`, { cantidad });
  return data;
};

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/cart/${itemId}`);
  return data;
};

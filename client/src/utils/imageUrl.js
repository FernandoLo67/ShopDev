export const resolveImageUrl = (imagenUrl) => {
  if (!imagenUrl) return '';
  if (/^https?:\/\//i.test(imagenUrl)) return imagenUrl;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return `${base}/uploads/${imagenUrl.replace(/^\/+/, '')}`;
};

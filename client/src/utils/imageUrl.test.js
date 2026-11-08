import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveImageUrl } from './imageUrl';

const conApiUrl = (valor) => {
  vi.stubEnv('VITE_API_URL', valor);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveImageUrl', () => {
  it('devuelve cadena vacia cuando no hay imagen', () => {
    expect(resolveImageUrl(undefined)).toBe('');
    expect(resolveImageUrl(null)).toBe('');
    expect(resolveImageUrl('')).toBe('');
  });

  it('deja intactas las URLs absolutas http y https', () => {
    const externa = 'https://images.unsplash.com/photo-123';
    expect(resolveImageUrl(externa)).toBe(externa);
    expect(resolveImageUrl('http://ejemplo.com/a.jpg')).toBe('http://ejemplo.com/a.jpg');
  });

  it('no distingue mayusculas en el protocolo', () => {
    expect(resolveImageUrl('HTTPS://ejemplo.com/a.jpg')).toBe('HTTPS://ejemplo.com/a.jpg');
  });

  it('construye la ruta de uploads para imagenes subidas', () => {
    conApiUrl('http://localhost:4000/api');

    expect(resolveImageUrl('products/abc.jpg')).toBe(
      'http://localhost:4000/uploads/products/abc.jpg'
    );
  });

  it('quita el sufijo /api con barra final', () => {
    conApiUrl('http://localhost:4000/api/');

    expect(resolveImageUrl('products/abc.jpg')).toBe(
      'http://localhost:4000/uploads/products/abc.jpg'
    );
  });

  it('no duplica la barra si la ruta relativa ya empieza con una', () => {
    conApiUrl('http://localhost:4000/api');

    expect(resolveImageUrl('/products/abc.jpg')).toBe(
      'http://localhost:4000/uploads/products/abc.jpg'
    );
  });

  it('funciona con una base vacia', () => {
    conApiUrl('');

    expect(resolveImageUrl('products/abc.jpg')).toBe('/uploads/products/abc.jpg');
  });
});

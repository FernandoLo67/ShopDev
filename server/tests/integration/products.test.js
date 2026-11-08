import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prismaMock, resetPrismaMock } from '../helpers/prismaMock.js';

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { default: app } = await import('../../src/app.js');
const { env } = await import('../../src/config/env.js');

const ADMIN = { id: 9, nombre: 'Admin', email: 'admin@test.com', rol: 'ADMIN' };
const CLIENTE = { id: 1, nombre: 'Ana', email: 'ana@test.com', rol: 'CLIENTE' };

const PRODUCTO = {
  id: 1,
  nombre: 'Teclado mecanico',
  descripcion: 'Switches rojos',
  precio: '89.99',
  stock: 12,
  imagenUrl: 'products/teclado.jpg',
  categoryId: 2,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  category: { id: 2, nombre: 'Perifericos', slug: 'perifericos' },
};

const tokenDe = (user) =>
  jwt.sign({ id: user.id, email: user.email, rol: user.rol }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

beforeEach(() => {
  resetPrismaMock();
});

describe('GET /api/products', () => {
  it('devuelve la lista con bloque de paginacion', async () => {
    prismaMock.product.findMany.mockResolvedValue([PRODUCTO]);
    prismaMock.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ page: 1, total: 1, totalPages: 1 });
  });

  it('es publico: no requiere token', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.product.count.mockResolvedValue(0);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
  });

  it('calcula skip y take a partir de page y limit', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.product.count.mockResolvedValue(0);

    await request(app).get('/api/products?page=3&limit=5');

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('responde 400 con un limit fuera de rango', async () => {
    const res = await request(app).get('/api/products?limit=9999');

    expect(res.status).toBe(400);
    expect(prismaMock.product.findMany).not.toHaveBeenCalled();
  });

  it('responde 400 con una pagina no numerica', async () => {
    const res = await request(app).get('/api/products?page=abc');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto cuando existe', async () => {
    prismaMock.product.findUnique.mockResolvedValue(PRODUCTO);

    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe(PRODUCTO.nombre);
  });

  it('responde 404 cuando no existe', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/products/4321');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('responde 400 con un id no numerico', async () => {
    const res = await request(app).get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(prismaMock.product.findUnique).not.toHaveBeenCalled();
  });
});

describe('autorizacion de escritura en productos', () => {
  it('responde 401 al crear sin token', async () => {
    const res = await request(app).post('/api/products').send({ nombre: 'X' });

    expect(res.status).toBe(401);
  });

  it('responde 403 al crear con un usuario CLIENTE', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`)
      .send({ nombre: 'X' });

    expect(res.status).toBe(403);
    expect(prismaMock.product.create).not.toHaveBeenCalled();
  });

  it('responde 403 al eliminar con un usuario CLIENTE', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`);

    expect(res.status).toBe(403);
    expect(prismaMock.product.delete).not.toHaveBeenCalled();
  });

  it('un ADMIN pasa la autorizacion y llega a la validacion de datos', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`)
      .send({});

    // 400 (no 403): el rol fue aceptado y fallo la validacion del cuerpo
    expect(res.status).toBe(400);
    expect(res.body.details).toBeInstanceOf(Array);
  });
});

describe('rutas no definidas', () => {
  it('responde 404 con el sobre de error estandar', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});

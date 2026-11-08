import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prismaMock, resetPrismaMock } from '../helpers/prismaMock.js';

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { default: app } = await import('../../src/app.js');
const { env } = await import('../../src/config/env.js');

const ADMIN = { id: 9, nombre: 'Admin', email: 'admin@test.com', rol: 'ADMIN' };
const CLIENTE = { id: 1, nombre: 'Ana', email: 'ana@test.com', rol: 'CLIENTE' };

const PEDIDO = {
  id: 10,
  userId: 1,
  total: '129.98',
  estado: 'PENDIENTE',
  createdAt: new Date('2026-03-01T00:00:00.000Z'),
  items: [],
  user: { id: 1, nombre: 'Ana', email: 'ana@test.com' },
};

const tokenDe = (user) =>
  jwt.sign({ id: user.id, email: user.email, rol: user.rol }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

beforeEach(() => {
  resetPrismaMock();
});

describe('GET /api/orders', () => {
  it('filtra siempre por el usuario autenticado', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);
    prismaMock.order.findMany.mockResolvedValue([PEDIDO]);
    prismaMock.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`);

    expect(res.status).toBe(200);
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: CLIENTE.id } })
    );
  });

  it('responde 401 sin token', async () => {
    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/all', () => {
  it('un ADMIN obtiene los pedidos de todo el sistema', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findMany.mockResolvedValue([PEDIDO]);
    prismaMock.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders/all')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    // Sin filtro de usuario: la consulta no acota por userId
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it('incluye los datos del cliente en cada pedido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findMany.mockResolvedValue([PEDIDO]);
    prismaMock.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders/all')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.body.data[0].user).toMatchObject({ nombre: 'Ana', email: 'ana@test.com' });

    const llamada = prismaMock.order.findMany.mock.calls[0][0];
    expect(llamada.include.user.select).toMatchObject({ nombre: true, email: true });
  });

  it('acepta filtro por estado', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findMany.mockResolvedValue([]);
    prismaMock.order.count.mockResolvedValue(0);

    await request(app)
      .get('/api/orders/all?estado=PAGADO')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { estado: 'PAGADO' } })
    );
  });

  it('acepta filtro por userId', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findMany.mockResolvedValue([]);
    prismaMock.order.count.mockResolvedValue(0);

    await request(app)
      .get('/api/orders/all?userId=1')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });

  it('responde 400 con un estado invalido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);

    const res = await request(app)
      .get('/api/orders/all?estado=INVENTADO')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.status).toBe(400);
    expect(prismaMock.order.findMany).not.toHaveBeenCalled();
  });

  it('responde 403 a un usuario CLIENTE', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .get('/api/orders/all')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`);

    expect(res.status).toBe(403);
    expect(prismaMock.order.findMany).not.toHaveBeenCalled();
  });

  it('responde 401 sin token', async () => {
    const res = await request(app).get('/api/orders/all');

    expect(res.status).toBe(401);
  });

  it('no se confunde con la ruta /:id', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findMany.mockResolvedValue([]);
    prismaMock.order.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/orders/all')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    // Si /:id capturara "all", el validador de id devolveria 400
    expect(res.status).toBe(200);
    expect(prismaMock.order.findUnique).not.toHaveBeenCalled();
  });
});

describe('GET /api/orders/stats', () => {
  const prepararStats = () => {
    prismaMock.order.count.mockResolvedValue(7);
    prismaMock.order.groupBy.mockResolvedValue([
      { estado: 'PENDIENTE', _count: { _all: 3 } },
      { estado: 'ENVIADO', _count: { _all: 4 } },
    ]);
    prismaMock.order.aggregate.mockResolvedValue({ _sum: { total: '950.50' } });
    prismaMock.product.count.mockResolvedValue(20);
    prismaMock.user.count.mockResolvedValue(5);
  };

  it('devuelve las metricas agregadas', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prepararStats();

    const res = await request(app)
      .get('/api/orders/stats')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalPedidos: 7,
      ingresosTotales: '950.50',
      totalUsuarios: 5,
    });
  });

  it('rellena con 0 los estados que no aparecen en el groupBy', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prepararStats();

    const res = await request(app)
      .get('/api/orders/stats')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.body.data.pedidosPorEstado).toEqual({
      PENDIENTE: 3,
      PAGADO: 0,
      ENVIADO: 4,
    });
  });

  it('devuelve 0 de ingresos cuando no hay pedidos', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prepararStats();
    prismaMock.order.aggregate.mockResolvedValue({ _sum: { total: null } });

    const res = await request(app)
      .get('/api/orders/stats')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.body.data.ingresosTotales).toBe(0);
  });

  it('responde 403 a un usuario CLIENTE', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .get('/api/orders/stats')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/orders/:id', () => {
  it('el dueno puede ver su pedido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);
    prismaMock.order.findUnique.mockResolvedValue(PEDIDO);

    const res = await request(app)
      .get('/api/orders/10')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(10);
  });

  it('responde 404 a un cliente que pide el pedido de otro', async () => {
    const otro = { ...CLIENTE, id: 99 };
    prismaMock.user.findUnique.mockResolvedValue(otro);
    prismaMock.order.findUnique.mockResolvedValue(PEDIDO);

    const res = await request(app)
      .get('/api/orders/10')
      .set('Authorization', `Bearer ${tokenDe(otro)}`);

    // 404 y no 403: no revela que el pedido existe
    expect(res.status).toBe(404);
  });

  it('un ADMIN puede ver el pedido de cualquier usuario', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findUnique.mockResolvedValue(PEDIDO);

    const res = await request(app)
      .get('/api/orders/10')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`);

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/orders/:id/status', () => {
  it('responde 403 a un usuario CLIENTE', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .put('/api/orders/10/status')
      .set('Authorization', `Bearer ${tokenDe(CLIENTE)}`)
      .send({ estado: 'PAGADO' });

    expect(res.status).toBe(403);
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it('responde 400 con un estado invalido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);

    const res = await request(app)
      .put('/api/orders/10/status')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`)
      .send({ estado: 'ENTREGADO' });

    expect(res.status).toBe(400);
  });

  it('un ADMIN avanza el estado de PENDIENTE a PAGADO', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findUnique.mockResolvedValue({ ...PEDIDO, estado: 'PENDIENTE' });
    prismaMock.order.update.mockResolvedValue({ ...PEDIDO, estado: 'PAGADO' });

    const res = await request(app)
      .put('/api/orders/10/status')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`)
      .send({ estado: 'PAGADO' });

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('PAGADO');
  });

  it('rechaza un salto de estado no permitido', async () => {
    prismaMock.user.findUnique.mockResolvedValue(ADMIN);
    prismaMock.order.findUnique.mockResolvedValue({ ...PEDIDO, estado: 'PENDIENTE' });

    const res = await request(app)
      .put('/api/orders/10/status')
      .set('Authorization', `Bearer ${tokenDe(ADMIN)}`)
      .send({ estado: 'ENVIADO' });

    // PENDIENTE solo puede pasar a PAGADO
    expect(res.status).toBe(400);
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prismaMock, resetPrismaMock } from '../helpers/prismaMock.js';

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { default: app } = await import('../../src/app.js');
const { env } = await import('../../src/config/env.js');

const CLIENTE = { id: 1, nombre: 'Ana', email: 'ana@test.com', rol: 'CLIENTE' };

const PAGO = {
  numeroTarjeta: '4242424242424242',
  expiracion: '12/40',
  cvv: '123',
  titular: 'Ana Cliente',
};

const LINEA = {
  productId: 5,
  cantidad: 1,
  product: { id: 5, nombre: 'Ultima unidad', precio: '19.99', stock: 1 },
};

const token = jwt.sign(
  { id: CLIENTE.id, email: CLIENTE.email, rol: CLIENTE.rol },
  env.jwtSecret,
  { algorithm: 'HS256', expiresIn: '1h' }
);

const pagar = () =>
  request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ payment: PAGO });

beforeEach(() => {
  resetPrismaMock();
  prismaMock.user.findUnique.mockResolvedValue(CLIENTE);
  prismaMock.cartItem.findMany.mockResolvedValue([LINEA]);
  prismaMock.order.create.mockResolvedValue({ id: 50, estado: 'PAGADO', items: [] });
});

describe('POST /api/orders - carrera por la ultima unidad', () => {
  it('responde 409 si otro cliente se llevo el stock entre la lectura y el descuento', async () => {
    // La lectura vio stock suficiente, pero el descuento condicional no encontro fila
    prismaMock.product.updateMany.mockResolvedValue({ count: 0 });

    const res = await pagar();

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/ultimas unidades/i);
  });

  it('no vacia el carrito cuando la compra pierde la carrera', async () => {
    prismaMock.product.updateMany.mockResolvedValue({ count: 0 });

    await pagar();

    expect(prismaMock.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it('completa la compra cuando el descuento de stock tiene exito', async () => {
    prismaMock.product.updateMany.mockResolvedValue({ count: 1 });

    const res = await pagar();

    expect(res.status).toBe(201);
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: CLIENTE.id } });
  });

  it('el descuento de stock lleva la guarda stock >= cantidad', async () => {
    prismaMock.product.updateMany.mockResolvedValue({ count: 1 });

    await pagar();

    expect(prismaMock.product.updateMany).toHaveBeenCalledWith({
      where: { id: 5, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
  });
});

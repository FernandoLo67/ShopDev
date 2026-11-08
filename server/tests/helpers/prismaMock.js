import { vi } from 'vitest';

/**
 * Mock de PrismaClient compartido por los tests de integracion.
 *
 * Los tests no tocan una base de datos real: se sustituye el modulo
 * src/config/prisma.js por este objeto y cada test define que devuelve
 * cada metodo con mockResolvedValue.
 */
const crearModelo = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
});

export const prismaMock = {
  user: crearModelo(),
  category: crearModelo(),
  product: crearModelo(),
  order: crearModelo(),
  orderItem: crearModelo(),
  cartItem: crearModelo(),
  // Las transacciones reciben el mismo mock como cliente transaccional
  $transaction: vi.fn((callback) =>
    typeof callback === 'function' ? callback(prismaMock) : Promise.all(callback)
  ),
  $disconnect: vi.fn(),
};

/** Deja todos los mocks en limpio entre tests. */
export const resetPrismaMock = () => {
  Object.values(prismaMock).forEach((valor) => {
    if (typeof valor === 'function') {
      valor.mockClear();
      return;
    }
    Object.values(valor).forEach((metodo) => metodo.mockReset());
  });

  prismaMock.$transaction.mockImplementation((callback) =>
    typeof callback === 'function' ? callback(prismaMock) : Promise.all(callback)
  );
};

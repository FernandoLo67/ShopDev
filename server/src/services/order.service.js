import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { clearCart } from './cart.service.js';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: { id: true, nombre: true, imagenUrl: true },
      },
    },
  },
};

const ADMIN_ORDER_INCLUDE = {
  ...ORDER_INCLUDE,
  user: {
    select: { id: true, nombre: true, email: true },
  },
};

const TRANSICIONES = {
  PENDIENTE: ['PAGADO'],
  PAGADO: ['ENVIADO'],
  ENVIADO: [],
};

const processPayment = (payment) => {
  if (payment && payment.numeroTarjeta && payment.expiracion && payment.cvv && payment.titular) {
    return {
      aprobado: true,
      referencia: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
  return { aprobado: false };
};

export const createFromCart = async (userId, payment) => {
  const resultado = processPayment(payment);

  if (!resultado.aprobado) {
    throw ApiError.badRequest('El pago no fue aprobado');
  }

  return prisma.$transaction(
    async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw ApiError.badRequest('El carrito esta vacio');
      }

      const faltantes = cartItems
        .filter((item) => item.cantidad > item.product.stock)
        .map((item) => ({
          productId: item.productId,
          nombre: item.product.nombre,
          solicitado: item.cantidad,
          disponible: item.product.stock,
        }));

      if (faltantes.length > 0) {
        throw ApiError.conflict('Stock insuficiente para algunos productos', faltantes);
      }

      const total = cartItems.reduce(
        (acc, item) =>
          acc.add(new Prisma.Decimal(item.product.precio).mul(item.cantidad)),
        new Prisma.Decimal(0)
      );

      const order = await tx.order.create({
        data: {
          userId,
          total,
          estado: 'PAGADO',
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              cantidad: item.cantidad,
              precioUnitario: item.product.precio,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      const sortedItems = [...cartItems].sort((a, b) => a.productId - b.productId);

      for (const item of sortedItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });

        if (result.count === 0) {
          throw ApiError.conflict(
            'Otro cliente compro las ultimas unidades mientras pagabas. Revisa tu carrito e intenta de nuevo',
          );
        }
      }

      await clearCart(userId, tx);

      return order;
    },
    { timeout: 10000 }
  );
};

export const getByUser = async (userId, { page = 1, limit = 10, estado }) => {
  const where = { userId };

  if (estado) {
    where.estado = estado;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAll = async ({ page = 1, limit = 10, estado, userId }) => {
  const where = {};

  if (estado) {
    where.estado = estado;
  }

  if (userId) {
    where.userId = userId;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ADMIN_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStats = async () => {
  const [totalPedidos, porEstado, ingresos, totalProductos, totalUsuarios, sinStock] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({ by: ['estado'], _count: { _all: true } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

  const estados = { PENDIENTE: 0, PAGADO: 0, ENVIADO: 0 };
  porEstado.forEach((fila) => {
    estados[fila.estado] = fila._count._all;
  });

  return {
    totalPedidos,
    pedidosPorEstado: estados,
    ingresosTotales: ingresos._sum.total ?? 0,
    totalProductos,
    totalUsuarios,
    productosSinStock: sinStock,
  };
};

export const getById = async (orderId, user) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      ...ORDER_INCLUDE,
      user: { select: { id: true, nombre: true, email: true } },
    },
  });

  if (!order) {
    throw ApiError.notFound('Pedido no encontrado');
  }

  if (user.rol !== 'ADMIN' && order.userId !== user.id) {
    throw ApiError.notFound('Pedido no encontrado');
  }

  return order;
};

export const updateStatus = async (orderId, nuevoEstado) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw ApiError.notFound('Pedido no encontrado');
  }

  const permitidas = TRANSICIONES[order.estado];

  if (!permitidas.includes(nuevoEstado)) {
    throw ApiError.badRequest('Transicion de estado no permitida', {
      actual: order.estado,
      permitidas,
    });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { estado: nuevoEstado },
    include: ORDER_INCLUDE,
  });
};

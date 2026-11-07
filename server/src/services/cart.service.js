import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const CART_INCLUDE = {
  product: {
    include: { category: true },
  },
};

export const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: CART_INCLUDE,
    orderBy: { id: 'asc' },
  });

  const itemsConSubtotal = items.map((item) => ({
    ...item,
    subtotal: new Prisma.Decimal(item.product.precio).mul(item.cantidad),
  }));

  const total = itemsConSubtotal.reduce(
    (acc, item) => acc.add(item.subtotal),
    new Prisma.Decimal(0)
  );

  return {
    items: itemsConSubtotal,
    total,
    totalItems: items.length,
  };
};

export const addItem = async (userId, { productId, cantidad = 1 }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw ApiError.notFound('Producto no encontrado');
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  const nuevaCantidad = (existing?.cantidad ?? 0) + cantidad;

  if (nuevaCantidad > product.stock) {
    throw ApiError.badRequest('Stock insuficiente', {
      disponible: product.stock,
      solicitado: nuevaCantidad,
    });
  }

  return prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, cantidad: nuevaCantidad },
    update: { cantidad: nuevaCantidad },
    include: CART_INCLUDE,
  });
};

export const updateItem = async (userId, itemId, cantidad) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { product: true },
  });

  if (!item || item.userId !== userId) {
    throw ApiError.notFound('Item no encontrado');
  }

  if (cantidad > item.product.stock) {
    throw ApiError.badRequest('Stock insuficiente', {
      disponible: item.product.stock,
      solicitado: cantidad,
    });
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { cantidad },
    include: CART_INCLUDE,
  });
};

export const removeItem = async (userId, itemId) => {
  const { count } = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId },
  });

  if (count === 0) {
    throw ApiError.notFound('Item no encontrado');
  }
};

export const clearCart = async (userId, tx = prisma) => {
  await tx.cartItem.deleteMany({ where: { userId } });
};

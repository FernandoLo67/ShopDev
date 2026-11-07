import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const list = async ({ page = 1, limit = 12, category, search, minPrice, maxPrice }) => {
  const where = {};

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { descripcion: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.precio = {};
    if (minPrice !== undefined) where.precio.gte = minPrice;
    if (maxPrice !== undefined) where.precio.lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
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

export const getById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw ApiError.notFound('Producto no encontrado');
  }

  return product;
};

export const create = async (data, imagenUrl) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!categoryExists) {
    throw ApiError.badRequest('La categoria especificada no existe');
  }

  return prisma.product.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      stock: data.stock || 0,
      imagenUrl: imagenUrl || null,
      categoryId: data.categoryId,
    },
    include: { category: true },
  });
};

export const update = async (id, data, imagenUrl) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw ApiError.notFound('Producto no encontrado');
  }

  if (data.categoryId !== undefined) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw ApiError.badRequest('La categoria especificada no existe');
    }
  }

  const updateData = {};

  if (data.nombre !== undefined) updateData.nombre = data.nombre;
  if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
  if (data.precio !== undefined) updateData.precio = data.precio;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl;

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });

  const oldImageUrl = imagenUrl !== undefined ? product.imagenUrl : null;

  return { product: updated, oldImageUrl };
};

export const remove = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) {
    throw ApiError.notFound('Producto no encontrado');
  }

  if (product._count.orderItems > 0) {
    throw ApiError.conflict('No se puede eliminar un producto con pedidos asociados');
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);

  return product.imagenUrl;
};

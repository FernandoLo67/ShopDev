import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify } from '../utils/slug.js';

export const getAll = async () => {
  return prisma.category.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { products: true } } },
  });
};

export const create = async ({ nombre, imagen }) => {
  const slug = slugify(nombre);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ nombre }, { slug }] },
  });

  if (existing) {
    throw ApiError.conflict('Ya existe una categoria con ese nombre');
  }

  return prisma.category.create({
    data: { nombre, slug, imagen: imagen || null },
  });
};

export const update = async (id, { nombre, imagen }) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw ApiError.notFound('Categoria no encontrada');
  }

  const updateData = {};

  if (nombre !== undefined) {
    const slug = slugify(nombre);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ nombre }, { slug }],
        NOT: { id },
      },
    });

    if (existing) {
      throw ApiError.conflict('Ya existe una categoria con ese nombre');
    }

    updateData.nombre = nombre;
    updateData.slug = slug;
  }

  if (imagen !== undefined) {
    updateData.imagen = imagen || null;
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const remove = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw ApiError.notFound('Categoria no encontrada');
  }

  if (category._count.products > 0) {
    throw ApiError.conflict('No se puede eliminar una categoria con productos asociados');
  }

  await prisma.category.delete({ where: { id } });
};

import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const USER_SELECT = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  createdAt: true,
};

export const getAll = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });

  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  return user;
};

export const create = async ({ nombre, email, password, rol }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw ApiError.conflict('El email ya esta registrado');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  const user = await prisma.user.create({
    data: { nombre, email: normalizedEmail, passwordHash, rol },
    select: USER_SELECT,
  });

  return user;
};

export const update = async (id, data, requestingUserId) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  const updateData = {};

  if (data.nombre !== undefined) {
    updateData.nombre = data.nombre;
  }

  if (data.email !== undefined) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.id !== id) {
      throw ApiError.conflict('El email ya esta registrado');
    }
    updateData.email = normalizedEmail;
  }

  if (data.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(data.password, env.bcryptRounds);
  }

  if (data.rol !== undefined) {
    if (id === requestingUserId) {
      throw ApiError.badRequest('No puedes cambiar tu propio rol');
    }
    updateData.rol = data.rol;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: USER_SELECT,
  });

  return updated;
};

export const remove = async (id, requestingUserId) => {
  if (id === requestingUserId) {
    throw ApiError.badRequest('No puedes eliminarte a ti mismo');
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  await prisma.user.delete({ where: { id } });
};

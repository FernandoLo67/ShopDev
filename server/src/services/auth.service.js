import jwt from 'jsonwebtoken';
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

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    env.jwtSecret,
    { algorithm: 'HS256', expiresIn: env.jwtExpiresIn },
  );

export const register = async ({ nombre, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw ApiError.conflict('El email ya esta registrado');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  const user = await prisma.user.create({
    data: { nombre, email: normalizedEmail, passwordHash, rol: 'CLIENTE' },
    select: USER_SELECT,
  });

  const token = signToken(user);
  return { user, token };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const hash = user ? user.passwordHash : DUMMY_HASH;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw ApiError.unauthorized('Credenciales invalidas');
  }

  const { passwordHash: _, ...safeUser } = user;
  const token = signToken(safeUser);

  const { passwordHash: __, ...userData } = user;
  return {
    user: {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      createdAt: userData.createdAt,
    },
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  return user;
};

import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { asyncHandler } from './asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token no proporcionado');
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    logger.warn(`Token invalido o expirado — IP: ${req.ip}`);
    throw ApiError.unauthorized('Token invalido o expirado');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      createdAt: true,
    },
  });

  if (!user) {
    logger.warn(`Token valido pero usuario no encontrado (id: ${payload.id}) — IP: ${req.ip}`);
    throw ApiError.unauthorized('Usuario no encontrado');
  }

  req.user = user;
  next();
});

import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const PRISMA_ERROR_MAP = {
  P2002: { statusCode: 409, message: 'Ya existe un registro con ese valor unico' },
  P2025: { statusCode: 404, message: 'Registro no encontrado' },
  P2003: { statusCode: 409, message: 'Operacion viola una relacion existente' },
};

const resolveError = (err) => {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, details: err.details };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[err.code];
    if (mapped) return { ...mapped, details: null };
    logger.error(`Error de Prisma no mapeado (${err.code}):`, err.message);
    return { statusCode: 500, message: 'Error interno del servidor', details: null };
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return { statusCode: 400, message: 'JSON invalido', details: null };
  }

  logger.error('Error no controlado:', err);
  return { statusCode: 500, message: 'Error interno del servidor', details: null };
};

export const errorHandler = (err, _req, res, _next) => {
  const { statusCode, message, details } = resolveError(err);

  const body = { status: 'error', message, details };

  if (env.isDev) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

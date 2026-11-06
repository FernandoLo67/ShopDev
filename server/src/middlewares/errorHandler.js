import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Ya existe un registro con ese valor unico';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Registro no encontrado';
        break;
      case 'P2003':
        statusCode = 409;
        message = 'Operacion viola una relacion existente';
        break;
      default:
        logger.error('Error de Prisma no mapeado:', err);
    }
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON invalido';
  } else {
    logger.error('Error no controlado:', err);
  }

  const response = {
    status: 'error',
    message,
    details,
  };

  if (!env.isProd) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

import { ApiError } from '../utils/ApiError.js';

export const authorize = (roles) => (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('No autorizado');
  }

  if (!roles.includes(req.user.rol)) {
    throw ApiError.forbidden('No tienes permisos para esta accion');
  }

  next();
};

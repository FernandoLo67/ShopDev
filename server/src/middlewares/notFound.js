import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`${req.method} ${req.originalUrl} no existe`));
};

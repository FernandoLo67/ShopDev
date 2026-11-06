import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(
      'Datos invalidos',
      errors.array().map((e) => ({ campo: e.path, mensaje: e.msg }))
    );
  }
  next();
};

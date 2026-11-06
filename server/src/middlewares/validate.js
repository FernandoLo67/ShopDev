import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (rules) => [
  ...rules,
  (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().map((e) => ({ campo: e.path, mensaje: e.msg }));
      throw ApiError.badRequest('Datos invalidos', details);
    }
    next();
  },
];

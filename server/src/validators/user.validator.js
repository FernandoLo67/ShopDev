import { body, param, query } from 'express-validator';
import { registerRules } from './auth.validator.js';

export const createUserRules = [
  ...registerRules,
  body('rol')
    .optional()
    .isIn(['CLIENTE', 'ADMIN'])
    .withMessage('El rol debe ser CLIENTE o ADMIN'),
];

export const updateUserRules = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El email no es valido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contrasena debe tener al menos 8 caracteres')
    .isLength({ max: 72 })
    .withMessage('La contrasena no debe superar 72 caracteres'),
  body('rol')
    .optional()
    .isIn(['CLIENTE', 'ADMIN'])
    .withMessage('El rol debe ser CLIENTE o ADMIN'),
];

export const idParamRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];

export const listUsersRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La pagina debe ser un entero positivo')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El limite debe ser un entero entre 1 y 100')
    .toInt(),
];

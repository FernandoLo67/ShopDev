import { body } from 'express-validator';

export const registerRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 100 })
    .withMessage('El nombre no debe superar 100 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email no es valido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contrasena es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contrasena debe tener al menos 8 caracteres')
    .isLength({ max: 72 })
    .withMessage('La contrasena no debe superar 72 caracteres'),
];

export const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email no es valido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contrasena es obligatoria'),
];

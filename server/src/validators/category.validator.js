import { body, param } from 'express-validator';

export const idParamRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];

export const createCategoryRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('imagen')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La URL de imagen no debe superar 500 caracteres'),
];

export const updateCategoryRules = [
  ...idParamRules,
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('imagen')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La URL de imagen no debe superar 500 caracteres'),
];

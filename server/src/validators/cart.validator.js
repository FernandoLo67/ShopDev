import { body, param } from 'express-validator';

export const addItemRules = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('El productId debe ser un entero positivo')
    .toInt(),
  body('cantidad')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe ser un entero entre 1 y 99')
    .toInt(),
];

export const updateItemRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
  body('cantidad')
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe ser un entero entre 1 y 99')
    .toInt(),
];

export const itemIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];

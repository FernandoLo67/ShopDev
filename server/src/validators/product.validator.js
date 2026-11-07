import { body, param, query } from 'express-validator';

export const idParamRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];

export const createProductRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripcion es requerida')
    .isLength({ max: 5000 })
    .withMessage('La descripcion no debe superar 5000 caracteres'),
  body('precio')
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage('El precio debe ser un numero entre 0.01 y 99999999.99')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('El precio debe tener maximo 2 decimales'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un entero no negativo')
    .toInt(),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('El categoryId debe ser un entero positivo')
    .toInt(),
];

export const updateProductRules = [
  ...idParamRules,
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripcion no puede estar vacia')
    .isLength({ max: 5000 })
    .withMessage('La descripcion no debe superar 5000 caracteres'),
  body('precio')
    .optional()
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage('El precio debe ser un numero entre 0.01 y 99999999.99')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('El precio debe tener maximo 2 decimales'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un entero no negativo')
    .toInt(),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El categoryId debe ser un entero positivo')
    .toInt(),
];

export const listProductRules = [
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
  query('category')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('El slug de categoria no es valido'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La busqueda no debe superar 100 caracteres'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio minimo debe ser un numero positivo')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio maximo debe ser un numero positivo')
    .toFloat(),
  query('maxPrice').custom((value, { req }) => {
    if (req.query.minPrice !== undefined && value !== undefined) {
      if (parseFloat(req.query.minPrice) > parseFloat(value)) {
        throw new Error('El precio minimo no puede ser mayor al precio maximo');
      }
    }
    return true;
  }),
];

import { body, param, query } from 'express-validator';

export const createOrderRules = [
  body('payment')
    .isObject()
    .withMessage('Los datos de pago son requeridos'),
  body('payment.numeroTarjeta')
    .customSanitizer((v) => v?.replace(/[\s-]/g, ''))
    .matches(/^\d{16}$/)
    .withMessage('El numero de tarjeta debe tener 16 digitos'),
  body('payment.expiracion')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('La expiracion debe tener formato MM/YY')
    .custom((value) => {
      const [mes, anio] = value.split('/').map(Number);
      const ahora = new Date();
      const mesActual = ahora.getMonth() + 1;
      const anioActual = ahora.getFullYear() % 100;

      if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
        throw new Error('La tarjeta esta vencida');
      }
      return true;
    }),
  body('payment.cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('El CVV debe tener 3 o 4 digitos'),
  body('payment.titular')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El titular debe tener entre 2 y 100 caracteres'),
];

export const orderIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];

export const listOrdersRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La pagina debe ser un entero positivo')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El limite debe ser un entero entre 1 y 50')
    .toInt(),
  query('estado')
    .optional()
    .isIn(['PENDIENTE', 'PAGADO', 'ENVIADO'])
    .withMessage('El estado debe ser PENDIENTE, PAGADO o ENVIADO'),
];

export const listAllOrdersRules = [
  ...listOrdersRules,
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El userId debe ser un entero positivo')
    .toInt(),
];

export const updateStatusRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
  body('estado')
    .isIn(['PENDIENTE', 'PAGADO', 'ENVIADO'])
    .withMessage('El estado debe ser PENDIENTE, PAGADO o ENVIADO'),
];

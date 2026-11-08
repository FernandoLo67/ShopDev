import { Router } from 'express';
import {
  create,
  list,
  listAll,
  stats,
  getById,
  updateStatus,
} from '../controllers/order.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import {
  createOrderRules,
  orderIdRules,
  listOrdersRules,
  listAllOrdersRules,
  updateStatusRules,
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderRules), create);
router.get('/', validate(listOrdersRules), list);

// Rutas de administrador: deben declararse antes de '/:id'
router.get('/all', authorize(['ADMIN']), validate(listAllOrdersRules), listAll);
router.get('/stats', authorize(['ADMIN']), stats);

router.get('/:id', validate(orderIdRules), getById);
router.put('/:id/status', authorize(['ADMIN']), validate(updateStatusRules), updateStatus);

export default router;

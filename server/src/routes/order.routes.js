import { Router } from 'express';
import { create, list, getById, updateStatus } from '../controllers/order.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import {
  createOrderRules,
  orderIdRules,
  listOrdersRules,
  updateStatusRules,
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderRules), create);
router.get('/', validate(listOrdersRules), list);
router.get('/:id', validate(orderIdRules), getById);
router.put('/:id/status', authorize(['ADMIN']), validate(updateStatusRules), updateStatus);

export default router;

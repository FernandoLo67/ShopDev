import { Router } from 'express';
import { list, create, update, remove } from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import {
  createCategoryRules,
  updateCategoryRules,
  idParamRules,
} from '../validators/category.validator.js';

const router = Router();

router.get('/', list);
router.post('/', authenticate, authorize(['ADMIN']), validate(createCategoryRules), create);
router.put('/:id', authenticate, authorize(['ADMIN']), validate(updateCategoryRules), update);
router.delete('/:id', authenticate, authorize(['ADMIN']), validate(idParamRules), remove);

export default router;

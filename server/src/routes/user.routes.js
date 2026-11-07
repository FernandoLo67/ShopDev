import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import {
  createUserRules,
  updateUserRules,
  idParamRules,
  listUsersRules,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/', validate(listUsersRules), list);
router.get('/:id', validate(idParamRules), getById);
router.post('/', validate(createUserRules), create);
router.put('/:id', validate([...idParamRules, ...updateUserRules]), update);
router.delete('/:id', validate(idParamRules), remove);

export default router;

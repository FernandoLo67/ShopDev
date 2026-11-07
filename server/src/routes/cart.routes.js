import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cart.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { addItemRules, updateItemRules, itemIdRules } from '../validators/cart.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', validate(addItemRules), addItem);
router.put('/:id', validate(updateItemRules), updateItem);
router.delete('/:id', validate(itemIdRules), removeItem);

export default router;

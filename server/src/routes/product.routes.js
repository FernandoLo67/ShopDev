import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { uploadImage, handleUploadError, verifyImageContent } from '../middlewares/upload.middleware.js';
import {
  createProductRules,
  updateProductRules,
  listProductRules,
  idParamRules,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', validate(listProductRules), list);
router.get('/:id', validate(idParamRules), getById);
router.post('/', authenticate, authorize(['ADMIN']), uploadImage, handleUploadError, verifyImageContent, validate(createProductRules), create);
router.put('/:id', authenticate, authorize(['ADMIN']), uploadImage, handleUploadError, verifyImageContent, validate(updateProductRules), update);
router.delete('/:id', authenticate, authorize(['ADMIN']), validate(idParamRules), remove);

export default router;

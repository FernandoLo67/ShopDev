import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as cartService from '../services/cart.service.js';
import { success, created, noContent } from '../utils/response.js';

export const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req.user.id);
  return success(res, result);
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, cantidad } = req.body;
  const item = await cartService.addItem(req.user.id, {
    productId,
    cantidad: cantidad || 1,
  });
  return created(res, item);
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await cartService.updateItem(
    req.user.id,
    req.params.id,
    req.body.cantidad
  );
  return success(res, item);
});

export const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.user.id, req.params.id);
  return noContent(res);
});

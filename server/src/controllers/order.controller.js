import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as orderService from '../services/order.service.js';
import { success, created, paginated } from '../utils/response.js';

export const create = asyncHandler(async (req, res) => {
  const { payment } = req.body;
  const order = await orderService.createFromCart(req.user.id, payment);
  return created(res, order);
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, estado } = req.query;
  const result = await orderService.getByUser(req.user.id, { page, limit, estado });
  return paginated(res, result.data, result.pagination);
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id, req.user);
  return success(res, order);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.estado);
  return success(res, order);
});

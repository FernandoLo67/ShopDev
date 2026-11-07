import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as userService from '../services/user.service.js';
import { success, created, noContent, paginated } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const result = await userService.getAll({ page, limit });
  return paginated(res, result.data, result.pagination);
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  return success(res, user);
});

export const create = asyncHandler(async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const user = await userService.create({ nombre, email, password, rol });
  return created(res, user);
});

export const update = asyncHandler(async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const user = await userService.update(req.params.id, { nombre, email, password, rol }, req.user.id);
  return success(res, user);
});

export const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id, req.user.id);
  return noContent(res);
});

export default { list, getById, create, update, remove };

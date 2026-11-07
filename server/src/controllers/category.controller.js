import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as categoryService from '../services/category.service.js';
import { success, created, noContent } from '../utils/response.js';

export const list = asyncHandler(async (_req, res) => {
  const categories = await categoryService.getAll();
  return success(res, categories);
});

export const create = asyncHandler(async (req, res) => {
  const { nombre, imagen } = req.body;
  const category = await categoryService.create({ nombre, imagen });
  return created(res, category);
});

export const update = asyncHandler(async (req, res) => {
  const { nombre, imagen } = req.body;
  const category = await categoryService.update(req.params.id, { nombre, imagen });
  return success(res, category);
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  return noContent(res);
});

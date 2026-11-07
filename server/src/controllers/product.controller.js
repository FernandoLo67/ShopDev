import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as productService from '../services/product.service.js';
import { success, created, noContent, paginated } from '../utils/response.js';
import { deleteFile } from '../middlewares/upload.middleware.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, category, search, minPrice, maxPrice } = req.query;
  const result = await productService.list({ page, limit, category, search, minPrice, maxPrice });
  return paginated(res, result.data, result.pagination);
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  return success(res, product);
});

export const create = asyncHandler(async (req, res) => {
  const imagenUrl = req.file ? `products/${req.file.filename}` : null;

  try {
    const { nombre, descripcion, precio, stock, categoryId } = req.body;
    const product = await productService.create(
      { nombre, descripcion, precio, stock, categoryId },
      imagenUrl
    );
    return created(res, product);
  } catch (err) {
    deleteFile(imagenUrl);
    throw err;
  }
});

export const update = asyncHandler(async (req, res) => {
  const imagenUrl = req.file ? `products/${req.file.filename}` : undefined;

  try {
    const { nombre, descripcion, precio, stock, categoryId } = req.body;
    const { product, oldImageUrl } = await productService.update(
      req.params.id,
      { nombre, descripcion, precio, stock, categoryId },
      imagenUrl
    );

    if (oldImageUrl) {
      deleteFile(oldImageUrl);
    }

    return success(res, product);
  } catch (err) {
    if (imagenUrl) deleteFile(imagenUrl);
    throw err;
  }
});

export const remove = asyncHandler(async (req, res) => {
  const imagenUrl = await productService.remove(req.params.id);

  if (imagenUrl) {
    deleteFile(imagenUrl);
  }

  return noContent(res);
});

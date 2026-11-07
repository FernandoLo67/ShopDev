import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { ApiError } from '../utils/ApiError.js';

const UPLOAD_DIR = path.resolve('uploads/products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = MIME_EXTENSIONS[file.mimetype] || path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (MIME_EXTENSIONS[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Solo se permiten imagenes JPG, PNG o WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

export const uploadImage = upload.single('imagen');

export const handleUploadError = (err, req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('La imagen no debe superar 2MB'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(ApiError.badRequest('Solo se permite una imagen'));
    }
    return next(ApiError.badRequest(`Error al subir imagen: ${err.message}`));
  }
  next(err);
};

export const deleteFile = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.resolve('uploads', relativePath);
    fs.unlinkSync(fullPath);
  } catch {
    // best-effort
  }
};

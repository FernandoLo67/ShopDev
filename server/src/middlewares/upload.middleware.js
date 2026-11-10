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

const FIRMAS = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) =>
    b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
};

// El mimetype lo declara el cliente, asi que no basta: se comprueban los
// primeros bytes del archivo ya guardado y se descarta si no son de una imagen.
export const verifyImageContent = (req, _res, next) => {
  if (!req.file) return next();

  const { path: filePath, mimetype } = req.file;
  let cabecera = Buffer.alloc(12);

  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      fs.readSync(fd, cabecera, 0, 12, 0);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    cabecera = Buffer.alloc(12);
  }

  const esValida = FIRMAS[mimetype]?.(cabecera) === true;
  if (!esValida) {
    deleteFile(`products/${req.file.filename}`);
    return next(ApiError.badRequest('El archivo no es una imagen valida'));
  }

  next();
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

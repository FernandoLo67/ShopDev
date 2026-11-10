import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { verifyImageContent } from '../../src/middlewares/upload.middleware.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x24, 0x00, 0x00, 0x00]),
  Buffer.from('WEBPVP8 '),
]);

let carpeta;

beforeEach(() => {
  carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'shopdev-upload-'));
});

afterEach(() => {
  fs.rmSync(carpeta, { recursive: true, force: true });
});

const subir = (contenido, mimetype) => {
  const archivo = path.join(carpeta, 'subida.bin');
  fs.writeFileSync(archivo, contenido);
  return { path: archivo, filename: 'subida.bin', mimetype };
};

const ejecutar = (file) => {
  let resultado;
  verifyImageContent({ file }, {}, (err) => {
    resultado = err;
  });
  return resultado;
};

describe('verifyImageContent', () => {
  it('deja pasar la peticion si no se subio ningun archivo', () => {
    expect(ejecutar(undefined)).toBeUndefined();
  });

  it.each([
    ['PNG', PNG, 'image/png'],
    ['JPEG', JPG, 'image/jpeg'],
    ['WebP', WEBP, 'image/webp'],
  ])('acepta un %s real', (_nombre, contenido, mimetype) => {
    expect(ejecutar(subir(contenido, mimetype))).toBeUndefined();
  });

  it('rechaza con 400 un texto plano que declara ser PNG', () => {
    const err = ejecutar(subir(Buffer.from('esto no es una imagen, es texto plano'), 'image/png'));

    expect(err).toBeDefined();
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('El archivo no es una imagen valida');
  });

  it('rechaza un script que declara ser JPEG', () => {
    const err = ejecutar(subir(Buffer.from('<?php system($_GET["c"]); ?>'), 'image/jpeg'));

    expect(err?.statusCode).toBe(400);
  });

  it('rechaza un PNG real que declara ser JPEG (el tipo no coincide)', () => {
    const err = ejecutar(subir(PNG, 'image/jpeg'));

    expect(err?.statusCode).toBe(400);
  });

  it('rechaza un archivo vacio', () => {
    const err = ejecutar(subir(Buffer.alloc(0), 'image/png'));

    expect(err?.statusCode).toBe(400);
  });

  it('un RIFF que no es WebP (por ejemplo un WAV) se rechaza', () => {
    const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVEfmt ')]);

    expect(ejecutar(subir(wav, 'image/webp'))?.statusCode).toBe(400);
  });

  it('borra del disco el archivo rechazado', () => {
    const file = subir(Buffer.from('basura'), 'image/png');
    const rutaUploads = path.resolve('uploads/products', file.filename);
    fs.mkdirSync(path.dirname(rutaUploads), { recursive: true });
    fs.writeFileSync(rutaUploads, 'basura');

    ejecutar({ ...file, path: rutaUploads });

    expect(fs.existsSync(rutaUploads)).toBe(false);
  });

  it('rechaza si el archivo ya no existe en disco', () => {
    const err = ejecutar({ path: path.join(carpeta, 'no-existe.png'), filename: 'no-existe.png', mimetype: 'image/png' });

    expect(err?.statusCode).toBe(400);
  });
});

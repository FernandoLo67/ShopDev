import { describe, it, expect, vi } from 'vitest';
import { ApiError } from '../../src/utils/ApiError.js';
import { success, created, noContent, paginated } from '../../src/utils/response.js';
import { slugify } from '../../src/utils/slug.js';

describe('ApiError', () => {
  it('guarda el codigo de estado y el mensaje', () => {
    const error = new ApiError(418, 'Soy una tetera');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe('Soy una tetera');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('ApiError');
  });

  it.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['internal', 500],
  ])('%s produce un error con estado %i', (metodo, estado) => {
    const error = ApiError[metodo]();

    expect(error.statusCode).toBe(estado);
    expect(typeof error.message).toBe('string');
    expect(error.message.length).toBeGreaterThan(0);
  });

  it('acepta detalles de validacion en badRequest', () => {
    const detalles = [{ field: 'email', message: 'Email invalido' }];
    const error = ApiError.badRequest('Datos invalidos', detalles);

    expect(error.details).toEqual(detalles);
  });

  it('deja details en null cuando no se pasa', () => {
    expect(ApiError.notFound().details).toBeNull();
  });
});

describe('helpers de respuesta', () => {
  const crearRes = () => {
    const res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res),
      end: vi.fn(() => res),
    };
    return res;
  };

  it('success responde 200 con el sobre estandar', () => {
    const res = crearRes();
    success(res, { id: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: { id: 1 } });
  });

  it('success acepta un codigo de estado distinto', () => {
    const res = crearRes();
    success(res, null, 202);

    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('created responde 201', () => {
    const res = crearRes();
    created(res, { id: 7 });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: { id: 7 } });
  });

  it('noContent responde 204 sin cuerpo', () => {
    const res = crearRes();
    noContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('paginated incluye el bloque de paginacion', () => {
    const res = crearRes();
    const pagination = { page: 1, limit: 10, total: 3, totalPages: 1 };
    paginated(res, [], pagination);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: [],
      pagination,
    });
  });
});

describe('slugify', () => {
  it('pasa a minusculas y une con guiones', () => {
    expect(slugify('Zapatos De Cuero')).toBe('zapatos-de-cuero');
  });

  it('quita los acentos', () => {
    expect(slugify('Electrónica')).toBe('electronica');
  });

  it('elimina los caracteres no alfanumericos', () => {
    expect(slugify('Ropa & Accesorios!')).toBe('ropa-accesorios');
  });

  it('colapsa guiones repetidos', () => {
    expect(slugify('a   ---   b')).toBe('a-b');
  });

  it('no deja guiones al inicio ni al final', () => {
    expect(slugify('  hola mundo  ')).toBe('hola-mundo');
    expect(slugify('---hola---')).toBe('hola');
  });

  it('limita la longitud a 120 caracteres', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(120);
  });

  it('devuelve cadena vacia cuando no queda nada utilizable', () => {
    expect(slugify('!!!')).toBe('');
  });
});

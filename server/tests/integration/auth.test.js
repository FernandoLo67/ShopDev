import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaMock, resetPrismaMock } from '../helpers/prismaMock.js';

// Debe declararse antes de importar la app: sustituye el cliente real de Prisma.
vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { default: app } = await import('../../src/app.js');
const { env } = await import('../../src/config/env.js');

const CLIENTE = {
  id: 1,
  nombre: 'Ana Cliente',
  email: 'ana@test.com',
  rol: 'CLIENTE',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const firmarToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, rol: user.rol }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

beforeEach(() => {
  resetPrismaMock();
});

describe('POST /api/auth/register', () => {
  it('registra un usuario nuevo y devuelve token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(CLIENTE);

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Ana Cliente',
      email: 'Ana@Test.com',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('ana@test.com');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('normaliza el email a minusculas antes de guardarlo', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(CLIENTE);

    await request(app).post('/api/auth/register').send({
      nombre: 'Ana Cliente',
      email: '  ANA@TEST.COM  ',
      password: 'Password123',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'ana@test.com', rol: 'CLIENTE' }),
      })
    );
  });

  it('responde 409 si el email ya existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...CLIENTE, passwordHash: 'x' });

    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Ana Cliente',
      email: 'ana@test.com',
      password: 'Password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('responde 400 con email invalido y no consulta la base', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Ana Cliente',
      email: 'no-es-un-email',
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeInstanceOf(Array);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('responde 400 cuando faltan campos obligatorios', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  it('devuelve usuario y token con credenciales correctas', async () => {
    const passwordHash = await bcrypt.hash('Password123', 4);
    prismaMock.user.findUnique.mockResolvedValue({ ...CLIENTE, passwordHash });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@test.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(CLIENTE.id);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    const payload = jwt.verify(res.body.data.token, env.jwtSecret);
    expect(payload.rol).toBe('CLIENTE');
  });

  it('responde 401 con contrasena incorrecta', async () => {
    const passwordHash = await bcrypt.hash('Password123', 4);
    prismaMock.user.findUnique.mockResolvedValue({ ...CLIENTE, passwordHash });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@test.com', password: 'OtraPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales invalidas');
  });

  it('responde 401 con el mismo mensaje si el usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@test.com', password: 'Password123' });

    // Mismo mensaje que con password incorrecta: no revela si el email existe
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales invalidas');
  });
});

describe('GET /api/auth/me', () => {
  it('devuelve el perfil del usuario autenticado', async () => {
    prismaMock.user.findUnique.mockResolvedValue(CLIENTE);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${firmarToken(CLIENTE)}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(CLIENTE.email);
  });

  it('responde 401 sin cabecera Authorization', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token no proporcionado');
  });

  it('responde 401 con un token mal firmado', async () => {
    const tokenFalso = jwt.sign({ id: 1 }, 'otro_secreto_que_no_es_el_de_la_app');

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenFalso}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token invalido o expirado');
  });

  it('responde 401 si el token es valido pero el usuario ya no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${firmarToken(CLIENTE)}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Usuario no encontrado');
  });
});

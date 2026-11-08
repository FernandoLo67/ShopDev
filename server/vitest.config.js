import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // config/env.js aborta el proceso si faltan estas variables.
    // Se definen aqui para que los tests corran sin un .env real.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test?schema=public',
      JWT_SECRET: 'secreto_de_pruebas_con_mas_de_32_caracteres_seguro',
      CORS_ORIGIN: 'http://localhost:5173',
    },
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js', 'src/config/**'],
    },
  },
});

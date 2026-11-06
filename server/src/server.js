import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.port, () => {
  logger.info(`Servidor corriendo en http://localhost:${env.port} [${env.nodeEnv}]`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} recibido — cerrando servidor...`);

  const forceExit = setTimeout(() => {
    logger.error('Cierre forzado por timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close(async () => {
    await prisma.$disconnect();
    clearTimeout(forceExit);
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

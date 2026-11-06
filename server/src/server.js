import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.port, () => {
  logger.info(`Servidor en http://localhost:${env.port}`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Servidor cerrado correctamente.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

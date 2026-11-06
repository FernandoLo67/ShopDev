import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', timestamp, database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'error', timestamp, database: 'disconnected' });
  }
});

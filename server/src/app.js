import express from 'express';
import path from 'node:path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use('/uploads', express.static(path.resolve('uploads'), { index: false, dotfiles: 'deny' }));
app.use(cors({ origin: env.corsOrigin }));
// Sin logging HTTP en tests para no ensuciar la salida del test runner
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
}
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.isProd ? 100 : 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;

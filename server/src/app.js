import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 1. Deshabilitar x-powered-by
app.disable('x-powered-by');

// 2. Helmet (config por defecto)
app.use(helmet());

// 3. CORS
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// 4. Morgan (logging HTTP)
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// 5. Parser JSON
app.use(express.json({ limit: '1mb' }));

// 6. Parser URL-encoded
app.use(express.urlencoded({ extended: true }));

// 7. Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.isProd ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 8. Rutas
app.use('/api', routes);

// 9. Ruta no encontrada
app.use(notFound);

// 10. Manejador de errores
app.use(errorHandler);

export default app;

import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Variables de entorno obligatorias no definidas: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  get isProd() {
    return this.nodeEnv === 'production';
  },
  get isDev() {
    return this.nodeEnv === 'development';
  },
});

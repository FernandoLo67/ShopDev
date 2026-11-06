import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: La variable de entorno DATABASE_URL es obligatoria.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('ERROR: La variable de entorno JWT_SECRET es obligatoria.');
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
  isProd: process.env.NODE_ENV === 'production',
});

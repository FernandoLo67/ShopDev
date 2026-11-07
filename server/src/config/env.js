import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Variables de entorno obligatorias no definidas: ${missing.join(', ')}`);
  process.exit(1);
}

const VALID_ENVS = ['development', 'production', 'test'];
const nodeEnv = process.env.NODE_ENV || 'production';
if (!VALID_ENVS.includes(nodeEnv)) {
  console.error(`NODE_ENV invalido: "${process.env.NODE_ENV}". Valores validos: ${VALID_ENVS.join(', ')}`);
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  console.error('JWT_SECRET debe tener al menos 32 caracteres');
  process.exit(1);
}
if (jwtSecret === 'cambia_esto_por_un_secreto_largo_de_32_caracteres_minimo') {
  console.error('JWT_SECRET contiene el valor placeholder. Genera un secreto seguro.');
  process.exit(1);
}

export const env = Object.freeze({
  nodeEnv,
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
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

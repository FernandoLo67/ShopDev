const timestamp = () => new Date().toISOString();

// En los tests los logs de warn/error son ruido esperado: muchos casos
// comprueban justamente rutas de fallo. Se silencian para que la salida
// del test runner sea legible.
const silenciado = () => process.env.NODE_ENV === 'test';

export const logger = {
  info: (...args) => {
    if (!silenciado()) console.log(`[${timestamp()}] INFO `, ...args);
  },
  warn: (...args) => {
    if (!silenciado()) console.warn(`[${timestamp()}] WARN `, ...args);
  },
  error: (...args) => {
    if (!silenciado()) console.error(`[${timestamp()}] ERROR`, ...args);
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production' && !silenciado()) {
      console.debug(`[${timestamp()}] DEBUG`, ...args);
    }
  },
};

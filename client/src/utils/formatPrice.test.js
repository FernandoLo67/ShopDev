import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formatea un numero como moneda', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50');
  });

  it('acepta el string que devuelve Prisma para los campos Decimal', () => {
    expect(formatPrice('89.99')).toBe('$89.99');
  });

  it('siempre muestra dos decimales', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('redondea a dos decimales', () => {
    expect(formatPrice(1.005)).toBe('$1.01');
  });

  it('agrupa los miles con coma', () => {
    expect(formatPrice(1000000)).toBe('$1,000,000.00');
  });
});

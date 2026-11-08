import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderStatusBadge from './OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it.each([
    ['PENDIENTE', 'Pendiente', 'bg-yellow-100'],
    ['PAGADO', 'Pagado', 'bg-green-100'],
    ['ENVIADO', 'Enviado', 'bg-blue-100'],
  ])('muestra %s con su etiqueta y color', (status, etiqueta, clase) => {
    render(<OrderStatusBadge status={status} />);

    const badge = screen.getByText(etiqueta);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(clase);
  });

  it('usa el estilo de PENDIENTE para un estado desconocido', () => {
    render(<OrderStatusBadge status="RARO" />);

    // Sin etiqueta traducida, muestra el valor crudo pero no rompe
    expect(screen.getByText('RARO')).toHaveClass('bg-yellow-100');
  });

  it('no rompe si no recibe status', () => {
    expect(() => render(<OrderStatusBadge />)).not.toThrow();
  });
});

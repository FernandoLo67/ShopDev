import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('muestra el titulo', () => {
    render(<EmptyState title="Tu carrito esta vacio" />);

    expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument();
  });

  it('muestra la descripcion cuando se pasa', () => {
    render(<EmptyState title="Sin resultados" description="Prueba con otros filtros" />);

    expect(screen.getByText('Prueba con otros filtros')).toBeInTheDocument();
  });

  it('omite la descripcion cuando no se pasa', () => {
    render(<EmptyState title="Sin resultados" />);

    expect(screen.queryByText('Prueba con otros filtros')).not.toBeInTheDocument();
  });

  it('renderiza la accion cuando se pasa', () => {
    render(<EmptyState title="Sin pedidos" action={<button>Ver productos</button>} />);

    expect(screen.getByRole('button', { name: 'Ver productos' })).toBeInTheDocument();
  });

  it('el icono queda oculto para lectores de pantalla', () => {
    const { container } = render(<EmptyState title="Sin datos" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('cae en el icono por defecto si el nombre no existe', () => {
    expect(() =>
      render(<EmptyState icon="no-existe" title="Sin datos" />)
    ).not.toThrow();
  });
});

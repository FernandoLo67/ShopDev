import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('no renderiza nada con una sola pagina', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('no renderiza nada si totalPages no esta definido', () => {
    const { container } = render(<Pagination page={1} onPageChange={() => {}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra todas las paginas cuando son pocas', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('deshabilita Anterior en la primera pagina', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('deshabilita Siguiente en la ultima pagina', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled();
  });

  it('colapsa las paginas intermedias con puntos suspensivos', () => {
    render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);

    expect(screen.getAllByText('...')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    // Vecinas de la pagina actual
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument();
  });

  it('avisa con el numero de pagina al hacer clic', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('Anterior y Siguiente navegan en relacion a la pagina actual', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

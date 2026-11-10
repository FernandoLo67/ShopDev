import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

const Formulario = ({ onClose = () => {}, isOpen = true }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Nuevo producto"
    footer={<button type="button">Guardar</button>}
  >
    <input aria-label="Nombre" />
    <input aria-label="Precio" />
  </Modal>
);

// Reproduce el uso real: un boton que abre el modal y un onClose nuevo en cada render
const ConDisparador = () => {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Abrir
      </button>
      <Modal isOpen={abierto} onClose={() => setAbierto(false)} title="Editar">
        <input aria-label="Campo" />
      </Modal>
    </>
  );
};

describe('Modal', () => {
  it('no renderiza nada cuando esta cerrado', () => {
    render(<Formulario isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se anuncia como dialogo modal con el titulo como nombre accesible', () => {
    render(<Formulario />);

    const dialogo = screen.getByRole('dialog', { name: 'Nuevo producto' });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
  });

  it('mueve el foco al primer campo del contenido al abrirse', () => {
    render(<Formulario />);

    expect(screen.getByLabelText('Nombre')).toHaveFocus();
  });

  it('cierra con Escape', async () => {
    const onClose = vi.fn();
    render(<Formulario onClose={onClose} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer clic en el fondo', async () => {
    const onClose = vi.fn();
    const { container } = render(<Formulario onClose={onClose} />);

    await userEvent.click(container.querySelector('[role="presentation"]'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra con el boton de la esquina', async () => {
    const onClose = vi.fn();
    render(<Formulario onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('trampa de foco', () => {
    it('Tab desde el ultimo elemento vuelve al primero', async () => {
      render(<Formulario />);
      screen.getByRole('button', { name: 'Guardar' }).focus();

      await userEvent.tab();

      expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
    });

    it('Shift+Tab desde el primer elemento salta al ultimo', async () => {
      render(<Formulario />);
      screen.getByRole('button', { name: 'Cerrar' }).focus();

      await userEvent.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Guardar' })).toHaveFocus();
    });

    it('el foco no se escapa a la pagina de detras', async () => {
      render(
        <>
          <button type="button">Detras</button>
          <Formulario />
        </>
      );

      for (let i = 0; i < 6; i += 1) {
        await userEvent.tab();
        expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
      }
    });
  });

  describe('scroll de la pagina', () => {
    it('se bloquea mientras el modal esta abierto y se restaura al cerrar', () => {
      document.body.style.overflow = 'auto';
      const { rerender } = render(<Formulario />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Formulario isOpen={false} />);

      expect(document.body.style.overflow).toBe('auto');
      document.body.style.overflow = '';
    });

    it('se restaura tambien si el modal se desmonta abierto', () => {
      document.body.style.overflow = '';
      const { unmount } = render(<Formulario />);

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('foco al cerrar', () => {
    it('devuelve el foco al boton que abrio el modal', async () => {
      render(<ConDisparador />);
      const disparador = screen.getByRole('button', { name: 'Abrir' });

      await userEvent.click(disparador);
      expect(screen.getByLabelText('Campo')).toHaveFocus();

      await userEvent.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(disparador).toHaveFocus();
    });
  });

  // Regresion: los llamadores pasan un onClose nuevo en cada render. Si el efecto
  // dependiera de onClose, el foco volveria al primer campo con cada tecla.
  it('no le quita el foco al usuario mientras escribe en un campo', async () => {
    const Controlado = () => {
      const [texto, setTexto] = useState('');
      return (
        <Modal isOpen onClose={() => setTexto('')} title="Escribir">
          <input aria-label="Primero" />
          <input aria-label="Segundo" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </Modal>
      );
    };
    render(<Controlado />);

    await userEvent.click(screen.getByLabelText('Segundo'));
    await userEvent.keyboard('hola');

    expect(screen.getByLabelText('Segundo')).toHaveValue('hola');
    expect(screen.getByLabelText('Segundo')).toHaveFocus();
  });
});

import { useEffect, useId, useRef } from 'react';

const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusables = (root) => (root ? [...root.querySelectorAll(FOCUSABLES)] : []);

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);

  // Los llamadores pasan un onClose nuevo en cada render. Se guarda en una
  // ref para que el efecto de abajo dependa solo de isOpen: si dependiera de
  // onClose, el foco se movería al primer campo con cada tecla pulsada.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const elementoPrevio = document.activeElement;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco inicial: el primer campo del contenido; si no hay, el primer
    // elemento enfocable; y si tampoco, el propio dialogo.
    const inicial =
      getFocusables(bodyRef.current)[0] ||
      getFocusables(dialogRef.current)[0] ||
      dialogRef.current;
    inicial?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (e.key !== 'Tab') return;

      // Trampa de foco: Tab y Shift+Tab dan la vuelta dentro del dialogo.
      const enfocables = getFocusables(dialogRef.current);
      if (enfocables.length === 0) {
        e.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;
      const dentro = dialogRef.current?.contains(activo);

      if (e.shiftKey && (activo === primero || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (activo === ultimo || !dentro)) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflowPrevio;
      // Devuelve el foco a lo que lo tenia antes de abrir el modal
      if (elementoPrevio && typeof elementoPrevio.focus === 'function' && document.contains(elementoPrevio)) {
        elementoPrevio.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onCloseRef.current?.()}
        role="presentation"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div ref={bodyRef} className="px-5 py-4 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

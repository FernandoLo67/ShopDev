const ICONS = {
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  search:
    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  alert:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

/**
 * Estado vacio consistente para toda la app: icono, titulo, descripcion
 * opcional y una accion opcional (boton o Link).
 */
export default function EmptyState({
  icon = 'box',
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={ICONS[icon] || ICONS.box}
          />
        </svg>
      </div>
      <p className="text-gray-900 text-lg font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

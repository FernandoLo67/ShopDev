/**
 * Bloque base de carga. Reserva el espacio que ocupara el contenido real
 * para evitar saltos de layout cuando llegan los datos.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

/** Placeholder con la misma altura que una ProductCard real. */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Rejilla de ProductCardSkeleton. Las clases de columnas se pasan desde la
 * pagina para que coincidan exactamente con la rejilla real.
 */
export function ProductGridSkeleton({
  count = 6,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
}) {
  return (
    <div className={className} role="status" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
      <span className="sr-only">Cargando productos...</span>
    </div>
  );
}

/** Placeholder para la pagina de detalle de producto. */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" role="status" aria-label="Cargando producto">
      <Skeleton className="h-4 w-56 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="w-full aspect-square rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-40" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-12 w-full md:w-48 rounded-lg" />
        </div>
      </div>
      <span className="sr-only">Cargando producto...</span>
    </div>
  );
}

/** Placeholder para listas tipo pedido o fila de resumen. */
export function ListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Cargando">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

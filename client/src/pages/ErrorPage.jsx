import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';

/**
 * Pantalla de error global. React Router la monta cuando una ruta falla
 * al cargar o cuando un componente hijo lanza una excepcion al renderizar,
 * en lugar de dejar la pagina en blanco.
 */
export default function ErrorPage() {
  const error = useRouteError();

  const esRuta404 = isRouteErrorResponse(error) && error.status === 404;

  const titulo = esRuta404 ? 'Pagina no encontrada' : 'Algo salio mal';
  const etiqueta = isRouteErrorResponse(error) ? `Error ${error.status}` : 'Error inesperado';
  const descripcion = esRuta404
    ? 'La pagina que buscas no existe o fue movida.'
    : 'Ocurrio un error al cargar esta seccion. Puedes intentar recargar la pagina.';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-lg w-full text-center">
        <p className="text-brand-600 text-sm font-semibold uppercase tracking-wide mb-2">
          {etiqueta}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{titulo}</h1>
        <p className="text-lg text-gray-500 mb-8">{descripcion}</p>

        {/* El detalle tecnico solo se muestra en desarrollo */}
        {import.meta.env.DEV && error && !esRuta404 && (
          <pre className="text-left text-xs bg-white border border-gray-200 rounded-lg p-4 mb-8 overflow-x-auto text-red-600">
            {error.message || String(error)}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            Volver al inicio
          </Link>
          {!esRuta404 && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Recargar pagina
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <p className="text-brand-600 text-sm font-semibold uppercase tracking-wide mb-2">Error 404</p>
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Pagina no encontrada</h1>
      <p className="text-lg text-gray-500 mb-8">La pagina que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-brand-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          ShopDev
        </Link>
        <nav>{/* Navegacion - Fase 2 */}</nav>
      </div>
    </header>
  );
}

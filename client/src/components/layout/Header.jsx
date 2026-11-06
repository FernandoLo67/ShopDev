import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-brand-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-brand-100 transition-colors">
          ShopDev
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {/* Fase 2: enlaces de navegacion */}
        </nav>
      </div>
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-brand-600 text-white shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-brand-100 transition-colors flex-shrink-0"
        >
          ShopDev
        </Link>

        {/* Busqueda - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 pr-10 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Lado derecho - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {/* Carrito */}
          <Link to="/carrito" className="relative p-2 hover:text-brand-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:text-brand-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium">{user.nombre}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/perfil"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mi perfil
                  </Link>
                  {user.rol === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-brand-600 hover:bg-gray-100 border-b border-gray-200"
                    >
                      Panel admin
                    </Link>
                  )}
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mis pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Cerrar sesion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium hover:text-brand-200 transition-colors"
              >
                Iniciar sesion
              </Link>
              <Link
                to="/registro"
                className="px-4 py-2 bg-white text-brand-600 text-sm font-medium rounded-lg hover:bg-brand-50 transition-colors"
              >
                Registrate
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: carrito + hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/carrito" className="relative p-2 hover:text-brand-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:text-brand-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-brand-700 border-t border-brand-500">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none"
              />
            </form>
            <nav className="space-y-1">
              <Link
                to="/productos"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm"
              >
                Productos
              </Link>
              {user ? (
                <>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm"
                  >
                    Mi perfil
                  </Link>
                  {user.rol === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm font-medium border-b border-brand-500"
                    >
                      Panel admin
                    </Link>
                  )}
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm"
                  >
                    Mis pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-brand-600 text-sm text-red-300"
                  >
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-brand-600 text-sm"
                  >
                    Registrate
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

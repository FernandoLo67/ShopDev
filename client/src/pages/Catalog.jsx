import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/ui/ProductCard';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page: currentPage, limit: 12 };
    if (currentCategory) params.category = currentCategory;
    if (currentSearch) params.search = currentSearch;
    if (currentMinPrice) params.minPrice = currentMinPrice;
    if (currentMaxPrice) params.maxPrice = currentMaxPrice;

    getProducts(params)
      .then((res) => {
        setProducts(res.data || []);
        setPagination(res.pagination || {});
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentMinPrice, currentMaxPrice, currentPage]);

  // Sync local inputs when URL params change externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handlePriceFilter = () => {
    updateFilters({ minPrice, maxPrice });
  };

  const handleCategoryClick = (slug) => {
    updateFilters({ category: slug === currentCategory ? '' : slug });
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Productos</h1>

      {/* Mobile filter toggle */}
      <button
        className="md:hidden mb-4 flex items-center gap-2 text-brand-600 font-medium"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside
          className={`md:w-64 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden md:block'}`}
        >
          {/* Buscar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm"
              >
                Ir
              </button>
            </div>
          </form>

          {/* Categorias */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Categorias
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.slug
                        ? 'bg-brand-100 text-brand-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Rango de precio */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Rango de precio
            </h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron productos
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                page={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

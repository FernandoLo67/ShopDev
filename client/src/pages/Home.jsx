import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/ui/ProductCard';
import Spinner from '../components/ui/Spinner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts({ limit: 4 }), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tu tienda online de confianza
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-2xl">
            Encuentra los mejores productos con los mejores precios. Envio
            rapido y seguro a todo el pais.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-white text-brand-600 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </section>

      {/* Categorias */}
      {!loading && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/productos?category=${cat.slug}`}
                className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-40"
              >
                {cat.imagen ? (
                  <img
                    src={cat.imagen}
                    alt={cat.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {cat.nombre}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Productos destacados
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCantidad(1);
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    try {
      setAdding(true);
      await addItem(product.id, cantidad, product);
      addToast(`${product.nombre} agregado al carrito`, 'success');
    } catch {
      addToast('Error al agregar al carrito', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h1>
        <Link to="/productos" className="text-brand-600 hover:text-brand-700">
          Volver al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link to="/productos" className="hover:text-brand-600">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div>
          {product.imagenUrl ? (
            <img
              src={product.imagenUrl}
              alt={product.nombre}
              className="w-full rounded-lg shadow-md object-cover aspect-square"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Detalles */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.nombre}
          </h1>

          {product.category && (
            <Link
              to={`/productos?category=${product.category.slug}`}
              className="inline-block text-sm text-brand-600 hover:text-brand-700 mb-4"
            >
              {product.category.nombre}
            </Link>
          )}

          <p className="text-3xl font-bold text-brand-600 mb-6">
            {formatPrice(product.precio)}
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.descripcion}
          </p>

          <p
            className={`text-sm mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {product.stock > 0
              ? `${product.stock} unidades disponibles`
              : 'Agotado'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">
                Cantidad:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() =>
                    setCantidad(Math.min(product.stock, cantidad + 1))
                  }
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={handleAdd}
            disabled={product.stock === 0}
            loading={adding}
            size="lg"
            className="w-full md:w-auto"
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </div>
  );
}

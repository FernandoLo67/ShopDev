import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addItem(product.id, 1, product);
      addToast(`${product.nombre} agregado al carrito`, 'success');
    } catch {
      addToast('Error al agregar al carrito', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/productos/${product.id}`}>
        {product.imagenUrl ? (
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/productos/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1">
            {product.nombre}
          </h3>
        </Link>
        <p className="text-brand-600 font-bold text-lg mt-1">
          {formatPrice(product.precio)}
        </p>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || adding}
          className="mt-3 w-full bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {product.stock === 0 ? 'Agotado' : adding ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

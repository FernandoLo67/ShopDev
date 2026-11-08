import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { resolveImageUrl } from '../utils/imageUrl';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function CartPage() {
  const { items, total, loading, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRemove = async (item) => {
    try {
      await removeItem(item.id);
      addToast('Producto eliminado del carrito', 'info');
    } catch {
      addToast('Error al eliminar producto', 'error');
    }
  };

  const handleQuantityChange = async (item, newCantidad) => {
    if (newCantidad < 1) return;
    try {
      await updateItem(item.id, newCantidad);
    } catch {
      addToast('Error al actualizar cantidad', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Carrito de compras
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Tu carrito esta vacio</p>
          <Link
            to="/productos"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div>
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border"
              >
                {/* Imagen */}
                {item.product?.imagenUrl ? (
                  <img
                    src={resolveImageUrl(item.product.imagenUrl)}
                    alt={item.product.nombre}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-xs">Sin imagen</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.product?.nombre || `Producto #${item.productId}`}
                  </h3>
                  <p className="text-brand-600 font-semibold">
                    {formatPrice(item.product?.precio || 0)}
                  </p>
                </div>

                {/* Cantidad */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      handleQuantityChange(item, item.cantidad - 1)
                    }
                    className="px-2 py-1 hover:bg-gray-100 text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-gray-300 text-sm min-w-[2.5rem] text-center">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item, item.cantidad + 1)
                    }
                    className="px-2 py-1 hover:bg-gray-100 text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <p className="font-semibold text-gray-900 min-w-[5rem] text-right">
                  {formatPrice((item.product?.precio || 0) * item.cantidad)}
                </p>

                {/* Eliminar */}
                <button
                  onClick={() => handleRemove(item)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-brand-600">{formatPrice(total)}</span>
            </div>
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => {
                if (!user) {
                  navigate('/login', {
                    state: {
                      from: '/checkout',
                      message: 'Inicia sesion para continuar',
                    },
                  });
                } else {
                  navigate('/checkout');
                }
              }}
            >
              Proceder al pago
            </Button>
            <Link
              to="/productos"
              className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium mt-3"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/mis-pedidos">
          <Button variant="outline">Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedido #{order.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.estado} />
      </div>

      {/* Items del pedido */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Productos</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center gap-4 p-4"
            >
              {/* Imagen */}
              {(item.producto?.imagenUrl || item.product?.imagenUrl) ? (
                <img
                  src={item.producto?.imagenUrl || item.product?.imagenUrl}
                  alt={item.producto?.nombre || item.product?.nombre}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-xs">Sin imagen</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.producto?.nombre || item.product?.nombre || 'Producto'}
                </p>
                <p className="text-sm text-gray-500">
                  {item.cantidad} x {formatPrice(item.precioUnitario)}
                </p>
              </div>

              {/* Subtotal */}
              <p className="font-semibold text-gray-900 flex-shrink-0">
                {formatPrice(item.precioUnitario * item.cantidad)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-brand-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Boton volver */}
      <Link to="/mis-pedidos">
        <Button variant="outline">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a mis pedidos
        </Button>
      </Link>
    </div>
  );
}

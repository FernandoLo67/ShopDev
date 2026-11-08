import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          to="/productos"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Icono de check */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pedido realizado con exito
        </h1>
        <p className="text-gray-500">Gracias por tu compra</p>
      </div>

      {/* Detalles del pedido */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <p className="text-sm text-gray-500">Numero de pedido</p>
            <p className="text-lg font-bold text-gray-900">#{order.id}</p>
          </div>
          <OrderStatusBadge status={order.estado} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-semibold text-brand-600">
              {formatPrice(order.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">
                    {item.producto?.nombre || item.product?.nombre || `Producto`}
                  </p>
                  <p className="text-gray-500">
                    {item.cantidad} x {formatPrice(item.precioUnitario)}
                  </p>
                </div>
                <p className="font-medium text-gray-900 flex-shrink-0 ml-4">
                  {formatPrice(item.precioUnitario * item.cantidad)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de accion */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/mis-pedidos" className="flex-1">
          <Button variant="primary" className="w-full">
            Ver mis pedidos
          </Button>
        </Link>
        <Link to="/productos" className="flex-1">
          <Button variant="outline" className="w-full">
            Seguir comprando
          </Button>
        </Link>
      </div>
    </div>
  );
}

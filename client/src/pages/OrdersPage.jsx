import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import OrderStatusBadge from '../components/ui/OrderStatusBadge';
import { ListSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'ENVIADO', label: 'Enviado' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchOrders = useCallback(async (page = 1, estado = '') => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 10 };
      if (estado) params.estado = estado;
      const res = await getOrders(params);
      setOrders(res.data || []);
      setPagination({
        page: res.pagination?.page || 1,
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [fetchOrders, statusFilter]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handlePageChange = (newPage) => {
    fetchOrders(newPage, statusFilter);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis pedidos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : error ? (
        <EmptyState
          icon="alert"
          title="No pudimos cargar tus pedidos"
          description={error}
          action={
            <Button onClick={() => fetchOrders(1, statusFilter)}>Reintentar</Button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={
            statusFilter
              ? `No tienes pedidos en estado ${statusFilter.toLowerCase()}`
              : 'No tienes pedidos aun'
          }
          description={
            statusFilter
              ? 'Prueba con otro filtro para ver el resto de tus pedidos.'
              : 'Cuando completes una compra, tus pedidos apareceran aqui.'
          }
          action={
            statusFilter ? (
              <Button variant="outline" onClick={() => handleFilterChange('')}>
                Ver todos
              </Button>
            ) : (
              <Link
                to="/productos"
                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
              >
                Explorar productos
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Lista de pedidos */}
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.items?.length || 0;
              return (
                <Link
                  key={order.id}
                  to={`/mis-pedidos/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <OrderStatusBadge status={order.estado} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' · '}
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-brand-600">
                        {formatPrice(order.total)}
                      </p>
                      <svg
                        className="w-5 h-5 text-gray-400 hidden sm:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Paginacion */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

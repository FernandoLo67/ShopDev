import { useState, useEffect, useCallback } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'ENVIADO', label: 'Enviado' },
];

const STATUS_OPTIONS = ['PENDIENTE', 'PAGADO', 'ENVIADO'];

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.estado = statusFilter;
      const res = await getAllOrders(params);
      setOrders(res.data || []);
      setPagination({
        page: res.pagination?.page || 1,
        totalPages: res.pagination?.totalPages || 1,
      });
    } catch (err) {
      addToast(err.message, 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (value) => {
    setPage(1);
    setStatusFilter(value);
  };

  const handleStatusChange = async (order, estado) => {
    if (estado === order.estado) return;
    try {
      setUpdatingId(order.id);
      await updateOrderStatus(order.id, estado);
      addToast(`Pedido #${order.id} actualizado a ${estado}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'id',
      label: '#',
      render: (row) => <span className="font-medium text-gray-900">#{row.id}</span>,
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {row.user?.nombre || 'Usuario eliminado'}
          </p>
          <p className="text-xs text-gray-500 truncate">{row.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (row) => row.items?.length || 0,
    },
    { key: 'total', label: 'Total', render: (row) => formatPrice(row.total) },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => <OrderStatusBadge status={row.estado} />,
    },
    {
      key: 'acciones',
      label: 'Cambiar estado',
      render: (row) => (
        <select
          value={row.estado}
          disabled={updatingId === row.id}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(row, e.target.value);
          }}
          className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>

      <div className="flex flex-wrap gap-2">
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

      <Table
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No hay pedidos registrados"
        onRowClick={(row) => setSelected(row)}
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Pedido #${selected.id}` : ''}
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            Cerrar
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {new Date(selected.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <OrderStatusBadge status={selected.estado} />
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Cliente
              </p>
              <p className="text-sm font-medium text-gray-900">
                {selected.user?.nombre || 'Usuario eliminado'}
              </p>
              <p className="text-xs text-gray-500">{selected.user?.email || '-'}</p>
            </div>

            <ul className="divide-y divide-gray-100">
              {(selected.items || []).map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {item.product?.imagenUrl ? (
                    <img
                      src={resolveImageUrl(item.product.imagenUrl)}
                      alt={item.product?.nombre}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.nombre || 'Producto eliminado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.cantidad} x {formatPrice(item.precioUnitario)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(Number(item.precioUnitario) * item.cantidad)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg font-bold text-brand-600">
                {formatPrice(selected.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

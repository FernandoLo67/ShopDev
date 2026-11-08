import { useState, useEffect } from 'react';
import { getProducts } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getAllOrders, getOrderStats } from '../../api/orders';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatPrice';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';

const ORDER_STATES = [
  { value: 'PENDIENTE', label: 'Pendiente', bar: 'bg-yellow-500' },
  { value: 'PAGADO', label: 'Pagado', bar: 'bg-green-500' },
  { value: 'ENVIADO', label: 'Enviado', bar: 'bg-blue-500' },
];

const ICONS = {
  productos: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  categorias: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  usuarios: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  pedidos: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  ingresos: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 9v1m0-9a3 3 0 00-3 2m9 1a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  stock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
};

export default function Dashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    products: 0,
    categories: 0,
    users: 0,
    orders: 0,
    ingresos: 0,
    sinStock: 0,
  });
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
          getOrderStats(),
          getProducts({ limit: 100 }),
          getCategories(),
          getAllOrders({ limit: 5 }),
        ]);
        if (!active) return;

        const stats = statsRes.data || {};
        const products = productsRes.data || [];
        const categories = categoriesRes.data || [];

        setTotals({
          products: stats.totalProductos ?? products.length,
          categories: categories.length,
          users: stats.totalUsuarios ?? 0,
          orders: stats.totalPedidos ?? 0,
          ingresos: stats.ingresosTotales ?? 0,
          sinStock: stats.productosSinStock ?? 0,
        });

        const counts = new Map(categories.map((cat) => [cat.nombre, 0]));
        products.forEach((product) => {
          const name = product.category?.nombre || 'Sin categoria';
          counts.set(name, (counts.get(name) || 0) + 1);
        });
        setProductsByCategory(
          [...counts.entries()]
            .map(([nombre, count]) => ({ nombre, count }))
            .sort((a, b) => b.count - a.count)
        );

        setOrdersByStatus(
          ORDER_STATES.map((state) => ({
            ...state,
            count: stats.pedidosPorEstado?.[state.value] ?? 0,
          }))
        );

        // El backend ya devuelve los pedidos ordenados por fecha descendente
        setRecentOrders(ordersRes.data || []);
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const maxCategoryCount = Math.max(1, ...productsByCategory.map((item) => item.count));
  const maxStatusCount = Math.max(1, ...ordersByStatus.map((item) => item.count));

  const columns = [
    { key: 'id', label: '#', render: (row) => `#${row.id}` },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (row) => (
        <span className="truncate">{row.user?.nombre || 'Usuario eliminado'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES'),
    },
    { key: 'total', label: 'Total', render: (row) => formatPrice(row.total) },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => <OrderStatusBadge status={row.estado} />,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Ingresos totales" value={formatPrice(totals.ingresos)} icon={ICONS.ingresos} />
        <StatCard label="Total pedidos" value={totals.orders} icon={ICONS.pedidos} />
        <StatCard label="Total usuarios" value={totals.users} icon={ICONS.usuarios} />
        <StatCard label="Total productos" value={totals.products} icon={ICONS.productos} />
        <StatCard label="Total categorias" value={totals.categories} icon={ICONS.categorias} />
        <StatCard label="Productos sin stock" value={totals.sinStock} icon={ICONS.stock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Productos por categoria
          </h3>
          {productsByCategory.length === 0 ? (
            <p className="text-sm text-gray-500">No hay datos disponibles</p>
          ) : (
            <ul className="space-y-3">
              {productsByCategory.map((item) => (
                <li key={item.nombre}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{item.nombre}</span>
                    <span className="text-gray-500 font-medium ml-2">{item.count}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Pedidos por estado</h3>
          <ul className="space-y-3">
            {ordersByStatus.map((item) => (
              <li key={item.value}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-500 font-medium ml-2">{item.count}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.bar}`}
                    style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Ultimos pedidos</h3>
        <Table columns={columns} data={recentOrders} emptyMessage="No hay pedidos registrados" />
      </section>
    </div>
  );
}

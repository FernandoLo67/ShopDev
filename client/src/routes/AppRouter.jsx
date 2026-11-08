import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';
import AdminRoute from '../components/admin/AdminRoute';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmation from '../pages/OrderConfirmation';
import OrdersPage from '../pages/OrdersPage';
import OrderDetail from '../pages/OrderDetail';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'productos', element: <Catalog /> },
      { path: 'productos/:id', element: <ProductDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'registro', element: <Register /> },
      { path: 'carrito', element: <CartPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'pedido-confirmado/:orderId', element: <OrderConfirmation /> },
          { path: 'mis-pedidos', element: <OrdersPage /> },
          { path: 'mis-pedidos/:id', element: <OrderDetail /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'productos', element: <AdminProducts /> },
          { path: 'categorias', element: <AdminCategories /> },
          { path: 'pedidos', element: <AdminOrders /> },
          { path: 'usuarios', element: <AdminUsers /> },
        ],
      },
    ],
  },
]);

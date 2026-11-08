import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
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
]);

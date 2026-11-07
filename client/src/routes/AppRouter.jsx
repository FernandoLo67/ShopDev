import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CartPage from '../pages/CartPage';
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
      { path: '*', element: <NotFound /> },
    ],
  },
]);

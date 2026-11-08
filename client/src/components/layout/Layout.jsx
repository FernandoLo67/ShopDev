import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SessionWatcher from '../auth/SessionWatcher';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';

export default function Layout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <SessionWatcher />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          {/* Vuelve arriba al navegar y recuerda la posicion al usar atras */}
          <ScrollRestoration />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

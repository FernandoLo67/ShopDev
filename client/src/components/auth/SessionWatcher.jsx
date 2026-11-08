import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

/**
 * Escucha el evento que emite el interceptor de axios cuando el backend
 * responde 401 y avisa al usuario. AuthContext ya limpio la sesion; aqui
 * solo mostramos el toast y, si la ruta era privada, llevamos al login.
 *
 * Va dentro de ToastProvider porque AuthContext lo envuelve y no puede
 * usar useToast desde arriba del arbol.
 */
const RUTAS_PRIVADAS = ['/checkout', '/mis-pedidos', '/pedido-confirmado', '/admin'];

export default function SessionWatcher() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const manejar = () => {
      addToast('Tu sesion expiro. Inicia sesion de nuevo', 'warning', 5000);

      const esPrivada = RUTAS_PRIVADAS.some((ruta) =>
        location.pathname.startsWith(ruta)
      );

      if (esPrivada) {
        navigate('/login', {
          replace: true,
          state: { from: location.pathname, message: 'Tu sesion expiro' },
        });
      }
    };

    window.addEventListener('auth:sesion-expirada', manejar);
    return () => window.removeEventListener('auth:sesion-expirada', manejar);
  }, [addToast, navigate, location.pathname]);

  return null;
}

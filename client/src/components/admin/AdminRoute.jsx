import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        state={{ from: location.pathname, message: 'Inicia sesion para continuar' }}
        replace
      />
    );
  }

  if (user.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

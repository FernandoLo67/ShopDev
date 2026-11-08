import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-40 mb-8" />
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-56" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const campos = [
    { label: 'Nombre', value: user.nombre },
    { label: 'Correo electronico', value: user.email },
    {
      label: 'Tipo de cuenta',
      value: user.rol === 'ADMIN' ? 'Administrador' : 'Cliente',
    },
    {
      label: 'Miembro desde',
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No disponible',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi perfil</h1>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {user.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">{user.nombre}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100">
          {campos.map((campo) => (
            <div
              key={campo.label}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
            >
              <dt className="text-sm text-gray-500 sm:w-48 flex-shrink-0">{campo.label}</dt>
              <dd className="text-sm font-medium text-gray-900 break-words">{campo.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link to="/mis-pedidos" className="sm:w-auto">
          <Button className="w-full sm:w-auto">Ver mis pedidos</Button>
        </Link>
        {user.rol === 'ADMIN' && (
          <Link to="/admin" className="sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Panel de administracion
            </Button>
          </Link>
        )}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full sm:w-auto sm:ml-auto text-red-600 border-red-200 hover:bg-red-50"
        >
          Cerrar sesion
        </Button>
      </div>
    </div>
  );
}

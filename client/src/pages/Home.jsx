import { useState, useEffect } from 'react';
import { getHealth } from '../api/health';
import StatusBadge from '../components/ui/StatusBadge';

const API_STATUS = {
  LOADING: 'loading',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

export default function Home() {
  const [apiStatus, setApiStatus] = useState(API_STATUS.LOADING);

  useEffect(() => {
    getHealth()
      .then((data) => setApiStatus(data.status === 'ok' ? API_STATUS.CONNECTED : API_STATUS.DISCONNECTED))
      .catch(() => setApiStatus(API_STATUS.DISCONNECTED));
  }, []);

  const badgeVariant = {
    [API_STATUS.LOADING]: 'loading',
    [API_STATUS.CONNECTED]: 'success',
    [API_STATUS.DISCONNECTED]: 'error',
  }[apiStatus];

  const badgeLabel = {
    [API_STATUS.LOADING]: 'Verificando API...',
    [API_STATUS.CONNECTED]: 'API conectada',
    [API_STATUS.DISCONNECTED]: 'API no disponible',
  }[apiStatus];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Bienvenido a ShopDev
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Tu tienda en linea favorita.
      </p>
      <StatusBadge variant={badgeVariant}>{badgeLabel}</StatusBadge>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getHealth } from '../api/health';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('loading');

  useEffect(() => {
    getHealth()
      .then((data) => {
        if (data.status === 'ok') {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      })
      .catch(() => {
        setApiStatus('disconnected');
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Bienvenido a ShopDev
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Tu tienda en linea favorita.
      </p>
      <div className="inline-flex items-center gap-2">
        {apiStatus === 'loading' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
            Verificando API...
          </span>
        )}
        {apiStatus === 'connected' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            API conectada
          </span>
        )}
        {apiStatus === 'disconnected' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            API no disponible
          </span>
        )}
      </div>
    </div>
  );
}

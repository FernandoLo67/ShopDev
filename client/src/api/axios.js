import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Rutas donde un 401 significa "credenciales incorrectas", no "sesion expirada"
const RUTAS_PUBLICAS_AUTH = ['/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const esRutaDeAuth = RUTAS_PUBLICAS_AUTH.some((ruta) => url.includes(ruta));

    let message = error.response?.data?.message;

    if (!message) {
      if (error.code === 'ECONNABORTED') {
        message = 'La peticion tardo demasiado. Revisa tu conexion e intenta de nuevo';
      } else if (!error.response) {
        message = 'Error de conexion con el servidor';
      } else if (status >= 500) {
        message = 'Error en el servidor. Intenta de nuevo en unos momentos';
      } else if (status === 403) {
        message = 'No tienes permisos para realizar esta accion';
      } else {
        message = 'Ocurrio un error inesperado';
      }
    }

    // Sesion expirada o token invalido: limpiar y avisar a la app.
    // AuthContext escucha este evento para cerrar sesion sin recargar la pagina.
    if (status === 401 && !esRutaDeAuth && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      message = 'Tu sesion expiro. Inicia sesion de nuevo';
      window.dispatchEvent(new CustomEvent('auth:sesion-expirada'));
    }

    const normalizado = new Error(message);
    normalizado.status = status;
    return Promise.reject(normalizado);
  }
);

export default api;

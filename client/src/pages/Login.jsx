import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';
  const successMessage = location.state?.message || '';

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email no valido';
    if (!form.password) errs.password = 'La contrasena es obligatoria';
    else if (form.password.length < 6) errs.password = 'Minimo 6 caracteres';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      await login(form.email, form.password);
      addToast('Sesion iniciada correctamente', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Iniciar sesion
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Ingresa a tu cuenta para continuar
      </p>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="tu@email.com"
        />
        <Input
          label="Contrasena"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Tu contrasena"
        />
        <Button type="submit" loading={loading} className="w-full">
          Iniciar sesion
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        No tienes cuenta?{' '}
        <Link
          to="/registro"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}

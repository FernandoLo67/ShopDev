import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email no valido';
    if (!form.password) errs.password = 'La contrasena es obligatoria';
    else if (form.password.length < 6) errs.password = 'Minimo 6 caracteres';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Las contrasenas no coinciden';
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
      await register(form.nombre, form.email, form.password);
      navigate('/login', {
        state: { message: 'Registro exitoso. Inicia sesion.' },
      });
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
        Crear cuenta
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Registrate para comenzar a comprar
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          id="nombre"
          name="nombre"
          type="text"
          value={form.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Tu nombre"
        />
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
          placeholder="Minimo 6 caracteres"
        />
        <Input
          label="Confirmar contrasena"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Repite la contrasena"
        />
        <Button type="submit" loading={loading} className="w-full">
          Registrarse
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}

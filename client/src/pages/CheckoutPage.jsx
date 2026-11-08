import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../api/orders';
import { formatPrice } from '../utils/formatPrice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiration(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

function validateForm(form) {
  const errors = {};

  if (!form.titular.trim() || form.titular.trim().length < 2) {
    errors.titular = 'El titular debe tener al menos 2 caracteres';
  }

  const cardDigits = form.numeroTarjeta.replace(/\D/g, '');
  if (cardDigits.length !== 16) {
    errors.numeroTarjeta = 'El numero de tarjeta debe tener 16 digitos';
  }

  const expMatch = form.expiracion.match(/^(\d{2})\/(\d{2})$/);
  if (!expMatch) {
    errors.expiracion = 'Formato invalido (MM/YY)';
  } else {
    const month = parseInt(expMatch[1], 10);
    const year = parseInt(expMatch[2], 10) + 2000;
    if (month < 1 || month > 12) {
      errors.expiracion = 'Mes invalido';
    } else {
      const now = new Date();
      const expDate = new Date(year, month);
      if (expDate <= now) {
        errors.expiracion = 'La tarjeta esta vencida';
      }
    }
  }

  const cvvDigits = form.cvv.replace(/\D/g, '');
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    errors.cvv = 'El CVV debe tener 3 o 4 digitos';
  }

  return errors;
}

export default function CheckoutPage() {
  const { items, total, loading: cartLoading, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titular: '',
    numeroTarjeta: '',
    expiracion: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'numeroTarjeta') {
      formatted = formatCardNumber(value);
    } else if (name === 'expiracion') {
      formatted = formatExpiration(value);
    } else if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [name]: formatted }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setSubmitting(true);
      const payment = {
        titular: form.titular.trim(),
        numeroTarjeta: form.numeroTarjeta.replace(/\D/g, ''),
        expiracion: form.expiracion,
        cvv: form.cvv,
      };
      const res = await createOrder(payment);
      await clearCart();
      addToast('Pedido realizado con exito', 'success');
      navigate(`/pedido-confirmado/${res.data.id}`, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">Tu carrito esta vacio</p>
        <Link
          to="/productos"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Formulario de pago */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Datos de pago
          </h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Titular de la tarjeta"
              id="titular"
              name="titular"
              type="text"
              value={form.titular}
              onChange={handleChange}
              error={errors.titular}
              placeholder="Nombre como aparece en la tarjeta"
              autoComplete="cc-name"
            />

            <Input
              label="Numero de tarjeta"
              id="numeroTarjeta"
              name="numeroTarjeta"
              type="text"
              inputMode="numeric"
              value={form.numeroTarjeta}
              onChange={handleChange}
              error={errors.numeroTarjeta}
              placeholder="XXXX XXXX XXXX XXXX"
              autoComplete="cc-number"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiracion"
                id="expiracion"
                name="expiracion"
                type="text"
                inputMode="numeric"
                value={form.expiracion}
                onChange={handleChange}
                error={errors.expiracion}
                placeholder="MM/YY"
                autoComplete="cc-exp"
              />
              <Input
                label="CVV"
                id="cvv"
                name="cvv"
                type="password"
                inputMode="numeric"
                value={form.cvv}
                onChange={handleChange}
                error={errors.cvv}
                placeholder="***"
                autoComplete="cc-csc"
              />
            </div>

            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="w-full mt-2"
              size="lg"
            >
              Pagar ahora
            </Button>
          </form>
        </div>

        {/* Columna derecha - Resumen del pedido */}
        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumen del pedido
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 flex-1 min-w-0 truncate pr-2">
                  {item.product?.nombre || `Producto #${item.productId}`}
                  <span className="text-gray-400 ml-1">
                    x{item.cantidad}
                  </span>
                </span>
                <span className="text-gray-900 font-medium flex-shrink-0">
                  {formatPrice((item.product?.precio || 0) * item.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

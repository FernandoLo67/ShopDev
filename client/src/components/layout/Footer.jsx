import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre nosotros */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Sobre nosotros
            </h3>
            <p className="text-sm leading-relaxed">
              ShopDev es tu tienda online de confianza. Ofrecemos productos de
              calidad con los mejores precios y envio rapido a todo el pais.
            </p>
          </div>

          {/* Enlaces rapidos */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Enlaces rapidos
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/productos"
                  className="hover:text-white transition-colors"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  to="/carrito"
                  className="hover:text-white transition-colors"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Mi cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@shopdev.com</li>
              <li>Telefono: +1 (555) 123-4567</li>
              <li>Lunes a Viernes: 9:00 - 18:00</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ShopDev. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

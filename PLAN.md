# Plan de Proyecto: ShopDev - E-commerce Completo

**Stack:** React + Node.js + PostgreSQL

---

## Fase 1: Configuracion inicial del proyecto

### 1.1 Estructura del repositorio
- Crear carpeta `client/` (React con Vite)
- Crear carpeta `server/` (Node.js con Express)
- Inicializar git, `.gitignore`, variables de entorno

### 1.2 Base de datos (PostgreSQL)
- Instalar y configurar PostgreSQL
- Disenar el esquema de base de datos:
  - **users** — id, nombre, email, password_hash, rol (cliente/admin), created_at
  - **categories** — id, nombre, slug, imagen
  - **products** — id, nombre, descripcion, precio, stock, imagen_url, category_id, created_at
  - **orders** — id, user_id, total, estado (pendiente/pagado/enviado), created_at
  - **order_items** — id, order_id, product_id, cantidad, precio_unitario
  - **cart_items** — id, user_id, product_id, cantidad
- Usar Prisma como ORM

### 1.3 Configuracion del servidor
- Express con estructura MVC
- Middleware: cors, helmet, express-validator
- Conexion a PostgreSQL via Prisma
- Variables de entorno con dotenv

---

## Fase 2: Backend - Autenticacion y Usuarios

### 2.1 Registro e inicio de sesion
- `POST /api/auth/register` — crear cuenta con hash bcrypt
- `POST /api/auth/login` — devolver JWT
- `GET /api/auth/me` — perfil del usuario autenticado
- Middleware de autenticacion con JWT
- Middleware de autorizacion por rol (admin/cliente)

### 2.2 Gestion de usuarios (admin)
- `GET /api/users` — listar usuarios (solo admin)
- `PUT /api/users/:id` — editar rol/estado
- `DELETE /api/users/:id` — eliminar usuario

---

## Fase 3: Backend - Productos y Categorias

### 3.1 CRUD de categorias
- `GET /api/categories` — listar todas
- `POST /api/categories` — crear (admin)
- `PUT /api/categories/:id` — editar (admin)
- `DELETE /api/categories/:id` — eliminar (admin)

### 3.2 CRUD de productos
- `GET /api/products` — listar con paginacion
- `GET /api/products/:id` — detalle de un producto
- `GET /api/products?category=X&search=Y&minPrice=Z&maxPrice=W` — filtros y busqueda
- `POST /api/products` — crear producto (admin)
- `PUT /api/products/:id` — editar producto (admin)
- `DELETE /api/products/:id` — eliminar producto (admin)
- Subida de imagenes con multer (almacenamiento local o cloudinary)

---

## Fase 4: Backend - Carrito y Pedidos

### 4.1 Carrito de compras
- `GET /api/cart` — obtener carrito del usuario
- `POST /api/cart` — agregar producto al carrito
- `PUT /api/cart/:id` — actualizar cantidad
- `DELETE /api/cart/:id` — eliminar item del carrito

### 4.2 Pedidos y pagos simulados
- `POST /api/orders` — crear pedido desde el carrito (simula pago exitoso)
- `GET /api/orders` — historial de pedidos del usuario
- `GET /api/orders/:id` — detalle del pedido
- `PUT /api/orders/:id/status` — cambiar estado (admin)
- Logica de pago simulado: validar datos de tarjeta ficticios, siempre aprobar

---

## Fase 5: Frontend - Estructura y navegacion

### 5.1 Proyecto React
- Vite + React + React Router
- TailwindCSS para estilos responsive
- Estructura de carpetas:
  ```
  client/src/
    components/    -- componentes reutilizables
    pages/         -- paginas principales
    hooks/         -- custom hooks
    context/       -- AuthContext, CartContext
    services/      -- llamadas a la API (axios)
    layouts/       -- MainLayout, AdminLayout
  ```

### 5.2 Paginas publicas
- **Home** — hero, productos destacados, categorias
- **Catalogo** — grid de productos con filtros laterales y barra de busqueda
- **Detalle de producto** — imagen, descripcion, precio, boton "Agregar"
- **Login / Registro** — formularios con validacion

### 5.3 Navegacion y layout
- Navbar con logo "ShopDev", busqueda, icono carrito con badge, usuario
- Sidebar con: Inicio, Productos, Categorias, Favoritos, Perfil
- Footer responsive
- Menu hamburguesa en mobile

---

## Fase 6: Frontend - Carrito y Checkout

### 6.1 Carrito de compras
- Sidebar o pagina de carrito
- Lista de productos con imagen, nombre, precio, selector de cantidad
- Boton eliminar por item
- Resumen: subtotal, total
- Persistencia con Context API + API del backend

### 6.2 Checkout (pago simulado)
- Formulario con datos de envio (nombre, direccion)
- Formulario de tarjeta simulada (numero, fecha, CVV — solo validacion de formato)
- Boton "Pagar ahora" que crea el pedido
- Pantalla de confirmacion con numero de orden

---

## Fase 7: Frontend - Panel de Administrador

### 7.1 Dashboard admin
- Ruta protegida `/admin` (solo usuarios con rol admin)
- Vista general: total productos, pedidos recientes, usuarios registrados
- Graficas basicas con recharts (ventas por dia, productos por categoria)

### 7.2 Gestion desde el panel
- **Productos:** tabla con crear, editar, eliminar
- **Categorias:** tabla con crear, editar, eliminar
- **Pedidos:** tabla con filtro por estado, cambiar estado
- **Usuarios:** tabla con listado, cambiar rol

---

## Fase 8: Diseno responsive y pulido

### 8.1 Responsive
- Mobile first con TailwindCSS breakpoints
- Tarjetas de producto adaptables (1 col mobile, 2 tablet, 3-4 desktop)
- Navegacion colapsable en mobile
- Carrito como drawer en mobile

### 8.2 UX y detalles finales
- Loading skeletons mientras cargan datos
- Toasts de notificacion (producto agregado, error, etc.)
- Pagina 404
- Manejo global de errores

---

## Fase 9: Testing y Deploy

### 9.1 Testing
- Backend: tests de endpoints con Jest + Supertest
- Frontend: tests de componentes clave con Vitest

### 9.2 Deploy
- Backend: Railway o Render
- Frontend: Vercel o Netlify
- Base de datos: Neon (PostgreSQL serverless) o Railway
- Variables de entorno en produccion

---

## Orden de implementacion sugerido

| Semana | Tarea |
|--------|-------|
| 1 | Fase 1 — Setup del proyecto, base de datos, estructura |
| 2 | Fase 2 — Autenticacion y usuarios |
| 3 | Fase 3 — Productos y categorias (backend) |
| 4 | Fase 4 — Carrito y pedidos (backend) |
| 5 | Fase 5 — Frontend estructura, catalogo, detalle |
| 6 | Fase 6 — Carrito y checkout (frontend) |
| 7 | Fase 7 — Panel administrador |
| 8 | Fase 8 — Responsive, UX, pulido |
| 9 | Fase 9 — Testing y deploy |

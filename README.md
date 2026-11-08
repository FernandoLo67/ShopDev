# ShopDev

Plataforma de comercio electronico fullstack construida con React, Node.js, Express, Prisma y PostgreSQL.



## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | PostgreSQL 16 (Docker) |
| Autenticacion | JWT + bcrypt |

## Funcionalidades

- Registro e inicio de sesion con JWT
- Catalogo de productos con filtros, busqueda y paginacion
- Gestion de categorias con slugs
- Carrito de compras persistente
- Checkout con pago simulado
- Panel de administracion (CRUD productos, categorias, pedidos, usuarios)
- Subida de imagenes con validacion
- Roles de usuario (admin / cliente)
- Rate limiting y headers de seguridad

## Requisitos previos

- Node.js >= 20 LTS
- Docker y Docker Compose
- npm

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/FernandoLo67/ShopDev.git
cd ShopDev

# 2. Levantar PostgreSQL
npm run db:up

# 3. Configurar variables de entorno
cp server/.env.example server/.env
cp client/.env.example client/.env
# Editar server/.env con tus valores

# 4. Instalar dependencias
npm run install:all

# 5. Ejecutar migraciones
npm run migrate

# 6. Cargar datos iniciales
npm run seed

# 7. Iniciar desarrollo
npm run dev:server   # API en http://localhost:4000
npm run dev:client   # Cliente en http://localhost:5173
```

## Scripts disponibles

| Comando | Descripcion |
|---------|------------|
| `npm run db:up` | Levantar PostgreSQL con Docker |
| `npm run db:down` | Detener PostgreSQL |
| `npm run install:all` | Instalar dependencias de server y client |
| `npm run dev:server` | Iniciar servidor en modo desarrollo |
| `npm run dev:client` | Iniciar cliente en modo desarrollo |
| `npm run migrate` | Ejecutar migraciones de Prisma |
| `npm run seed` | Cargar datos iniciales |

## Estructura del proyecto

```
ShopDev/
├── client/                # Frontend React + Vite
│   ├── src/
│   │   ├── api/           # Configuracion de axios
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context API (auth, carrito)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Paginas principales
│   │   ├── routes/        # Configuracion de rutas
│   │   └── utils/         # Utilidades
│   └── public/
├── server/                # API REST con Express
│   ├── prisma/            # Schema y migraciones
│   └── src/
│       ├── config/        # Variables de entorno y Prisma
│       ├── controllers/   # Logica de controladores
│       ├── middlewares/   # Auth, validacion, errores
│       ├── routes/        # Definicion de rutas
│       ├── services/      # Logica de negocio
│       ├── utils/         # ApiError, logger, respuestas
│       └── validators/    # Reglas de validacion
├── docs/                  # Documentacion y recursos
├── docker-compose.yml
└── package.json           # Scripts de conveniencia
```

## API Endpoints

### Autenticacion
- `POST /api/auth/register` — Crear cuenta
- `POST /api/auth/login` — Iniciar sesion
- `GET /api/auth/me` — Perfil del usuario

### Productos
- `GET /api/products` — Listar con filtros y paginacion
- `GET /api/products/:id` — Detalle de producto
- `POST /api/products` — Crear (admin)
- `PUT /api/products/:id` — Editar (admin)
- `DELETE /api/products/:id` — Eliminar (admin)

### Categorias
- `GET /api/categories` — Listar todas
- `POST /api/categories` — Crear (admin)
- `PUT /api/categories/:id` — Editar (admin)
- `DELETE /api/categories/:id` — Eliminar (admin)

### Carrito
- `GET /api/cart` — Obtener carrito
- `POST /api/cart` — Agregar producto
- `PUT /api/cart/:itemId` — Actualizar cantidad
- `DELETE /api/cart/:itemId` — Eliminar item

### Pedidos
- `POST /api/orders` — Crear pedido desde carrito
- `GET /api/orders` — Historial de pedidos del usuario autenticado
- `GET /api/orders/all` — Todos los pedidos del sistema (admin)
- `GET /api/orders/stats` — Metricas agregadas para el dashboard (admin)
- `GET /api/orders/:id` — Detalle del pedido
- `PUT /api/orders/:id/status` — Cambiar estado (admin)

## Licencia

MIT

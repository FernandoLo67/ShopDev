# ShopDev

Plataforma de comercio electronico fullstack construida con React, Node.js, Express, Prisma y PostgreSQL.

![CI](https://github.com/FernandoLo67/ShopDev/actions/workflows/ci.yml/badge.svg)


## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | PostgreSQL 16 (Docker) |
| Autenticacion | JWT + bcrypt |
| Testing | Vitest, Supertest, React Testing Library |
| CI | GitHub Actions |

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

- Node.js >= 22 LTS (lo exige jsdom, usado en los tests del frontend)
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
| `npm test` | Ejecutar los tests de server y client |
| `npm run test:server` | Solo los tests del backend |
| `npm run test:client` | Solo los tests del frontend |
| `npm run lint:client` | Analisis estatico del frontend |
| `npm run build:client` | Compilar el frontend para produccion |

## Estructura del proyecto

```
ShopDev/
├── client/                # Frontend React + Vite
│   ├── src/
│   │   ├── api/           # Cliente axios y llamadas por recurso
│   │   ├── components/    # Componentes reutilizables (ui, layout, admin, auth)
│   │   ├── context/       # Context API (auth, carrito, toasts)
│   │   ├── pages/         # Paginas publicas y panel de admin
│   │   ├── routes/        # Configuracion de rutas
│   │   ├── test/          # Setup de Vitest
│   │   └── utils/         # Utilidades
│   └── public/
├── server/                # API REST con Express
│   ├── prisma/            # Schema, migraciones y seed
│   ├── tests/             # Tests unitarios y de integracion
│   └── src/
│       ├── config/        # Variables de entorno y Prisma
│       ├── controllers/   # Logica de controladores
│       ├── middlewares/   # Auth, validacion, errores, uploads
│       ├── routes/        # Definicion de rutas
│       ├── services/      # Logica de negocio
│       ├── utils/         # ApiError, logger, respuestas
│       └── validators/    # Reglas de validacion
├── .github/workflows/     # Integracion continua
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

## Tests

```bash
npm test                 # Backend y frontend
npm run test:server      # Solo backend
npm run test:client      # Solo frontend
```

Para ver la cobertura, desde `server/` o `client/`: `npm run test:coverage`.

**Backend** (Vitest + Supertest) — los tests de integracion levantan la app de
Express completa y sustituyen el cliente de Prisma por un mock, asi que no
necesitan una base de datos corriendo. Cubren autenticacion, autorizacion por
rol, validadores y el sobre de respuesta de la API.

**Frontend** (Vitest + React Testing Library, entorno jsdom) — cubre las
utilidades y los componentes de presentacion reutilizables.

La CI ejecuta en cada push y pull request a `master`: tests del backend,
validacion del schema de Prisma, lint, tests y build de produccion del frontend.

## Despliegue

El proyecto se despliega en tres piezas:

| Pieza | Servicio | Configuracion |
|-------|----------|---------------|
| Base de datos | Render Postgres o Neon | `render.yaml` |
| API | Render | `render.yaml` |
| Frontend | Vercel | `client/vercel.json` |

**API en Render** — `render.yaml` describe el servicio y la base de datos. El
build ejecuta `prisma generate` y `prisma migrate deploy`, y el health check
apunta a `/api/health`. `JWT_SECRET` se genera solo en el primer despliegue;
`CORS_ORIGIN` hay que definirlo a mano con el dominio final del frontend.

**Frontend en Vercel** — raiz del proyecto `client/`. El rewrite de
`vercel.json` es necesario para que las rutas profundas (`/productos/12`) no
devuelvan 404 al recargar. Define `VITE_API_URL` con la URL de la API mas
`/api`.

Variables de entorno en produccion:

| Variable | Donde | Notas |
|----------|-------|-------|
| `DATABASE_URL` | API | La inyecta Render desde la base de datos |
| `JWT_SECRET` | API | Minimo 32 caracteres |
| `CORS_ORIGIN` | API | Dominio exacto del frontend |
| `NODE_ENV` | API | `production` |
| `VITE_API_URL` | Frontend | Se incrusta en el build, no en runtime |

### Limitacion conocida

Las imagenes de productos se guardan en el disco local del servidor
(`server/uploads/`). El plan gratuito de Render usa un sistema de archivos
efimero, por lo que las imagenes subidas desde el panel de administracion se
pierden en cada despliegue. Para produccion real habria que mover la subida a
un almacenamiento de objetos (S3, Cloudinary o similar). Los productos del seed
no se ven afectados: apuntan a URLs externas.

## Licencia

MIT. Ver [LICENSE](LICENSE).

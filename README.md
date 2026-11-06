# ShopDev - E-commerce

Plataforma de comercio electronico construida con Express, Prisma, React y TailwindCSS.

## Requisitos

- Node.js >= 20 LTS
- Docker y Docker Compose
- npm

## Instalacion rapida

```bash
# 1. Levantar PostgreSQL
npm run db:up

# 2. Copiar variables de entorno
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Instalar dependencias
npm run install:all

# 4. Ejecutar migraciones (nombre: init, agregar CHECK constraints de seccion 2.2 antes de aplicar)
npm run migrate

# 5. Ejecutar seed
npm run seed

# 6. Iniciar desarrollo (en terminales separadas)
npm run dev:server
npm run dev:client
```

## Comandos

| Comando | Descripcion |
|---|---|
| `npm run db:up` | Levantar PostgreSQL con Docker |
| `npm run db:down` | Detener PostgreSQL |
| `npm run install:all` | Instalar dependencias de server y client |
| `npm run dev:server` | Iniciar servidor en modo desarrollo (puerto 4000) |
| `npm run dev:client` | Iniciar cliente en modo desarrollo (puerto 5173) |
| `npm run migrate` | Ejecutar migraciones de Prisma |
| `npm run seed` | Ejecutar seed de datos iniciales |

## Credenciales seed

| Usuario | Email | Password | Rol |
|---|---|---|---|
| Administrador | admin@shopdev.com | Admin123! | ADMIN |
| Cliente Demo | cliente@shopdev.com | Cliente123! | CLIENTE |

## Estructura

```
Proyecto/
├── server/          # API Express + Prisma
│   ├── prisma/      # Schema y migraciones
│   └── src/         # Codigo fuente del servidor
├── client/          # React + Vite + TailwindCSS
│   ├── public/      # Archivos estaticos
│   └── src/         # Codigo fuente del cliente
├── docker-compose.yml
└── package.json     # Scripts de conveniencia
```

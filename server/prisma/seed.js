import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

if (process.env.NODE_ENV === 'production') {
  console.error('Seed no permitido en produccion. Usa NODE_ENV=development.');
  process.exit(1);
}

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

const USERS = [
  {
    nombre: 'Administrador',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@shopdev.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
    rol: 'ADMIN',
  },
  {
    nombre: 'Cliente Demo',
    email: process.env.SEED_CLIENT_EMAIL || 'cliente@shopdev.com',
    password: process.env.SEED_CLIENT_PASSWORD || 'Cliente123!',
    rol: 'CLIENTE',
  },
];

const CATEGORIES = [
  { nombre: 'Electronica', slug: 'electronica', imagen: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600' },
  { nombre: 'Ropa', slug: 'ropa', imagen: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600' },
  { nombre: 'Hogar', slug: 'hogar', imagen: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600' },
];

const PRODUCTS = [
  { nombre: 'Auriculares Bluetooth Pro', descripcion: 'Auriculares inalambricos con cancelacion de ruido y 30 h de bateria.', precio: '89.99', stock: 50, categoria: 'electronica', imagenUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { nombre: 'Smartwatch Fit X', descripcion: 'Reloj inteligente con monitor cardiaco, GPS y resistencia al agua.', precio: '149.90', stock: 30, categoria: 'electronica', imagenUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
  { nombre: 'Camiseta Algodon Basica', descripcion: 'Camiseta unisex 100% algodon organico, corte regular.', precio: '19.99', stock: 120, categoria: 'ropa', imagenUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { nombre: 'Chaqueta Vaquera Classic', descripcion: 'Chaqueta de denim con forro suave y cierre de botones.', precio: '59.50', stock: 40, categoria: 'ropa', imagenUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
  { nombre: 'Lampara LED de Escritorio', descripcion: 'Lampara regulable con 3 modos de luz y puerto USB de carga.', precio: '34.95', stock: 75, categoria: 'hogar', imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
  { nombre: 'Set de Cojines Decorativos', descripcion: 'Pack de 2 cojines de lino con relleno hipoalergenico.', precio: '24.00', stock: 90, categoria: 'hogar', imagenUrl: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600' },
];

async function seedUsers() {
  const results = [];
  for (const { password, ...userData } of USERS) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, passwordHash },
    });
    results.push(user);
  }
  return results;
}

async function seedCategories() {
  const results = [];
  for (const data of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });
    results.push(category);
  }
  return results;
}

async function seedProducts(categories) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  let created = 0;

  for (const { categoria, ...productData } of PRODUCTS) {
    const exists = await prisma.product.findFirst({ where: { nombre: productData.nombre } });
    if (!exists) {
      await prisma.product.create({ data: { ...productData, categoryId: categoryMap[categoria] } });
      created++;
    }
  }

  return { created, skipped: PRODUCTS.length - created };
}

async function main() {
  console.log('Iniciando seed...\n');

  const users = await seedUsers();
  console.log(`Usuarios:    ${users.map((u) => u.nombre).join(', ')}`);

  const categories = await seedCategories();
  console.log(`Categorias:  ${categories.map((c) => c.nombre).join(', ')}`);

  const { created, skipped } = await seedProducts(categories);
  console.log(`Productos:   ${created} creados, ${skipped} ya existian`);

  const counts = {
    usuarios: await prisma.user.count(),
    categorias: await prisma.category.count(),
    productos: await prisma.product.count(),
  };

  console.log(`\nTotales: ${counts.usuarios} usuarios, ${counts.categorias} categorias, ${counts.productos} productos`);
  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

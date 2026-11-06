import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // --- Usuarios ---
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const clientePassword = await bcrypt.hash('Cliente123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopdev.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@shopdev.com',
      passwordHash: adminPassword,
      rol: 'ADMIN',
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@shopdev.com' },
    update: {},
    create: {
      nombre: 'Cliente Demo',
      email: 'cliente@shopdev.com',
      passwordHash: clientePassword,
      rol: 'CLIENTE',
    },
  });

  console.log(`Usuarios creados/existentes: ${admin.nombre}, ${cliente.nombre}`);

  // --- Categorias ---
  const categoriaElectronica = await prisma.category.upsert({
    where: { slug: 'electronica' },
    update: {},
    create: {
      nombre: 'Electronica',
      slug: 'electronica',
      imagen: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    },
  });

  const categoriaRopa = await prisma.category.upsert({
    where: { slug: 'ropa' },
    update: {},
    create: {
      nombre: 'Ropa',
      slug: 'ropa',
      imagen: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
    },
  });

  const categoriaHogar = await prisma.category.upsert({
    where: { slug: 'hogar' },
    update: {},
    create: {
      nombre: 'Hogar',
      slug: 'hogar',
      imagen: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600',
    },
  });

  console.log(`Categorias creadas/existentes: ${categoriaElectronica.nombre}, ${categoriaRopa.nombre}, ${categoriaHogar.nombre}`);

  // --- Productos ---
  const productos = [
    {
      nombre: 'Auriculares Bluetooth Pro',
      descripcion: 'Auriculares inalambricos con cancelacion de ruido y 30 h de bateria.',
      precio: '89.99',
      stock: 50,
      categoryId: categoriaElectronica.id,
      imagenUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    },
    {
      nombre: 'Smartwatch Fit X',
      descripcion: 'Reloj inteligente con monitor cardiaco, GPS y resistencia al agua.',
      precio: '149.90',
      stock: 30,
      categoryId: categoriaElectronica.id,
      imagenUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    },
    {
      nombre: 'Camiseta Algodon Basica',
      descripcion: 'Camiseta unisex 100% algodon organico, corte regular.',
      precio: '19.99',
      stock: 120,
      categoryId: categoriaRopa.id,
      imagenUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    },
    {
      nombre: 'Chaqueta Vaquera Classic',
      descripcion: 'Chaqueta de denim con forro suave y cierre de botones.',
      precio: '59.50',
      stock: 40,
      categoryId: categoriaRopa.id,
      imagenUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
    },
    {
      nombre: 'Lampara LED de Escritorio',
      descripcion: 'Lampara regulable con 3 modos de luz y puerto USB de carga.',
      precio: '34.95',
      stock: 75,
      categoryId: categoriaHogar.id,
      imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    },
    {
      nombre: 'Set de Cojines Decorativos',
      descripcion: 'Pack de 2 cojines de lino con relleno hipoalergenico.',
      precio: '24.00',
      stock: 90,
      categoryId: categoriaHogar.id,
      imagenUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e5?w=600',
    },
  ];

  let productosCreados = 0;
  for (const producto of productos) {
    const existente = await prisma.product.findFirst({
      where: { nombre: producto.nombre },
    });
    if (!existente) {
      await prisma.product.create({ data: producto });
      productosCreados++;
    }
  }

  console.log(`Productos creados: ${productosCreados} (${productos.length - productosCreados} ya existian)`);

  // --- Resumen ---
  const totalUsuarios = await prisma.user.count();
  const totalCategorias = await prisma.category.count();
  const totalProductos = await prisma.product.count();

  console.log(`\nResumen de la base de datos:`);
  console.log(`  Usuarios:   ${totalUsuarios}`);
  console.log(`  Categorias: ${totalCategorias}`);
  console.log(`  Productos:  ${totalProductos}`);
  console.log('\nSeed completado exitosamente.');
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

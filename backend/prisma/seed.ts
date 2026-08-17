import { PrismaClient, RolUsuario } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear tienda de ejemplo
  const tienda = await prisma.tienda.create({
    data: {
      nombre: 'Mi Tienda de Ejemplo',
    },
  });

  // Crear dueño de la tienda
  const dueno = await prisma.usuario.create({
    data: {
      tiendaId: tienda.id,
      nombre: 'Juan Pérez',
      correo: 'juan@ejemplo.com',
      passwordHash: 'Clave123!',
      rol: RolUsuario.DUENO,
    },
  });

  // Crear productos de ejemplo
  const productos = await Promise.all([
    prisma.producto.create({
      data: {
        tiendaId: tienda.id,
        nombre: 'Café Americano',
        precio: 35.0,
        stock: 100,
        categoria: 'Bebidas',
      },
    }),
    prisma.producto.create({
      data: {
        tiendaId: tienda.id,
        nombre: 'Agua Mineral',
        precio: 20.0,
        stock: 150,
        categoria: 'Bebidas',
      },
    }),
    prisma.producto.create({
      data: {
        tiendaId: tienda.id,
        nombre: 'Croissant de Mantequilla',
        precio: 45.0,
        stock: 50,
        categoria: 'Panadería',
      },
    }),
    prisma.producto.create({
      data: {
        tiendaId: tienda.id,
        nombre: 'Sandwich de Jamón',
        precio: 65.0,
        stock: 30,
        categoria: 'Comida',
      },
    }),
  ]);

  console.log('Seed ejecutado correctamente:');
  console.log(`- Tienda: ${tienda.nombre} (ID: ${tienda.id})`);
  console.log(`- Dueño: ${dueno.nombre} (ID: ${dueno.id})`);
  console.log(`- Productos creados: ${productos.length}`);
  console.log('Productos:');
  productos.forEach((p) => console.log(`  - ${p.nombre}: $${p.precio} (Stock: ${p.stock})`));
}

main()
  .catch((e) => {
    console.error('Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './infrastructure/persistence/prisma/prisma';
import { PrismaTiendaRepository } from './infrastructure/persistence/prisma/PrismaTiendaRepository';
import { PrismaUsuarioRepository } from './infrastructure/persistence/prisma/PrismaUsuarioRepository';
import { PrismaProductoRepository } from './infrastructure/persistence/prisma/PrismaProductoRepository';
import { BcryptPasswordHasher } from './infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from './infrastructure/services/JwtTokenService';
import { UuidIdGenerator } from './infrastructure/services/UuidIdGenerator';
import { RegistrarTiendaUseCase } from './application/use-cases/auth/RegistrarTiendaUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { CambiarPasswordUseCase } from './application/use-cases/auth/CambiarPasswordUseCase';
import { CrearOperadorUseCase } from './application/use-cases/usuarios/CrearOperadorUseCase';
import { EditarOperadorUseCase } from './application/use-cases/usuarios/EditarOperadorUseCase';
import { DesactivarOperadorUseCase } from './application/use-cases/usuarios/DesactivarOperadorUseCase';
import { ActivarOperadorUseCase } from './application/use-cases/usuarios/ActivarOperadorUseCase';
import { ListarOperadoresUseCase } from './application/use-cases/usuarios/ListarOperadoresUseCase';
import { CrearProductoUseCase } from './application/use-cases/productos/CrearProductoUseCase';
import { EditarProductoUseCase } from './application/use-cases/productos/EditarProductoUseCase';
import { DesactivarProductoUseCase } from './application/use-cases/productos/DesactivarProductoUseCase';
import { ActivarProductoUseCase } from './application/use-cases/productos/ActivarProductoUseCase';
import { ListarProductosUseCase } from './application/use-cases/productos/ListarProductosUseCase';
import { BuscarProductosUseCase } from './application/use-cases/productos/BuscarProductosUseCase';
import { FiltrarPorCategoriaUseCase } from './application/use-cases/productos/FiltrarPorCategoriaUseCase';
import { ConsultarStockUseCase } from './application/use-cases/productos/ConsultarStockUseCase';
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { UsuariosController } from './infrastructure/http/controllers/UsuariosController';
import { ProductosController } from './infrastructure/http/controllers/ProductosController';
import { crearRutasAuth } from './infrastructure/http/routes/authRoutes';
import { crearRutasUsuarios } from './infrastructure/http/routes/usuariosRoutes';
import { crearRutasProductos } from './infrastructure/http/routes/productosRoutes';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';

// Inicializar adaptadores de infraestructura
const repositorioTiendas = new PrismaTiendaRepository(prisma);
const repositorioUsuarios = new PrismaUsuarioRepository(prisma);
const repositorioProductos = new PrismaProductoRepository(prisma);
const hashContrasena = new BcryptPasswordHasher();
const servicioToken = new JwtTokenService();
const generadorId = new UuidIdGenerator();

// Casos de uso — Auth
const registrarTiendaUseCase = new RegistrarTiendaUseCase(
  repositorioTiendas,
  repositorioUsuarios,
  hashContrasena,
  generadorId,
);
const loginUseCase = new LoginUseCase(repositorioUsuarios, hashContrasena, servicioToken);
const cambiarPasswordUseCase = new CambiarPasswordUseCase(repositorioUsuarios, hashContrasena);

// Casos de uso — Usuarios
const crearOperadorUseCase = new CrearOperadorUseCase(
  repositorioUsuarios,
  hashContrasena,
  generadorId,
);
const editarOperadorUseCase = new EditarOperadorUseCase(repositorioUsuarios);
const desactivarOperadorUseCase = new DesactivarOperadorUseCase(repositorioUsuarios);
const activarOperadorUseCase = new ActivarOperadorUseCase(repositorioUsuarios);
const listarOperadoresUseCase = new ListarOperadoresUseCase(repositorioUsuarios);

// Casos de uso — Productos
const crearProductoUseCase = new CrearProductoUseCase(repositorioProductos, generadorId);
const editarProductoUseCase = new EditarProductoUseCase(repositorioProductos);
const desactivarProductoUseCase = new DesactivarProductoUseCase(repositorioProductos);
const activarProductoUseCase = new ActivarProductoUseCase(repositorioProductos);
const listarProductosUseCase = new ListarProductosUseCase(repositorioProductos);
const buscarProductosUseCase = new BuscarProductosUseCase(repositorioProductos);
const filtrarPorCategoriaUseCase = new FiltrarPorCategoriaUseCase(repositorioProductos);
const consultarStockUseCase = new ConsultarStockUseCase(repositorioProductos);

// Controladores
const authController = new AuthController(
  registrarTiendaUseCase,
  loginUseCase,
  cambiarPasswordUseCase,
);
const usuariosController = new UsuariosController(
  crearOperadorUseCase,
  editarOperadorUseCase,
  desactivarOperadorUseCase,
  activarOperadorUseCase,
  listarOperadoresUseCase,
);
const productosController = new ProductosController(
  crearProductoUseCase,
  editarProductoUseCase,
  desactivarProductoUseCase,
  activarProductoUseCase,
  listarProductosUseCase,
  buscarProductosUseCase,
  filtrarPorCategoriaUseCase,
  consultarStockUseCase,
);

// Crear aplicación Express
const app = express();
const puerto = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', crearRutasAuth(authController));
app.use('/api/usuarios', crearRutasUsuarios(usuariosController));
app.use('/api/productos', crearRutasProductos(productosController));

// Manejador de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en el puerto ${puerto}`);
});

export { app };

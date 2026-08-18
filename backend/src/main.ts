import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaTiendaRepository } from './infrastructure/persistence/prisma/PrismaTiendaRepository';
import { PrismaUsuarioRepository } from './infrastructure/persistence/prisma/PrismaUsuarioRepository';
import { BcryptPasswordHasher } from './infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from './infrastructure/services/JwtTokenService';
import { UuidIdGenerator } from './infrastructure/services/UuidIdGenerator';
import { RegistrarTiendaUseCase } from './application/use-cases/auth/RegistrarTiendaUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { CambiarPasswordUseCase } from './application/use-cases/auth/CambiarPasswordUseCase';
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { crearRutasAuth } from './infrastructure/http/routes/authRoutes';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';

// Inicializar Prisma
const prisma = new PrismaClient();

// Inicializar adaptadores de infraestructura
const repositorioTiendas = new PrismaTiendaRepository(prisma);
const repositorioUsuarios = new PrismaUsuarioRepository(prisma);
const hashContrasena = new BcryptPasswordHasher();
const servicioToken = new JwtTokenService();
const generadorId = new UuidIdGenerator();

// Inicializar casos de uso (dependencias del dominio)
const registrarTiendaUseCase = new RegistrarTiendaUseCase(
  repositorioTiendas,
  repositorioUsuarios,
  hashContrasena,
  generadorId,
);
const loginUseCase = new LoginUseCase(repositorioUsuarios, hashContrasena, servicioToken);
const cambiarPasswordUseCase = new CambiarPasswordUseCase(repositorioUsuarios, hashContrasena);

// Inicializar controladores
const authController = new AuthController(
  registrarTiendaUseCase,
  loginUseCase,
  cambiarPasswordUseCase,
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

// Manejador de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en el puerto ${puerto}`);
});

export { app };

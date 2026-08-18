import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUseCase } from '../LoginUseCase';
import { FakeUsuarioRepository } from './FakeUsuarioRepository';
import { FakePasswordHasher } from './FakePasswordHasher';
import { FakeTokenService } from './FakeTokenService';
import { CredencialesInvalidasError } from '../../../../domain/errors/CredencialesInvalidasError';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('LoginUseCase', () => {
  let casoUso: LoginUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;
  let hashContrasena: FakePasswordHasher;
  let servicioToken: FakeTokenService;

  beforeEach(async () => {
    repositorioUsuarios = new FakeUsuarioRepository();
    hashContrasena = new FakePasswordHasher();
    servicioToken = new FakeTokenService();
    casoUso = new LoginUseCase(repositorioUsuarios, hashContrasena, servicioToken);

    // Crear usuario de prueba
    await repositorioUsuarios.guardar({
      id: 'user-1',
      tiendaId: 'tienda-1',
      nombre: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      passwordHash: await hashContrasena.hash('123456'),
      rol: RolUsuario.DUENO,
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería devolver token y usuario con credenciales válidas', async () => {
    const resultado = await casoUso.ejecutar({
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    expect(resultado.token).toBeDefined();
    expect(resultado.usuario.nombre).toBe('Luis Sebastian');
    expect(resultado.usuario.rol).toBe('DUENO');
  });

  it('debería rechazar contraseña incorrecta', async () => {
    await expect(
      casoUso.ejecutar({
        correo: 'luis@ejemplo.com',
        password: 'wrong',
      }),
    ).rejects.toThrow(CredencialesInvalidasError);
  });

  it('debería rechazar correo inexistente', async () => {
    await expect(
      casoUso.ejecutar({
        correo: 'noexiste@ejemplo.com',
        password: '123456',
      }),
    ).rejects.toThrow(CredencialesInvalidasError);
  });

  it('debería rechazar usuario desactivado', async () => {
    await repositorioUsuarios.desactivar('user-1', 'tienda-1');

    await expect(
      casoUso.ejecutar({
        correo: 'luis@ejemplo.com',
        password: '123456',
      }),
    ).rejects.toThrow(CredencialesInvalidasError);
  });

  it('debería generar un token válido', async () => {
    const resultado = await casoUso.ejecutar({
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    expect(resultado.token).toContain('token-');
  });
});

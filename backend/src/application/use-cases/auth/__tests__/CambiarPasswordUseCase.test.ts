import { describe, it, expect, beforeEach } from 'vitest';
import { CambiarPasswordUseCase } from '../CambiarPasswordUseCase';
import { FakeUsuarioRepository } from './FakeUsuarioRepository';
import { FakePasswordHasher } from './FakePasswordHasher';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';
import { CredencialesInvalidasError } from '../../../../domain/errors/CredencialesInvalidasError';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('CambiarPasswordUseCase', () => {
  let casoUso: CambiarPasswordUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;
  let hashContrasena: FakePasswordHasher;

  beforeEach(async () => {
    repositorioUsuarios = new FakeUsuarioRepository();
    hashContrasena = new FakePasswordHasher();
    casoUso = new CambiarPasswordUseCase(repositorioUsuarios, hashContrasena);

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

  it('debería cambiar la contraseña exitosamente', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'user-1',
        tiendaId: 'tienda-1',
        passwordActual: '123456',
        passwordNueva: '654321',
      }),
    ).resolves.toBeUndefined();
  });

  it('debería rechazar si la contraseña actual es incorrecta', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'user-1',
        tiendaId: 'tienda-1',
        passwordActual: 'wrong',
        passwordNueva: '654321',
      }),
    ).rejects.toThrow(CredencialesInvalidasError);
  });

  it('debería rechazar si el usuario no existe', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'no-existe',
        tiendaId: 'tienda-1',
        passwordActual: '123456',
        passwordNueva: '654321',
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});

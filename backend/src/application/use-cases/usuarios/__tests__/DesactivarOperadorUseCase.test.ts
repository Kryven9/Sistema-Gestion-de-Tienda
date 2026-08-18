import { describe, it, expect, beforeEach } from 'vitest';
import { DesactivarOperadorUseCase } from '../DesactivarOperadorUseCase';
import { FakeUsuarioRepository } from '../../auth/__tests__/FakeUsuarioRepository';
import { FakePasswordHasher } from '../../auth/__tests__/FakePasswordHasher';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('DesactivarOperadorUseCase', () => {
  let casoUso: DesactivarOperadorUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;

  beforeEach(async () => {
    repositorioUsuarios = new FakeUsuarioRepository();
    casoUso = new DesactivarOperadorUseCase(repositorioUsuarios);

    const hash = await new FakePasswordHasher().hash('123456');
    await repositorioUsuarios.guardar({
      id: 'user-1',
      tiendaId: 'tienda-1',
      nombre: 'Sofia Alvarado',
      correo: 'sofia@ejemplo.com',
      passwordHash: hash,
      rol: RolUsuario.OPERADOR,
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería desactivar el operador', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'user-1',
        tiendaId: 'tienda-1',
      }),
    ).resolves.toBeUndefined();

    const usuario = await repositorioUsuarios.buscarPorId('user-1', 'tienda-1');
    expect(usuario?.activo).toBe(false);
  });

  it('debería rechazar si el usuario no existe', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'no-existe',
        tiendaId: 'tienda-1',
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });

  it('debería rechazar si no es un operador', async () => {
    await repositorioUsuarios.guardar({
      id: 'user-2',
      tiendaId: 'tienda-1',
      nombre: 'Dueño',
      correo: 'dueno@ejemplo.com',
      passwordHash: 'hash',
      rol: RolUsuario.DUENO,
      activo: true,
      fechaCreacion: new Date(),
    });

    await expect(
      casoUso.ejecutar({
        usuarioId: 'user-2',
        tiendaId: 'tienda-1',
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});

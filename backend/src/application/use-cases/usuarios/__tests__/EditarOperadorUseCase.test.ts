import { describe, it, expect, beforeEach } from 'vitest';
import { EditarOperadorUseCase } from '../EditarOperadorUseCase';
import { FakeUsuarioRepository } from '../../auth/__tests__/FakeUsuarioRepository';
import { FakePasswordHasher } from '../../auth/__tests__/FakePasswordHasher';
import { EntidadNoEncontradaError } from '../../../../domain/errors/EntidadNoEncontradaError';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('EditarOperadorUseCase', () => {
  let casoUso: EditarOperadorUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;

  beforeEach(async () => {
    repositorioUsuarios = new FakeUsuarioRepository();
    casoUso = new EditarOperadorUseCase(repositorioUsuarios);

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

  it('debería editar el nombre del operador', async () => {
    const resultado = await casoUso.ejecutar({
      usuarioId: 'user-1',
      tiendaId: 'tienda-1',
      nombre: 'María López',
    });

    expect(resultado.nombre).toBe('María López');
  });

  it('debería rechazar si el usuario no existe', async () => {
    await expect(
      casoUso.ejecutar({
        usuarioId: 'no-existe',
        tiendaId: 'tienda-1',
        nombre: 'Nuevo Nombre',
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
        nombre: 'Nuevo Nombre',
      }),
    ).rejects.toThrow(EntidadNoEncontradaError);
  });
});

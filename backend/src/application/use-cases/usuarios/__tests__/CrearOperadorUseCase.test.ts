import { describe, it, expect, beforeEach } from 'vitest';
import { CrearOperadorUseCase } from '../CrearOperadorUseCase';
import { FakeUsuarioRepository } from '../../auth/__tests__/FakeUsuarioRepository';
import { FakePasswordHasher } from '../../auth/__tests__/FakePasswordHasher';
import { FakeIdGenerator } from '../../auth/__tests__/FakeIdGenerator';
import { CorreoDuplicadoError } from '../../../../domain/errors/CorreoDuplicadoError';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('CrearOperadorUseCase', () => {
  let casoUso: CrearOperadorUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;
  let hashContrasena: FakePasswordHasher;
  let generadorId: FakeIdGenerator;

  beforeEach(() => {
    repositorioUsuarios = new FakeUsuarioRepository();
    hashContrasena = new FakePasswordHasher();
    generadorId = new FakeIdGenerator();
    casoUso = new CrearOperadorUseCase(repositorioUsuarios, hashContrasena, generadorId);
  });

  it('debería crear un operador exitosamente', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Sofia Alvarado',
      correo: 'sofia@ejemplo.com',
      password: '123456',
    });

    expect(resultado.nombre).toBe('Sofia Alvarado');
    expect(resultado.correo).toBe('sofia@ejemplo.com');
    expect(resultado.rol).toBe(RolUsuario.OPERADOR);
    expect(resultado.tiendaId).toBe('tienda-1');
    expect(resultado.activo).toBe(true);
  });

  it('deberíahashear la contraseña', async () => {
    const resultado = await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Sofia Alvarado',
      correo: 'sofia@ejemplo.com',
      password: '123456',
    });

    expect(resultado).not.toHaveProperty('passwordHash');
  });

  it('debería rechazar correo duplicado', async () => {
    await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Sofia Alvarado',
      correo: 'sofia@ejemplo.com',
      password: '123456',
    });

    await expect(
      casoUso.ejecutar({
        tiendaId: 'tienda-1',
        nombre: 'Otro Usuario',
        correo: 'sofia@ejemplo.com',
        password: '654321',
      }),
    ).rejects.toThrow(CorreoDuplicadoError);
  });

  it('debería persistir el usuario en el repositorio', async () => {
    await casoUso.ejecutar({
      tiendaId: 'tienda-1',
      nombre: 'Sofia Alvarado',
      correo: 'sofia@ejemplo.com',
      password: '123456',
    });

    const guardado = await repositorioUsuarios.buscarPorCorreo('sofia@ejemplo.com');
    expect(guardado).not.toBeNull();
    expect(guardado?.rol).toBe(RolUsuario.OPERADOR);
  });
});

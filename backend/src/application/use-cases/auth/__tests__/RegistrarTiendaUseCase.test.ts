import { describe, it, expect, beforeEach } from 'vitest';
import { RegistrarTiendaUseCase } from '../RegistrarTiendaUseCase';
import { FakeTiendaRepository } from './FakeTiendaRepository';
import { FakeUsuarioRepository } from './FakeUsuarioRepository';
import { FakePasswordHasher } from './FakePasswordHasher';
import { FakeIdGenerator } from './FakeIdGenerator';
import { CorreoDuplicadoError } from '../../../../domain/errors/CorreoDuplicadoError';

describe('RegistrarTiendaUseCase', () => {
  let casoUso: RegistrarTiendaUseCase;
  let repositorioTiendas: FakeTiendaRepository;
  let repositorioUsuarios: FakeUsuarioRepository;
  let hashContrasena: FakePasswordHasher;
  let generadorId: FakeIdGenerator;

  beforeEach(() => {
    repositorioTiendas = new FakeTiendaRepository();
    repositorioUsuarios = new FakeUsuarioRepository();
    hashContrasena = new FakePasswordHasher();
    generadorId = new FakeIdGenerator();
    casoUso = new RegistrarTiendaUseCase(
      repositorioTiendas,
      repositorioUsuarios,
      hashContrasena,
      generadorId,
    );
  });

  it('debería crear tienda y dueño exitosamente', async () => {
    const resultado = await casoUso.ejecutar({
      nombreTienda: 'Mi Tienda',
      nombreUsuario: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    expect(resultado.tienda.nombre).toBe('Mi Tienda');
    expect(resultado.usuario.nombre).toBe('Luis Sebastian');
    expect(resultado.usuario.correo).toBe('luis@ejemplo.com');
    expect(resultado.usuario.rol).toBe('DUENO');
  });

  it('debería hashear la contraseña antes de persistir', async () => {
    const resultado = await casoUso.ejecutar({
      nombreTienda: 'Mi Tienda',
      nombreUsuario: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    expect(resultado.usuario).not.toHaveProperty('passwordHash');
  });

  it('debería rechazar correo duplicado', async () => {
    await casoUso.ejecutar({
      nombreTienda: 'Mi Tienda',
      nombreUsuario: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    await expect(
      casoUso.ejecutar({
        nombreTienda: 'Otra Tienda',
        nombreUsuario: 'Otro Usuario',
        correo: 'luis@ejemplo.com',
        password: '654321',
      }),
    ).rejects.toThrow(CorreoDuplicadoError);
  });

  it('debería persistir tienda y usuario en los repositorios', async () => {
    await casoUso.ejecutar({
      nombreTienda: 'Mi Tienda',
      nombreUsuario: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    const tiendas = await repositorioTiendas.buscarPorId('id-1');
    const usuario = await repositorioUsuarios.buscarPorCorreo('luis@ejemplo.com');

    expect(tiendas).not.toBeNull();
    expect(usuario).not.toBeNull();
    expect(usuario?.rol).toBe('DUENO');
  });

  it('debería generar IDs únicos', async () => {
    const resultado = await casoUso.ejecutar({
      nombreTienda: 'Mi Tienda',
      nombreUsuario: 'Luis Sebastian',
      correo: 'luis@ejemplo.com',
      password: '123456',
    });

    expect(resultado.tienda.id).toBe('id-1');
    expect(resultado.usuario.id).toBe('id-2');
  });
});

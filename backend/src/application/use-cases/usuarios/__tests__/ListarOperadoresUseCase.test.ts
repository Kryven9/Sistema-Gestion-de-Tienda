import { describe, it, expect, beforeEach } from 'vitest';
import { ListarOperadoresUseCase } from '../ListarOperadoresUseCase';
import { FakeUsuarioRepository } from '../../auth/__tests__/FakeUsuarioRepository';
import { FakePasswordHasher } from '../../auth/__tests__/FakePasswordHasher';
import { RolUsuario } from '../../../../domain/enums/RolUsuario';

describe('ListarOperadoresUseCase', () => {
  let casoUso: ListarOperadoresUseCase;
  let repositorioUsuarios: FakeUsuarioRepository;

  beforeEach(async () => {
    repositorioUsuarios = new FakeUsuarioRepository();
    casoUso = new ListarOperadoresUseCase(repositorioUsuarios);

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
    await repositorioUsuarios.guardar({
      id: 'user-2',
      tiendaId: 'tienda-1',
      nombre: 'Eduardo Torres',
      correo: 'eduardo@ejemplo.com',
      passwordHash: hash,
      rol: RolUsuario.OPERADOR,
      activo: true,
      fechaCreacion: new Date(),
    });
    await repositorioUsuarios.guardar({
      id: 'user-3',
      tiendaId: 'tienda-1',
      nombre: 'Dueño',
      correo: 'dueno@ejemplo.com',
      passwordHash: hash,
      rol: RolUsuario.DUENO,
      activo: true,
      fechaCreacion: new Date(),
    });
  });

  it('debería listar solo operadores de la tienda', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1' });

    expect(resultado).toHaveLength(2);
    expect(resultado.every((u) => u.rol === RolUsuario.OPERADOR)).toBe(true);
  });

  it('no debería incluir passwords', async () => {
    const resultado = await casoUso.ejecutar({ tiendaId: 'tienda-1' });

    expect(resultado.every((u) => !('passwordHash' in u))).toBe(true);
  });

  it('debería devolver lista vacía si no hay operadores', async () => {
    const otroRepositorio = new FakeUsuarioRepository();
    const otroCasoUso = new ListarOperadoresUseCase(otroRepositorio);

    const resultado = await otroCasoUso.ejecutar({ tiendaId: 'tienda-2' });

    expect(resultado).toHaveLength(0);
  });
});

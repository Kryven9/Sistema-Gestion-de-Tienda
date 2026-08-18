import { Usuario } from '../../../domain/entities/Usuario';
import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';

export interface ListarOperadoresComando {
  tiendaId: string;
}

export class ListarOperadoresUseCase {
  constructor(private readonly repositorioUsuarios: UsuarioRepository) {}

  async ejecutar(comando: ListarOperadoresComando): Promise<Omit<Usuario, 'passwordHash'>[]> {
    const usuarios = await this.repositorioUsuarios.listarPorTienda(comando.tiendaId);

    return (
      usuarios
        .filter((u) => u.rol === 'OPERADOR')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ passwordHash: _eliminado, ...sinPassword }) => sinPassword)
    );
  }
}

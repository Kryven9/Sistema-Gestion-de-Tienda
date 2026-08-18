import { Tienda } from '../../../domain/entities/Tienda';
import { Usuario } from '../../../domain/entities/Usuario';
import { RolUsuario } from '../../../domain/enums/RolUsuario';
import { TiendaRepository } from '../../../domain/ports/repositories/TiendaRepository';
import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { PasswordHasher } from '../../../domain/ports/services/PasswordHasher';
import { IdGenerator } from '../../../domain/ports/services/IdGenerator';
import { CorreoDuplicadoError } from '../../../domain/errors/CorreoDuplicadoError';

export interface RegistrarTiendaComando {
  nombreTienda: string;
  nombreUsuario: string;
  correo: string;
  password: string;
}

export interface RegistrarTiendaResultado {
  tienda: Tienda;
  usuario: Omit<Usuario, 'passwordHash'>;
}

export class RegistrarTiendaUseCase {
  constructor(
    private readonly repositorioTiendas: TiendaRepository,
    private readonly repositorioUsuarios: UsuarioRepository,
    private readonly hashContrasena: PasswordHasher,
    private readonly generadorId: IdGenerator,
  ) {}

  async ejecutar(comando: RegistrarTiendaComando): Promise<RegistrarTiendaResultado> {
    const existente = await this.repositorioUsuarios.buscarPorCorreo(comando.correo);
    if (existente) {
      throw new CorreoDuplicadoError(comando.correo);
    }

    const now = new Date();
    const tienda: Tienda = {
      id: this.generadorId.generar(),
      nombre: comando.nombreTienda,
      activo: true,
      fechaCreacion: now,
    };

    const passwordHash = await this.hashContrasena.hash(comando.password);

    const usuario: Usuario = {
      id: this.generadorId.generar(),
      tiendaId: tienda.id,
      nombre: comando.nombreUsuario,
      correo: comando.correo,
      passwordHash,
      rol: RolUsuario.DUENO,
      activo: true,
      fechaCreacion: now,
    };

    await this.repositorioTiendas.guardar(tienda);
    await this.repositorioUsuarios.guardar(usuario);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _eliminado, ...usuarioSinPassword } = usuario;
    return { tienda, usuario: usuarioSinPassword };
  }
}

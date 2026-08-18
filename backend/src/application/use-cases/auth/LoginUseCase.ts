import { UsuarioRepository } from '../../../domain/ports/repositories/UsuarioRepository';
import { PasswordHasher } from '../../../domain/ports/services/PasswordHasher';
import { TokenService } from '../../../domain/ports/services/TokenService';
import { CredencialesInvalidasError } from '../../../domain/errors/CredencialesInvalidasError';

export interface LoginComando {
  correo: string;
  password: string;
}

export interface LoginResultado {
  token: string;
  usuario: {
    id: string;
    tiendaId: string;
    nombre: string;
    correo: string;
    rol: string;
  };
}

export class LoginUseCase {
  constructor(
    private readonly repositorioUsuarios: UsuarioRepository,
    private readonly hashContrasena: PasswordHasher,
    private readonly servicioToken: TokenService,
  ) {}

  async ejecutar(comando: LoginComando): Promise<LoginResultado> {
    const usuario = await this.repositorioUsuarios.buscarPorCorreo(comando.correo);

    if (!usuario || !usuario.activo) {
      throw new CredencialesInvalidasError();
    }

    const passwordValida = await this.hashContrasena.compare(
      comando.password,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new CredencialesInvalidasError();
    }

    const token = this.servicioToken.generar({
      userId: usuario.id,
      tiendaId: usuario.tiendaId,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        tiendaId: usuario.tiendaId,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}

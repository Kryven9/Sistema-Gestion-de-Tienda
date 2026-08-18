import { TokenService, TokenPayload } from '@domain/ports/services/TokenService';

export class FakeTokenService implements TokenService {
  private contador = 0;

  generar(payload: TokenPayload): string {
    this.contador++;
    return `token-${this.contador}-${payload.userId}`;
  }

  verificar(token: string): TokenPayload {
    void token;
    return { userId: 'user-1', tiendaId: 'tienda-1', rol: 'DUENO' };
  }
}

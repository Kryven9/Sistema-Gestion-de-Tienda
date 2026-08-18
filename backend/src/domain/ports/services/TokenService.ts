export interface TokenPayload {
  userId: string;
  tiendaId: string;
  rol: string;
}

export interface TokenService {
  generar(payload: TokenPayload): string;
  verificar(token: string): TokenPayload;
}

import jwt from 'jsonwebtoken';
import { TokenService, TokenPayload } from '@domain/ports/services/TokenService';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-temporal';
const EXPIRACION = '8h';

export class JwtTokenService implements TokenService {
  generar(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRACION });
  }

  verificar(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}

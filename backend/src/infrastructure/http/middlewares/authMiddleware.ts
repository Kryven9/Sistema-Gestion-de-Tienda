import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-temporal';

export interface JwtPayload {
  userId: string;
  tiendaId: string;
  rol: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = encabezado.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

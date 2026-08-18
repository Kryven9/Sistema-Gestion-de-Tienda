import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tiene permiso para realizar esta acción' });
      return;
    }

    next();
  };
}

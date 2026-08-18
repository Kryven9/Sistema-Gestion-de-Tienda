import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err.name === 'CredencialesInvalidasError') {
    res.status(401).json({ error: err.message });
    return;
  }

  if (err.name === 'CorreoDuplicadoError') {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.name === 'EntidadNoEncontradaError') {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.name === 'NoAutorizadoError') {
    res.status(403).json({ error: err.message });
    return;
  }

  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

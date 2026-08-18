export class NoAutorizadoError extends Error {
  constructor(mensaje = 'No autorizado') {
    super(mensaje);
    this.name = 'NoAutorizadoError';
  }
}

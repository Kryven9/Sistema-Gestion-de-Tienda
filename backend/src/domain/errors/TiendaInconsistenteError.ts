export class TiendaInconsistenteError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'TiendaInconsistenteError';
  }
}

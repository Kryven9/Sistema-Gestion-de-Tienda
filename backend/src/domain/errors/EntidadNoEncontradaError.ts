export class EntidadNoEncontradaError extends Error {
  constructor(entidad: string, identificador: string) {
    super(`${entidad} con identificador '${identificador}' no encontrada`);
    this.name = 'EntidadNoEncontradaError';
  }
}

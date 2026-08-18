export class CorreoDuplicadoError extends Error {
  constructor(correo: string) {
    super(`El correo '${correo}' ya está registrado`);
    this.name = 'CorreoDuplicadoError';
  }
}

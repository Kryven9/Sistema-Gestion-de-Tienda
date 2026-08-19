export class ValorInvalidoError extends Error {
  constructor(campo: string, valor: number) {
    super(`El campo '${campo}' no puede tener un valor negativo: ${valor}`);
    this.name = 'ValorInvalidoError';
  }
}

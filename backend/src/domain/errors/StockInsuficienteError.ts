export class StockInsuficienteError extends Error {
  constructor(nombreProducto: string, stockDisponible: number, cantidadSolicitada: number) {
    super(
      `Stock insuficiente para '${nombreProducto}': disponible ${stockDisponible}, solicitado ${cantidadSolicitada}`,
    );
    this.name = 'StockInsuficienteError';
  }
}

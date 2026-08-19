import { IdGenerator } from '../ports/services/IdGenerator';

export class GeneradorFolio {
  constructor(private readonly generadorId: IdGenerator) {}

  generar(fecha: Date = new Date()): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const correlativo = this.generadorId.generar().replace(/-/g, '').slice(0, 8).toUpperCase();
    return `F-${anio}${mes}${dia}-${correlativo}`;
  }
}

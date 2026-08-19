import { Factura } from '../../../domain/entities/Factura';
import { FacturaRepository } from '../../../domain/ports/repositories/FacturaRepository';
import { GeneradorFolio } from '../../../domain/services/GeneradorFolio';
import { LEYENDA_POR_DEFECTO } from '../../../domain/constants/FacturaConstants';
import { EstadoFactura } from '../../../domain/enums/EstadoFactura';

export interface GenerarFacturaSimuladaComando {
  tiendaId: string;
  ventaId: string;
  total: number;
  fechaEmision?: Date;
}

export class GenerarFacturaSimuladaUseCase {
  constructor(
    private readonly repositorioFacturas: FacturaRepository,
    private readonly generadorFolio: GeneradorFolio,
    private readonly generadorId: { generar(): string },
  ) {}

  async ejecutar(comando: GenerarFacturaSimuladaComando): Promise<Factura> {
    const fechaEmision = comando.fechaEmision ?? new Date();

    const factura: Factura = {
      id: this.generadorId.generar(),
      tiendaId: comando.tiendaId,
      ventaId: comando.ventaId,
      folio: this.generadorFolio.generar(fechaEmision),
      total: comando.total,
      estado: EstadoFactura.EMITIDA,
      leyenda: LEYENDA_POR_DEFECTO,
      fechaEmision,
    };

    return this.repositorioFacturas.guardar(factura);
  }
}

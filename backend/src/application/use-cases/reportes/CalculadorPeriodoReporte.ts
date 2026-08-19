import { TipoReporte } from '../../../domain/entities/Reporte';
import {
  finDeMes,
  finDelDia,
  inicioDeMes,
  inicioDeSemana,
  inicioDelDia,
} from '../../../domain/services/PeriodoReporte';

export interface PeriodoCalculado {
  tipo: TipoReporte;
  desde: Date;
  hasta: Date;
}

export class CalculadorPeriodoReporte {
  static para(tipo: TipoReporte, fechaReferencia: Date = new Date()): PeriodoCalculado {
    switch (tipo) {
      case 'DIA':
        return { tipo, desde: inicioDelDia(fechaReferencia), hasta: finDelDia(fechaReferencia) };
      case 'SEMANA':
        return {
          tipo,
          desde: inicioDeSemana(fechaReferencia),
          hasta: finDelDia(fechaReferencia),
        };
      case 'MES':
        return { tipo, desde: inicioDeMes(fechaReferencia), hasta: finDeMes(fechaReferencia) };
      case 'RANGO':
      default:
        return {
          tipo: 'RANGO',
          desde: inicioDelDia(fechaReferencia),
          hasta: finDelDia(fechaReferencia),
        };
    }
  }
}

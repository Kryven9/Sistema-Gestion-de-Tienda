import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consultarDetalleFactura, listarFacturasPorRango, type Factura } from '../api/facturas';

export type AlcanceFacturas = 'dia' | 'rango';

export interface FiltroFacturas {
  alcance: AlcanceFacturas;
  desde: string;
  hasta: string;
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function inicioDelDiaIso(): string {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha.toISOString();
}

function finDelDiaIso(): string {
  const fecha = new Date();
  fecha.setHours(23, 59, 59, 999);
  return fecha.toISOString();
}

export function useFacturas() {
  const [filtros, setFiltros] = useState<FiltroFacturas>({
    alcance: 'dia',
    desde: hoyIso(),
    hasta: hoyIso(),
  });
  const [idFacturaDetalle, setIdFacturaDetalle] = useState<string | null>(null);

  const parametrosRango = useMemo(() => {
    if (filtros.alcance !== 'rango') return null;
    if (!filtros.desde || !filtros.hasta) return null;
    const [yDesde, mDesde, dDesde] = filtros.desde.split('-').map(Number);
    const [yHasta, mHasta, dHasta] = filtros.hasta.split('-').map(Number);
    const desde = new Date(yDesde, (mDesde ?? 1) - 1, dDesde ?? 1, 0, 0, 0, 0);
    const hasta = new Date(yHasta, (mHasta ?? 1) - 1, dHasta ?? 1, 23, 59, 59, 999);
    return { desde: desde.toISOString(), hasta: hasta.toISOString() };
  }, [filtros]);

  const queryKey = [
    'facturas',
    filtros.alcance,
    filtros.alcance === 'dia' ? inicioDelDiaIso() : parametrosRango?.desde,
    filtros.alcance === 'dia' ? finDelDiaIso() : parametrosRango?.hasta,
  ];

  const { data: facturas = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (filtros.alcance === 'dia') {
        return listarFacturasPorRango({ desde: inicioDelDiaIso(), hasta: finDelDiaIso() });
      }
      return listarFacturasPorRango(parametrosRango as { desde: string; hasta: string });
    },
  });

  const detalleQuery = useQuery({
    queryKey: ['factura-detalle', idFacturaDetalle],
    enabled: !!idFacturaDetalle,
    queryFn: () => consultarDetalleFactura(idFacturaDetalle as string),
  });

  return {
    facturas,
    isLoading,
    filtros,
    setFiltros,
    idFacturaDetalle,
    setIdFacturaDetalle,
    facturaDetalle: detalleQuery.data,
    facturaDetalleLoading: detalleQuery.isLoading,
  };
}

export type { Factura };

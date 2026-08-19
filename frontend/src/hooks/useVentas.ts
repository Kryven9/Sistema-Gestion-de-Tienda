import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  anularVenta,
  consultarDetalleVenta,
  listarVentasDelDia,
  listarVentasPorRango,
  registrarVenta,
  type ItemVenta,
  type RegistrarVentaDto,
  type Venta,
} from '../api/ventas';
import type { Producto } from '../api/productos';
import { useAuthStore } from '../stores/useAuthStore';

export type AlcanceVentas = 'dia' | 'rango';

export interface FiltroVentas {
  alcance: AlcanceVentas;
  desde: string;
  hasta: string;
  vendedorId: string;
}

export interface LineaVentaForm {
  productoId: string;
  cantidad: string;
}

function extraerError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error || 'Error desconocido';
  }
  return 'Error desconocido';
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

const filtrosIniciales: FiltroVentas = {
  alcance: 'dia',
  desde: hoyIso(),
  hasta: hoyIso(),
  vendedorId: 'todos',
};

export function useVentas() {
  const queryClient = useQueryClient();
  const rol = useAuthStore((s) => s.usuario?.rol);
  const esDueno = rol === 'DUENO';

  const [filtros, setFiltros] = useState<FiltroVentas>(filtrosIniciales);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [lineas, setLineas] = useState<LineaVentaForm[]>([]);
  const [error, setError] = useState('');
  const [idVentaDetalle, setIdVentaDetalle] = useState<string | null>(null);

  const alcance = esDueno ? filtros.alcance : 'dia';
  const parametrosRango = useMemo(() => {
    if (alcance !== 'rango') return null;
    if (!filtros.desde || !filtros.hasta) return null;
    const [yDesde, mDesde, dDesde] = filtros.desde.split('-').map(Number);
    const [yHasta, mHasta, dHasta] = filtros.hasta.split('-').map(Number);
    const desde = new Date(yDesde, (mDesde ?? 1) - 1, dDesde ?? 1, 0, 0, 0, 0);
    const hasta = new Date(yHasta, (mHasta ?? 1) - 1, dHasta ?? 1, 23, 59, 59, 999);
    return { desde: desde.toISOString(), hasta: hasta.toISOString() };
  }, [alcance, filtros.desde, filtros.hasta]);

  const queryKey = [
    'ventas',
    esDueno ? 'dueno' : 'operador',
    alcance,
    alcance === 'dia' ? inicioDelDiaIso() : parametrosRango?.desde,
    alcance === 'dia' ? finDelDiaIso() : parametrosRango?.hasta,
  ];

  const { data: ventas = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!esDueno) return listarVentasDelDia();
      if (alcance === 'dia') {
        return listarVentasPorRango({ desde: inicioDelDiaIso(), hasta: finDelDiaIso() });
      }
      return listarVentasPorRango(parametrosRango as { desde: string; hasta: string });
    },
  });

  const ventaDetalleQuery = useQuery({
    queryKey: ['venta-detalle', idVentaDetalle],
    enabled: !!idVentaDetalle,
    queryFn: () => consultarDetalleVenta(idVentaDetalle as string),
  });

  const registrarMutation = useMutation({
    mutationFn: (datos: RegistrarVentaDto) => registrarVenta(datos),
    onSuccess: async (ventaCreada) => {
      queryClient.setQueryData<Venta[]>(queryKey, (actuales = []) => [ventaCreada, ...actuales]);
      await queryClient.invalidateQueries({ queryKey: ['ventas'], refetchType: 'active' });
      cerrarFormulario();
    },
    onError: (err: unknown) => setError(extraerError(err)),
  });

  const anularMutation = useMutation({
    mutationFn: (id: string) => anularVenta(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ventas'], refetchType: 'active' });
      if (idVentaDetalle) {
        await queryClient.invalidateQueries({
          queryKey: ['venta-detalle', idVentaDetalle],
          refetchType: 'active',
        });
      }
    },
    onError: (err: unknown) => setError(extraerError(err)),
  });

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setLineas([]);
    setError('');
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);
    setLineas([{ productoId: '', cantidad: '1' }]);
    setError('');
  };

  const actualizarLinea = (indice: number, cambios: Partial<LineaVentaForm>) => {
    setLineas((actuales) =>
      actuales.map((linea, posicion) => (posicion === indice ? { ...linea, ...cambios } : linea)),
    );
  };

  const agregarLinea = (catalogo: Producto[]) => {
    const productosDisponibles = catalogo.filter(
      (producto) => producto.activo && !lineas.some((linea) => linea.productoId === producto.id),
    );
    if (productosDisponibles.length === 0) {
      setError('Ya agregaste todos los productos disponibles a esta venta.');
      return;
    }
    setLineas((actuales) => [...actuales, { productoId: '', cantidad: '1' }]);
  };

  const eliminarLinea = (indice: number) => {
    setLineas((actuales) => actuales.filter((_, posicion) => posicion !== indice));
  };

  const calcularTotal = (catalogo: Producto[]): number =>
    lineas.reduce((suma, linea) => {
      const producto = catalogo.find((item) => item.id === linea.productoId);
      const cantidad = Number(linea.cantidad) || 0;
      if (!producto) return suma;
      return suma + producto.precio * cantidad;
    }, 0);

  const validarYConstruirItems = (): ItemVenta[] | null => {
    if (lineas.length === 0) {
      setError('Agrega al menos un producto.');
      return null;
    }
    const productosUnicos = new Set<string>();
    const items: ItemVenta[] = [];

    for (const linea of lineas) {
      const cantidad = Number(linea.cantidad);
      if (!linea.productoId) {
        setError('Selecciona un producto para cada línea.');
        return null;
      }
      if (!Number.isFinite(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
        setError('Las cantidades deben ser números enteros mayores a 0.');
        return null;
      }
      if (productosUnicos.has(linea.productoId)) {
        setError('No repitas el mismo producto en varias líneas.');
        return null;
      }
      productosUnicos.add(linea.productoId);
      items.push({ productoId: linea.productoId, cantidad });
    }

    return items;
  };

  const handleRegistrar = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const items = validarYConstruirItems();
    if (!items) return;
    registrarMutation.mutate({ items });
  };

  const totalEstimado = (catalogo: Producto[]) => calcularTotal(catalogo);

  return {
    esDueno,
    ventas,
    isLoading,
    filtros,
    setFiltros,
    mostrarFormulario,
    lineas,
    error,
    registrarPending: registrarMutation.isPending,
    anularPending: anularMutation.isPending,
    abrirFormulario,
    cerrarFormulario,
    actualizarLinea,
    agregarLinea,
    eliminarLinea,
    handleRegistrar,
    totalEstimado,
    idVentaDetalle,
    setIdVentaDetalle,
    ventaDetalle: ventaDetalleQuery.data,
    ventaDetalleLoading: ventaDetalleQuery.isLoading,
    anular: anularMutation.mutate,
    inicioDelDiaIso,
    finDelDiaIso,
  };
}

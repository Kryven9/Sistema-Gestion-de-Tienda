import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  CalendarSearch,
  Download,
  Mic,
  Package,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { SelectField } from '../components/SelectField';
import { useProductosStockBajo, useReporte } from '../hooks/useReportes';
import { useAuthStore } from '../stores/useAuthStore';
import { descargarPdfReporte } from '../lib/reportesPdf';
import type { TipoReporte } from '../api/reportes';

const TIPOS_REPORTE: Array<{ value: TipoReporte; label: string }> = [
  { value: 'DIA', label: 'Hoy' },
  { value: 'SEMANA', label: 'Semana actual' },
  { value: 'MES', label: 'Mes actual' },
  { value: 'RANGO', label: 'Por rango' },
];

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearFechaCorta(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReportesPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [tipo, setTipo] = useState<TipoReporte>('DIA');
  const [desde, setDesde] = useState(hoyIso());
  const [hasta, setHasta] = useState(hoyIso());
  const [descargando, setDescargando] = useState(false);

  const filtros = useMemo(
    () => ({
      tipo,
      desde: tipo === 'RANGO' ? `${desde}T00:00:00.000Z` : undefined,
      hasta: tipo === 'RANGO' ? `${hasta}T23:59:59.999Z` : undefined,
      limiteMasVendidos: 5,
    }),
    [tipo, desde, hasta],
  );

  const { data: reporte, isLoading, isError } = useReporte(filtros);
  const { data: stockBajo } = useProductosStockBajo(5);

  const handleDescargarPdf = () => {
    if (!reporte) return;
    setDescargando(true);
    try {
      descargarPdfReporte(reporte, stockBajo ?? [], {
        nombreTienda: 'Gestion de Tienda',
        generadoPor: usuario?.nombre,
      });
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Analítica</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reportes</h1>
          <p className="mt-2 text-sm text-slate-500">
            Resumen operativo por día, semana o mes; con productos más vendidos y stock bajo.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          <BarChart3 size={14} /> Vista para el dueño
        </span>
      </div>

      <Card>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:px-6">
          <div className="w-full sm:w-56">
            <SelectField
              label="Periodo"
              value={tipo}
              onChange={(valor) => setTipo(valor as TipoReporte)}
              options={TIPOS_REPORTE}
              icon={<CalendarRange size={16} />}
            />
          </div>
          {tipo === 'RANGO' && (
            <>
              <div className="w-full sm:w-44">
                <FormField
                  id="reporte-desde"
                  type="date"
                  label="Desde"
                  value={desde}
                  onChange={(event) => setDesde(event.target.value)}
                  icon={<CalendarSearch size={17} />}
                />
              </div>
              <div className="w-full sm:w-44">
                <FormField
                  id="reporte-hasta"
                  type="date"
                  label="Hasta"
                  value={hasta}
                  onChange={(event) => setHasta(event.target.value)}
                  icon={<CalendarSearch size={17} />}
                />
              </div>
            </>
          )}
          <Button variant="secondary" icon={<Mic size={16} />}>
            Pedir por voz
          </Button>
          <Button
            onClick={handleDescargarPdf}
            disabled={!reporte || isLoading}
            loading={descargando}
            icon={<Download size={16} />}
          >
            Descargar PDF
          </Button>
        </div>

        {isError ? (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<BarChart3 size={22} />}
              title="No se pudo generar el reporte"
              description="Inténtalo nuevamente o revisa la conexión con el backend."
            />
          </div>
        ) : isLoading || !reporte ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Generando reporte
          </div>
        ) : (
          <div className="space-y-6 px-4 pb-6 sm:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <TrendingUp size={20} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">Ingresos</span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">Facturado</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatearMoneda(reporte.resumen.ingresos)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatearFechaCorta(reporte.desde)} – {formatearFechaCorta(reporte.hasta)}
                </p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <BarChart3 size={20} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">Operaciones</span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">Ventas vigentes</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {reporte.resumen.cantidadVentas}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {reporte.ventasPorOrigen.MANUAL} manuales · {reporte.ventasPorOrigen.VOZ} por voz
                </p>
              </Card>
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                    <AlertTriangle size={20} />
                  </span>
                  <span className="text-xs font-medium text-slate-400">Stock bajo</span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">Productos críticos</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {stockBajo?.length ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-400">Umbral por defecto: 5 unidades</p>
              </Card>
            </div>

            <Card title="Productos más vendidos" description="Top 5 en el periodo seleccionado">
              {reporte.productosMasVendidos.length === 0 ? (
                <EmptyState
                  icon={<Package size={22} />}
                  title="Sin ventas registradas"
                  description="Cuando registres ventas verás aquí los productos más vendidos."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {reporte.productosMasVendidos.map((producto, index) => (
                    <li
                      key={producto.productoId}
                      className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{producto.nombre}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {producto.cantidadVendida} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatearMoneda(producto.totalGenerado)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </Card>

      <Card title="Stock bajo" description="Productos activos con menos de 5 unidades disponibles">
        {stockBajo && stockBajo.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {stockBajo.map((producto) => (
              <li
                key={producto.id}
                className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <AlertTriangle size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{producto.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {producto.categoria ?? 'Sin categoría'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                  {producto.stock} unidades
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Package size={22} />}
            title="Sin alertas de stock"
            description="Todos los productos activos están por encima del umbral."
          />
        )}
      </Card>
    </div>
  );
}

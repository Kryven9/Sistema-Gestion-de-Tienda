import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarRange,
  CalendarSearch,
  Eye,
  FileText,
  Printer,
  ReceiptText,
  SearchIcon,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { SelectField } from '../components/SelectField';
import { useProductos } from '../hooks/useProductos';
import { useFacturas } from '../hooks/useFacturas';
import { useAuthStore } from '../stores/useAuthStore';
import { consultarDetalleVenta } from '../api/ventas';
import type { Factura } from '../api/facturas';

const PAGE_SIZE = 8;

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearFechaCompleta(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function FacturasPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const { productos } = useProductos();
  const {
    facturas,
    isLoading,
    filtros,
    setFiltros,
    idFacturaDetalle,
    setIdFacturaDetalle,
    facturaDetalle,
    facturaDetalleLoading,
  } = useFacturas();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const nombresProductos = useMemo(() => {
    const mapa = new Map<string, string>();
    productos.forEach((producto) => mapa.set(producto.id, producto.nombre));
    return mapa;
  }, [productos]);

  const facturasVisibles = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return facturas;
    return facturas.filter(
      (factura) =>
        factura.folio.toLowerCase().includes(term) || factura.ventaId.toLowerCase().includes(term),
    );
  }, [facturas, search]);

  const totalPages = Math.max(1, Math.ceil(facturasVisibles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginadas = facturasVisibles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalFacturado = useMemo(
    () =>
      facturasVisibles.reduce(
        (suma, factura) => (factura.estado === 'EMITIDA' ? suma + factura.total : suma),
        0,
      ),
    [facturasVisibles],
  );

  const totalAnuladas = useMemo(
    () => facturasVisibles.filter((factura) => factura.estado === 'ANULADA').length,
    [facturasVisibles],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Comprobantes</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Facturas</h1>
          <p className="mt-2 text-sm text-slate-500">
            Documentos simulados generados automáticamente por cada venta registrada.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          <FileText size={14} /> Vista imprimible lista
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ReceiptText size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Total en el periodo</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Facturas generadas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{facturasVisibles.length}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Printer size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Facturado</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Importe emitido</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatearMoneda(totalFacturado)}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <XCircle size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Sin validez</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Facturas anuladas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalAnuladas}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-end sm:px-6">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="w-full sm:w-48">
              <SelectField
                label="Alcance"
                value={filtros.alcance}
                onChange={(valor) =>
                  setFiltros((actual) => ({
                    ...actual,
                    alcance: valor as 'dia' | 'rango',
                  }))
                }
                options={[
                  { value: 'dia', label: 'Hoy' },
                  { value: 'rango', label: 'Por rango' },
                ]}
                icon={<CalendarRange size={16} />}
              />
            </div>
            {filtros.alcance === 'rango' && (
              <>
                <div className="w-full sm:w-44">
                  <FormField
                    id="facturas-desde"
                    type="date"
                    label="Desde"
                    value={filtros.desde}
                    onChange={(event) =>
                      setFiltros((actual) => ({ ...actual, desde: event.target.value }))
                    }
                    icon={<CalendarSearch size={17} />}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <FormField
                    id="facturas-hasta"
                    type="date"
                    label="Hasta"
                    value={filtros.hasta}
                    onChange={(event) =>
                      setFiltros((actual) => ({ ...actual, hasta: event.target.value }))
                    }
                    icon={<CalendarSearch size={17} />}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-end gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por folio o venta"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 sm:w-64"
              />
            </div>
            <p className="hidden whitespace-nowrap text-sm text-slate-500 sm:block">
              <span className="font-semibold text-slate-700">{facturasVisibles.length}</span>{' '}
              facturas
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando facturas
          </div>
        ) : paginadas.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={22} />}
            title={search ? 'Sin resultados' : 'Aún no hay facturas'}
            description={
              search
                ? 'Prueba ajustando la búsqueda o el filtro de fechas.'
                : 'Las facturas se generan automáticamente al registrar ventas.'
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Folio</th>
                    <th className="px-6 py-3">Venta</th>
                    <th className="px-6 py-3">Fecha de emisión</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginadas.map((factura) => (
                    <FilaFactura
                      key={factura.id}
                      factura={factura}
                      onVer={() => setIdFacturaDetalle(factura.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {paginadas.map((factura) => (
                <div key={factura.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium text-slate-800">
                        {factura.folio}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatearFechaCompleta(factura.fechaEmision)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatearMoneda(factura.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${factura.estado === 'EMITIDA' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${factura.estado === 'EMITIDA' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                      {factura.estado === 'EMITIDA' ? 'Emitida' : 'Anulada'}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={15} />}
                      onClick={() => setIdFacturaDetalle(factura.id)}
                    >
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={!!idFacturaDetalle}
        onClose={() => setIdFacturaDetalle(null)}
        title="Factura simulada"
        description="Documento imprimible generado para esta venta."
      >
        {facturaDetalleLoading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando factura
          </div>
        ) : facturaDetalle ? (
          <FacturaDetalle
            factura={facturaDetalle}
            nombreVendedor={usuario?.nombre ?? 'Vendedor'}
            nombresProductos={nombresProductos}
          />
        ) : (
          <EmptyState
            icon={<ReceiptText size={22} />}
            title="Sin información"
            description="No se encontró la factura solicitada."
          />
        )}
      </Modal>
    </div>
  );
}

function FilaFactura({ factura, onVer }: { factura: Factura; onVer: () => void }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-6 py-4 font-mono text-sm text-slate-700">{factura.folio}</td>
      <td className="px-6 py-4 font-mono text-xs text-slate-500">{factura.ventaId.slice(0, 8)}</td>
      <td className="px-6 py-4 text-slate-700">{formatearFechaCompleta(factura.fechaEmision)}</td>
      <td className="px-6 py-4 font-semibold text-slate-800">{formatearMoneda(factura.total)}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${factura.estado === 'EMITIDA' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${factura.estado === 'EMITIDA' ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
          {factura.estado === 'EMITIDA' ? 'Emitida' : 'Anulada'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={onVer}>
          Ver
        </Button>
      </td>
    </tr>
  );
}

function FacturaDetalle({
  factura,
  nombreVendedor,
  nombresProductos,
}: {
  factura: Factura;
  nombreVendedor: string;
  nombresProductos: Map<string, string>;
}) {
  const ventaQuery = useQuery({
    queryKey: ['venta-para-factura', factura.ventaId],
    queryFn: () => consultarDetalleVenta(factura.ventaId),
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 print:border-0">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Factura simulada</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{factura.folio}</p>
            <p className="text-xs text-slate-500">Venta #{factura.ventaId.slice(0, 8)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">Fecha de emisión</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatearFechaCompleta(factura.fechaEmision)}
            </p>
            <p className="text-xs text-slate-500">Vendedor: {nombreVendedor}</p>
          </div>
        </div>

        <div className="py-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">Productos</p>
          {ventaQuery.isLoading ? (
            <p className="text-xs text-slate-500">Cargando productos…</p>
          ) : (ventaQuery.data?.detalles ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">No se encontraron líneas para esta venta.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {(ventaQuery.data?.detalles ?? []).map((detalle) => (
                <li key={detalle.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {nombresProductos.get(detalle.productoId) ??
                        `Producto ${detalle.productoId.slice(0, 6)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {detalle.cantidad} × {formatearMoneda(detalle.precioUnitario)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatearMoneda(detalle.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs uppercase tracking-wider text-slate-400">Total</span>
          <span className="text-2xl font-semibold text-slate-900">
            {formatearMoneda(factura.total)}
          </span>
        </div>

        <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          {factura.leyenda}
        </p>
      </div>
      <div className="flex justify-end gap-3 print:hidden">
        <Button icon={<Printer size={16} />} onClick={() => window.print()}>
          Vista imprimible
        </Button>
      </div>
      ß
    </div>
  );
}

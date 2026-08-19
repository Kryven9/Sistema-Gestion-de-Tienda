import { useMemo, useState } from 'react';
import {
  Ban,
  CalendarRange,
  CalendarSearch,
  Eye,
  FileText,
  Plus,
  ReceiptText,
  SearchIcon,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { SelectField } from '../components/SelectField';
import { useOperadores } from '../hooks/useOperadores';
import { useProductos } from '../hooks/useProductos';
import { useVentas } from '../hooks/useVentas';
import type { Venta } from '../api/ventas';

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

function formatearHora(fechaIso: string): string {
  return new Date(fechaIso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VentasPage() {
  const { operadores } = useOperadores();
  const {
    esDueno,
    ventas,
    isLoading,
    filtros,
    setFiltros,
    mostrarFormulario,
    lineas,
    error,
    registrarPending,
    anularPending,
    abrirFormulario,
    cerrarFormulario,
    actualizarLinea,
    agregarLinea,
    eliminarLinea,
    handleRegistrar,
    totalEstimado,
    idVentaDetalle,
    setIdVentaDetalle,
    ventaDetalle,
    ventaDetalleLoading,
    anular,
  } = useVentas();

  const { productos } = useProductos();
  const productosActivos = useMemo(
    () => productos.filter((producto) => producto.activo),
    [productos],
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const vendedores = useMemo(
    () => [
      { id: 'todos', nombre: 'Todos los vendedores', rol: '' },
      ...operadores.map((operador) => ({
        id: operador.id,
        nombre: operador.nombre,
        rol: operador.rol,
      })),
    ],
    [operadores],
  );

  const nombrePorVendedor = useMemo(() => {
    const mapa = new Map<string, string>();
    vendedores.forEach((vendedor) => mapa.set(vendedor.id, vendedor.nombre));
    return mapa;
  }, [vendedores]);

  const ventasVisibles = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtradas = ventas.filter((venta) => {
      if (esDueno && filtros.vendedorId !== 'todos' && venta.usuarioId !== filtros.vendedorId) {
        return false;
      }
      if (!term) return true;
      const nombreVendedor = nombrePorVendedor.get(venta.usuarioId) ?? '';
      return (
        venta.id.toLowerCase().includes(term) ||
        venta.usuarioId.toLowerCase().includes(term) ||
        nombreVendedor.toLowerCase().includes(term) ||
        venta.origen.toLowerCase().includes(term)
      );
    });
    return filtradas;
  }, [ventas, search, esDueno, filtros.vendedorId, nombrePorVendedor]);

  const totalPages = Math.max(1, Math.ceil(ventasVisibles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginadas = ventasVisibles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalPeriodo = useMemo(
    () => ventasVisibles.reduce((suma, venta) => (venta.anulada ? suma : suma + venta.total), 0),
    [ventasVisibles],
  );

  const totalAnuladas = useMemo(
    () => ventasVisibles.filter((venta) => venta.anulada).length,
    [ventasVisibles],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Operación</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ventas</h1>
          <p className="mt-2 text-sm text-slate-500">
            {esDueno
              ? 'Consulta, registra y administra las ventas de tu tienda.'
              : 'Registra tus ventas y consulta las operaciones del día.'}
          </p>
        </div>
        <Button onClick={abrirFormulario} icon={<Plus size={18} />}>
          Registrar venta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingBag size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Total acumulado</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Ventas en el periodo</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{ventasVisibles.length}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Ingresos</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Total facturado</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatearMoneda(totalPeriodo)}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <Ban size={20} />
            </span>
            <span className="text-xs font-medium text-slate-400">Sin validez</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Ventas anuladas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalAnuladas}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-end sm:px-6">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {esDueno && (
              <>
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
                        id="ventas-desde"
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
                        id="ventas-hasta"
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
                <div className="w-full sm:w-56">
                  <SelectField
                    label="Vendedor"
                    value={filtros.vendedorId}
                    onChange={(valor) => setFiltros((actual) => ({ ...actual, vendedorId: valor }))}
                    options={vendedores.map((vendedor) => ({
                      value: vendedor.id,
                      label: vendedor.rol
                        ? `${vendedor.nombre} · ${vendedor.rol.toLowerCase()}`
                        : vendedor.nombre,
                    }))}
                    icon={<Users size={16} />}
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
                placeholder={
                  esDueno ? 'Buscar por folio, vendedor u origen' : 'Buscar por folio u origen'
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 sm:w-64"
              />
            </div>
            <p className="hidden whitespace-nowrap text-sm text-slate-500 sm:block">
              <span className="font-semibold text-slate-700">{ventasVisibles.length}</span> ventas
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando ventas
          </div>
        ) : paginadas.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={22} />}
            title={search ? 'Sin resultados' : 'Aún no hay ventas'}
            description={
              search
                ? 'Prueba ajustando la búsqueda o el filtro de fechas.'
                : 'Registra tu primera venta con el botón superior derecho.'
            }
            action={!search && <Button onClick={abrirFormulario}>Crear venta</Button>}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Folio</th>
                    <th className="px-6 py-3">Fecha</th>
                    {esDueno && <th className="px-6 py-3">Vendedor</th>}
                    <th className="px-6 py-3">Origen</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginadas.map((venta) => (
                    <FilaVenta
                      key={venta.id}
                      venta={venta}
                      esDueno={esDueno}
                      nombreVendedor={nombrePorVendedor.get(venta.usuarioId) ?? 'Vendedor'}
                      onVer={() => setIdVentaDetalle(venta.id)}
                      onAnular={anular}
                      anularPending={anularPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {paginadas.map((venta) => (
                <div key={venta.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        Folio{' '}
                        <span className="font-mono text-xs text-slate-500">
                          {venta.id.slice(0, 8)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatearFechaCompleta(venta.fecha)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatearMoneda(venta.total)}
                    </span>
                  </div>
                  {esDueno && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <UserRound size={12} />
                      {nombrePorVendedor.get(venta.usuarioId) ?? 'Vendedor'}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{venta.origen === 'VOZ' ? 'Por voz' : 'Manual'}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${venta.anulada ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${venta.anulada ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      />
                      {venta.anulada ? 'Anulada' : 'Vigente'}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={15} />}
                      onClick={() => setIdVentaDetalle(venta.id)}
                    >
                      Ver detalle
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
        open={mostrarFormulario}
        onClose={cerrarFormulario}
        title="Registrar venta"
        description="Selecciona los productos y cantidades a vender."
      >
        <form onSubmit={handleRegistrar} className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <div className="space-y-3">
            {lineas.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                Aún no agregas productos a esta venta.
              </p>
            ) : (
              lineas.map((linea, indice) => {
                const producto = productosActivos.find((item) => item.id === linea.productoId);
                const opcionesDisponibles = productosActivos
                  .filter(
                    (item) =>
                      item.id === linea.productoId ||
                      !lineas.some((otra) => otra.productoId === item.id),
                  )
                  .map((item) => ({
                    value: item.id,
                    label: `${item.nombre} · ${formatearMoneda(item.precio)} · Stock ${item.stock}`,
                  }));
                const sinOpciones = opcionesDisponibles.length === 0;
                return (
                  <div
                    key={`linea-${indice}`}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_120px_auto] sm:items-end"
                  >
                    <SelectField
                      label="Producto"
                      value={linea.productoId}
                      onChange={(valor) => actualizarLinea(indice, { productoId: valor })}
                      options={opcionesDisponibles}
                      placeholder={
                        sinOpciones ? 'Sin productos disponibles' : 'Selecciona un producto'
                      }
                      icon={<ShoppingCart size={16} />}
                      required
                    />
                    <FormField
                      id={`linea-cantidad-${indice}`}
                      type="number"
                      label="Cantidad"
                      value={linea.cantidad}
                      onChange={(event) =>
                        actualizarLinea(indice, { cantidad: event.target.value })
                      }
                      min={1}
                      step="1"
                      max={producto?.stock ?? undefined}
                      hint={producto ? `Disponible: ${producto.stock}` : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar línea"
                      onClick={() => eliminarLinea(indice)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                agregarLinea(productosActivos);
              }}
              icon={<Plus size={16} />}
              disabled={productosActivos.length === lineas.length}
            >
              Agregar producto
            </Button>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total estimado</p>
              <p className="text-xl font-semibold text-slate-900">
                {formatearMoneda(totalEstimado(productosActivos))}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="secondary" onClick={cerrarFormulario}>
              Cancelar
            </Button>
            <Button type="submit" loading={registrarPending} icon={<ShoppingBag size={17} />}>
              Registrar venta
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!idVentaDetalle}
        onClose={() => setIdVentaDetalle(null)}
        title="Detalle de venta"
        description="Resumen de los productos vendidos en esta operación."
      >
        {ventaDetalleLoading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando venta
          </div>
        ) : ventaDetalle ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Folio</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-700">{ventaDetalle.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Fecha</p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatearFechaCompleta(ventaDetalle.fecha)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Origen</p>
                <p className="mt-1 text-sm text-slate-700">
                  {ventaDetalle.origen === 'VOZ' ? 'Por voz' : 'Manual'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={16} /> Productos
              </h3>
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {(ventaDetalle.detalles ?? []).map((detalle) => {
                  const producto = productos.find((item) => item.id === detalle.productoId);
                  return (
                    <li
                      key={detalle.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {producto?.nombre ?? `Producto ${detalle.productoId.slice(0, 6)}`}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {detalle.cantidad} × {formatearMoneda(detalle.precioUnitario)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatearMoneda(detalle.subtotal)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${ventaDetalle.anulada ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ventaDetalle.anulada ? 'bg-rose-500' : 'bg-emerald-500'}`}
                />
                {ventaDetalle.anulada ? 'Venta anulada' : 'Venta vigente'}
              </span>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatearMoneda(ventaDetalle.total)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setIdVentaDetalle(null)}>
                Cerrar
              </Button>
              {esDueno && !ventaDetalle.anulada && (
                <Button
                  variant="danger"
                  loading={anularPending}
                  onClick={() => anular(ventaDetalle.id)}
                  icon={<Ban size={16} />}
                >
                  Anular venta
                </Button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<ReceiptText size={22} />}
            title="Sin información"
            description="No se encontró la venta solicitada."
          />
        )}
      </Modal>
    </div>
  );
}

function FilaVenta({
  venta,
  esDueno,
  nombreVendedor,
  onVer,
  onAnular,
  anularPending,
}: {
  venta: Venta;
  esDueno: boolean;
  nombreVendedor: string;
  onVer: () => void;
  onAnular: (id: string) => void;
  anularPending: boolean;
}) {
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-6 py-4 font-mono text-xs text-slate-500">{venta.id.slice(0, 8)}</td>
      <td className="px-6 py-4 text-slate-700">
        <div className="flex flex-col">
          <span>{new Date(venta.fecha).toLocaleDateString('es-MX')}</span>
          <span className="text-xs text-slate-400">{formatearHora(venta.fecha)}</span>
        </div>
      </td>
      {esDueno && (
        <td className="px-6 py-4 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {nombreVendedor.charAt(0).toUpperCase()}
            </span>
            <span>{nombreVendedor}</span>
          </div>
        </td>
      )}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${venta.origen === 'VOZ' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}
        >
          {venta.origen === 'VOZ' ? 'Por voz' : 'Manual'}
        </span>
      </td>
      <td className="px-6 py-4 font-semibold text-slate-800">{formatearMoneda(venta.total)}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${venta.anulada ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${venta.anulada ? 'bg-rose-500' : 'bg-emerald-500'}`}
          />
          {venta.anulada ? 'Anulada' : 'Vigente'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={onVer}>
            Ver
          </Button>
          {esDueno && !venta.anulada && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Ban size={15} />}
              disabled={anularPending}
              onClick={() => onAnular(venta.id)}
            >
              Anular
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

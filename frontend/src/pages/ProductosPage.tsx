import { useMemo, useState } from 'react';
import {
  Box,
  DollarSign,
  Edit3,
  Filter,
  Package,
  Plus,
  Search as SearchIcon,
  Tag,
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { SelectField } from '../components/SelectField';
import { useProductos } from '../hooks/useProductos';

const PAGE_SIZE = 8;

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(valor);
}

export function ProductosPage() {
  const {
    productos,
    isLoading,
    categorias,
    mostrarFormulario,
    editando,
    formulario,
    error,
    crearPending,
    editarPending,
    togglePending,
    handleSubmit,
    iniciarEdicion,
    abrirFormularioCrear,
    cerrarFormulario,
    toggleEstado,
    actualizarCampo,
  } = useProductos();

  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [page, setPage] = useState(1);

  const filtrados = useMemo(() => {
    const term = search.toLowerCase().trim();
    return productos.filter((producto) => {
      const coincideNombre =
        !term ||
        producto.nombre.toLowerCase().includes(term) ||
        (producto.categoria ?? '').toLowerCase().includes(term);
      const coincideCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
      return coincideNombre && coincideCategoria;
    });
  }, [productos, search, filtroCategoria]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginados = filtrados.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Inventario</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Productos
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Crea, edita y gestiona los productos de tu tienda.
          </p>
        </div>
        <Button onClick={abrirFormularioCrear} icon={<Plus size={18} />}>
          Nuevo producto
        </Button>
      </div>

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre o categoría"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <SelectField
              label=""
              value={filtroCategoria}
              onChange={(value) => {
                setFiltroCategoria(value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categorias.map((c) => ({ value: c, label: c })),
              ]}
              icon={<Filter size={16} />}
            />
            <p className="hidden whitespace-nowrap text-sm text-slate-500 sm:block">
              <span className="font-semibold text-slate-700">{filtrados.length}</span> productos
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando productos
          </div>
        ) : paginados.length === 0 ? (
          <EmptyState
            icon={<Package size={22} />}
            title={search || filtroCategoria ? 'Sin resultados' : 'No hay productos'}
            description={
              search || filtroCategoria
                ? 'Ajusta los filtros para encontrar productos.'
                : 'Crea el primer producto para empezar tu catálogo.'
            }
            action={
              !search &&
              !filtroCategoria && <Button onClick={abrirFormularioCrear}>Crear producto</Button>
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Producto</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3">Precio</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginados.map((producto) => (
                    <tr key={producto.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Box size={18} />
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{producto.nombre}</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Creado el{' '}
                              {new Date(producto.fechaCreacion).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {producto.categoria ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            <Tag size={12} /> {producto.categoria}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Sin categoría</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {formatearMoneda(producto.precio)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${producto.stock > 10 ? 'bg-emerald-50 text-emerald-700' : producto.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}
                        >
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                              {producto.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={producto.activo}
                              aria-label={`${producto.activo ? 'Desactivar' : 'Activar'} producto ${producto.nombre}`}
                              onClick={() => toggleEstado(producto)}
                              disabled={togglePending}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${producto.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span
                                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${producto.activo ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => iniciarEdicion(producto)}
                            icon={<Edit3 size={15} />}
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {paginados.map((producto) => (
                <div key={producto.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Box size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{producto.nombre}</p>
                        <p className="truncate text-xs text-slate-500">
                          {formatearMoneda(producto.precio)} · {producto.stock} unidades
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => iniciarEdicion(producto)}
                      aria-label="Editar producto"
                    >
                      <Edit3 size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{producto.categoria ?? 'Sin categoría'}</span>
                    <div className="flex items-center gap-3">
                      <span>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={producto.activo}
                        aria-label={`${producto.activo ? 'Desactivar' : 'Activar'} producto ${producto.nombre}`}
                        onClick={() => toggleEstado(producto)}
                        disabled={togglePending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${producto.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${producto.activo ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
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
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        description={
          editando
            ? 'Actualiza el nombre, precio o categoría del producto.'
            : 'Completa los datos para registrar un nuevo producto.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <FormField
            id="producto-nombre"
            label="Nombre del producto"
            value={formulario.nombre}
            onChange={(event) => actualizarCampo('nombre', event.target.value)}
            placeholder="Café Americano"
            icon={<Package size={17} />}
            required
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="producto-precio"
              type="number"
              label="Precio"
              value={formulario.precio}
              onChange={(event) => actualizarCampo('precio', event.target.value)}
              placeholder="0.00"
              min={0}
              step="0.01"
              icon={<DollarSign size={17} />}
              required
            />
            {!editando && (
              <FormField
                id="producto-stock"
                type="number"
                label="Stock inicial"
                value={formulario.stock}
                onChange={(event) => actualizarCampo('stock', event.target.value)}
                placeholder="0"
                min={0}
                step="1"
                icon={<Box size={17} />}
                required
              />
            )}
          </div>
          <FormField
            id="producto-categoria"
            label="Categoría"
            value={formulario.categoria}
            onChange={(event) => actualizarCampo('categoria', event.target.value)}
            placeholder="Ej. Bebidas, Panadería, Comida"
            icon={<Tag size={17} />}
            hint="Opcional. Se usará para filtrar en el catálogo."
          />
          {editando && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              El stock actual es de <span className="font-semibold">{editando.stock}</span> unidades
              y no se puede modificar desde aquí.
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="secondary" onClick={cerrarFormulario}>
              Cancelar
            </Button>
            <Button type="submit" loading={crearPending || editarPending}>
              {editando ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

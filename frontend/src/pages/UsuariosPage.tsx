import { useMemo, useState } from 'react';
import { Edit3, Mail, Plus, Search, UserRound, Users } from 'lucide-react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { useOperadores } from '../hooks/useOperadores';

const PAGE_SIZE = 10;

export function UsuariosPage() {
  const {
    operadores,
    isLoading,
    mostrarFormulario,
    editando,
    nombre,
    setNombre,
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    crearPending,
    editarPending,
    togglePending,
    handleSubmit,
    iniciarEdicion,
    abrirFormularioCrear,
    cerrarFormulario,
    toggleEstado,
  } = useOperadores();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtrados = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return operadores;
    return operadores.filter(
      (operador) =>
        operador.nombre.toLowerCase().includes(term) ||
        operador.correo.toLowerCase().includes(term),
    );
  }, [operadores, search]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginados = filtrados.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Administración</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Usuarios</h1>
          <p className="mt-2 text-sm text-slate-500">Gestiona operadores, permisos y accesos.</p>
        </div>
        <Button onClick={abrirFormularioCrear} icon={<Plus size={18} />}>
          Nuevo operador
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre o correo"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{filtrados.length}</span> usuarios
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Cargando usuarios
          </div>
        ) : paginados.length === 0 ? (
          <EmptyState
            icon={<Users size={22} />}
            title={search ? 'Sin resultados' : 'No hay operadores'}
            description={
              search
                ? 'Prueba con otro nombre o correo electrónico.'
                : 'Crea el primer operador para comenzar a gestionar tu equipo.'
            }
            action={!search && <Button onClick={abrirFormularioCrear}>Crear operador</Button>}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Usuario</th>
                    <th className="px-6 py-3">Rol</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginados.map((operador) => (
                    <tr key={operador.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                            {operador.nombre.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{operador.nombre}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={12} /> {operador.correo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{operador.rol}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                              {operador.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={operador.activo}
                              aria-label={`${operador.activo ? 'Desactivar' : 'Activar'} cuenta de ${operador.nombre}`}
                              onClick={() => toggleEstado(operador)}
                              disabled={togglePending}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${operador.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span
                                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${operador.activo ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => iniciarEdicion(operador)}
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
              {paginados.map((operador) => (
                <div key={operador.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                        {operador.nombre.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{operador.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{operador.correo}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => iniciarEdicion(operador)}
                      aria-label="Editar usuario"
                    >
                      <Edit3 size={16} />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{operador.rol}</span>
                    <div className="flex items-center gap-3">
                      <span>{operador.activo ? 'Activo' : 'Inactivo'}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={operador.activo}
                        aria-label={`${operador.activo ? 'Desactivar' : 'Activar'} cuenta de ${operador.nombre}`}
                        onClick={() => toggleEstado(operador)}
                        disabled={togglePending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${operador.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${operador.activo ? 'translate-x-6' : 'translate-x-1'}`}
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
        title={editando ? 'Editar operador' : 'Nuevo operador'}
        description={
          editando
            ? 'Actualiza la información del usuario.'
            : 'Completa los datos para crear un nuevo acceso.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <FormField
            id="nombre"
            label="Nombre completo"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nombre del operador"
            icon={<UserRound size={17} />}
            required
          />
          {!editando && (
            <>
              <FormField
                id="correo"
                type="email"
                label="Correo electrónico"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="operador@tienda.com"
                icon={<Mail size={17} />}
                required
              />
              <FormField
                id="password"
                type="password"
                label="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                hint="Debe tener al menos 6 caracteres."
                minLength={6}
                required
              />
            </>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="secondary" onClick={cerrarFormulario}>
              Cancelar
            </Button>
            <Button type="submit" loading={crearPending || editarPending}>
              {editando ? 'Guardar cambios' : 'Crear operador'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

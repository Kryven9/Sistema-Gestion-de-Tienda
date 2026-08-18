import { useOperadores } from '../hooks/useOperadores';

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
    toggleEstado,
  } = useOperadores();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Usuarios Operadores</h2>
        <button
          onClick={abrirFormularioCrear}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo Operador
        </button>
      </div>

      {mostrarFormulario && (
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium">
            {editando ? 'Editar Operador' : 'Crear Operador'}
          </h3>

          {error && (
            <div className="mb-4 rounded bg-red-600/20 p-3 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-300">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!editando && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Correo electrónico</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="w-full rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-300">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={crearPending || editarPending}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editando ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : operadores.length === 0 ? (
        <p className="text-gray-400">No hay operadores registrados.</p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700 bg-gray-750">
              <tr>
                <th className="px-4 py-3 text-gray-300">Nombre</th>
                <th className="px-4 py-3 text-gray-300">Correo</th>
                <th className="px-4 py-3 text-gray-300">Estado</th>
                <th className="px-4 py-3 text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((op) => (
                <tr key={op.id} className="border-b border-gray-700">
                  <td className="px-4 py-3 text-white">{op.nombre}</td>
                  <td className="px-4 py-3 text-gray-300">{op.correo}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleEstado(op)}
                      disabled={togglePending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        op.activo ? 'bg-green-600' : 'bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          op.activo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => iniciarEdicion(op)}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

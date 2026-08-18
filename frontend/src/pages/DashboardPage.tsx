import { useAuthStore } from '../stores/useAuthStore';

export function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-500">Resumen general</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hola, {usuario?.nombre}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Todo lo importante de tu tienda en un solo lugar.
          </p>
        </div>
      </div>
    </div>
  );
}

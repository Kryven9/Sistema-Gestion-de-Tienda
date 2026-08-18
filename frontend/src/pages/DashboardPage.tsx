import { useAuthStore } from '../stores/useAuthStore';

export function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
      <p className="text-gray-400">
        Bienvenido, <span className="text-white font-medium">{usuario?.nombre}</span>. Has iniciado
        sesión como <span className="text-blue-400">{usuario?.rol}</span>.
      </p>
    </div>
  );
}

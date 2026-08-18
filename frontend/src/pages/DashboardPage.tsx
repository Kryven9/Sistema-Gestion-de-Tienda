import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Gestión de Tienda</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {usuario?.nombre} ({usuario?.rol})
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-400">
          Bienvenido, <span className="text-white font-medium">{usuario?.nombre}</span>. Has
          iniciado sesión como <span className="text-blue-400">{usuario?.rol}</span>.
        </p>
      </main>
    </div>
  );
}

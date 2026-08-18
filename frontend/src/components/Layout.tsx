import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/usuarios', label: 'Usuarios', soloDueno: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const itemsVisibles = navItems.filter(
    (item) => !item.soloDueno || usuario?.rol === 'DUENO',
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Gestión de Tienda</h1>
            <nav className="flex gap-4">
              {itemsVisibles.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'text-white font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

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

      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}

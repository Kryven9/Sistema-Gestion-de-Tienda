import { useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from './Button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
  { path: '/usuarios', label: 'Usuarios', icon: Users, soloDueno: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true',
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const itemsVisibles = navItems.filter((item) => !item.soloDueno || usuario?.rol === 'DUENO');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar navegacion"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-64'} ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}`}
      >
        <div
          className={`flex h-20 items-center border-b border-slate-100 ${collapsed ? 'lg:justify-center lg:px-3' : 'justify-between px-5'}`}
        >
          <Link to="/" className={`flex items-center gap-3 ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Store size={20} />
            </span>
            <span>
              <span className="block font-semibold leading-tight">Tienda</span>
              <span className="block text-xs text-slate-500">Panel de gestión</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={collapsed ? 'lg:flex' : ''}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {itemsVisibles.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex h-11 items-center rounded-xl text-sm font-medium transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'} ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Icon size={19} />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div
            className={`mb-2 flex items-center rounded-xl bg-slate-50 p-3 ${collapsed ? 'lg:justify-center' : 'gap-3'}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </span>
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-medium text-slate-800">{usuario?.nombre}</p>
              <p className="truncate text-xs capitalize text-slate-500">
                {usuario?.rol.toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className={`w-full ${collapsed ? 'lg:px-0' : 'justify-start'}`}
            onClick={handleLogout}
            title={collapsed ? 'Cerrar sesión' : undefined}
            icon={<LogOut size={18} />}
          >
            <span className={collapsed ? 'lg:hidden' : ''}>Cerrar sesión</span>
          </Button>
        </div>
      </aside>

      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir navegacion"
          >
            <Menu size={21} />
          </Button>
          <span className="ml-3 font-semibold">Gestión de Tienda</span>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

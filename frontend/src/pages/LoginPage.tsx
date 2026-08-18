import { LockKeyhole, Mail, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { useLogin } from '../hooks/useLogin';

export function LoginPage() {
  const { correo, setCorreo, password, setPassword, error, cargando, handleSubmit } = useLogin();

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <div className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900">
            <Store size={22} />
          </span>
          <span className="text-lg font-semibold">Gestión de Tienda</span>
        </div>
        <div className="max-w-lg">
          <p className="text-4xl font-semibold leading-tight tracking-tight">
            Administra tu negocio de forma simple y eficiente.
          </p>
          <p className="mt-5 text-slate-400">
            Todo lo que necesitas, en un espacio claro y organizado.
          </p>
        </div>
        <p className="text-sm text-slate-500">Panel de gestión seguro</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Store size={22} />
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Bienvenido de nuevo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Inicia sesión</h1>
          <p className="mt-2 text-sm text-slate-500">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <Alert>{error}</Alert>}
            <FormField
              id="correo"
              type="email"
              label="Correo electrónico"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="correo@ejemplo.com"
              icon={<Mail size={17} />}
              required
            />
            <FormField
              id="password"
              type="password"
              label="Contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              icon={<LockKeyhole size={17} />}
              required
            />
            <Button type="submit" className="w-full" loading={cargando}>
              Ingresar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-slate-900 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

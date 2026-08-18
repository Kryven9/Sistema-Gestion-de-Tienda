import { LockKeyhole, Mail, Store, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { useRegistro } from '../hooks/useRegistro';

export function RegistroPage() {
  const {
    nombreTienda,
    setNombreTienda,
    nombreUsuario,
    setNombreUsuario,
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    cargando,
    handleSubmit,
  } = useRegistro();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Store size={23} />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-slate-500">Configura tu tienda en unos pocos pasos.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}
            <FormField
              id="tienda"
              label="Nombre de la tienda"
              value={nombreTienda}
              onChange={(event) => setNombreTienda(event.target.value)}
              placeholder="Mi tienda"
              icon={<Store size={17} />}
              required
            />
            <FormField
              id="nombre"
              label="Tu nombre"
              value={nombreUsuario}
              onChange={(event) => setNombreUsuario(event.target.value)}
              placeholder="Nombre completo"
              icon={<UserRound size={17} />}
              required
            />
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
              placeholder="Mínimo 6 caracteres"
              icon={<LockKeyhole size={17} />}
              hint="Usa al menos 6 caracteres."
              minLength={6}
              required
            />
            <Button type="submit" className="w-full" loading={cargando}>
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

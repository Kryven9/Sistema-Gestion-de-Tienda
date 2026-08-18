import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface Props {
  children: React.ReactNode;
  rolesPermitidos?: string[];
}

export function ProtectedRoute({ children, rolesPermitidos }: Props) {
  const estaAutenticado = useAuthStore((s) => s.estaAutenticado);
  const usuario = useAuthStore((s) => s.usuario);

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

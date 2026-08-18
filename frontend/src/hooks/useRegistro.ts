import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrar, login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

export function useRegistro() {
  const [nombreTienda, setNombreTienda] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await registrar({ nombreTienda, nombreUsuario, correo, password });
      const loginResultado = await login(correo, password);
      iniciarSesion(loginResultado.token, loginResultado.usuario);
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Error al registrar');
      } else {
        setError('Error al registrar');
      }
    } finally {
      setCargando(false);
    }
  };

  return {
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
  };
}

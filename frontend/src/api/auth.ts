import api from './client';

export interface UsuarioSesion {
  id: string;
  tiendaId: string;
  nombre: string;
  correo: string;
  rol: string;
}

export interface RegistroResponse {
  tienda: { id: string; nombre: string };
  usuario: UsuarioSesion;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

export async function registrar(datos: {
  nombreTienda: string;
  nombreUsuario: string;
  correo: string;
  password: string;
}): Promise<RegistroResponse> {
  const { data } = await api.post<RegistroResponse>('/auth/registro', datos);
  return data;
}

export async function login(correo: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { correo, password });
  return data;
}

export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<void> {
  await api.post('/auth/cambiar-password', { passwordActual, passwordNueva });
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

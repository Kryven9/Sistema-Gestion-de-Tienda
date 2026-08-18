import api from './client';

export interface Operador {
  id: string;
  tiendaId: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export async function listarOperadores(): Promise<Operador[]> {
  const { data } = await api.get<Operador[]>('/usuarios');
  return data;
}

export async function crearOperador(datos: {
  nombre: string;
  correo: string;
  password: string;
}): Promise<Operador> {
  const { data } = await api.post<Operador>('/usuarios', datos);
  return data;
}

export async function editarOperador(id: string, datos: { nombre: string }): Promise<Operador> {
  const { data } = await api.put<Operador>(`/usuarios/${id}`, datos);
  return data;
}

export async function desactivarOperador(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

export async function activarOperador(id: string): Promise<void> {
  await api.patch(`/usuarios/${id}/activar`);
}

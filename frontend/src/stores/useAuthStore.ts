import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioSesion } from '../api/auth';

interface AuthState {
  usuario: UsuarioSesion | null;
  token: string | null;
  estaAutenticado: boolean;
  iniciarSesion: (token: string, usuario: UsuarioSesion) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      estaAutenticado: false,

      iniciarSesion: (token, usuario) =>
        set({ token, usuario, estaAutenticado: true }),

      cerrarSesion: () =>
        set({ token: null, usuario: null, estaAutenticado: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        estaAutenticado: state.estaAutenticado,
      }),
    },
  ),
);

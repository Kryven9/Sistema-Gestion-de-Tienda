import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarOperadores,
  crearOperador,
  editarOperador,
  desactivarOperador,
  activarOperador,
} from '../api/usuarios';
import type { Operador } from '../api/usuarios';

function extraerError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error || 'Error desconocido';
  }
  return 'Error desconocido';
}

export function useOperadores() {
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Operador | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { data: operadores = [], isLoading } = useQuery({
    queryKey: ['operadores'],
    queryFn: listarOperadores,
  });

  const limpiarFormulario = () => {
    setNombre('');
    setCorreo('');
    setPassword('');
    setEditando(null);
    setMostrarFormulario(false);
    setError('');
  };

  const crearMutation = useMutation({
    mutationFn: crearOperador,
    onSuccess: async (operadorCreado) => {
      queryClient.setQueryData<Operador[]>(['operadores'], (actuales = []) => {
        if (actuales.some((operador) => operador.id === operadorCreado.id)) return actuales;
        return [operadorCreado, ...actuales];
      });
      limpiarFormulario();
      await queryClient.invalidateQueries({ queryKey: ['operadores'], refetchType: 'active' });
    },
    onError: (err: unknown) => {
      setError(extraerError(err));
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) => editarOperador(id, { nombre }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operadores'] });
      limpiarFormulario();
    },
    onError: (err: unknown) => {
      setError(extraerError(err));
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: async (operador: Operador) => {
      if (operador.activo) {
        await desactivarOperador(operador.id);
      } else {
        await activarOperador(operador.id);
      }
      return operador;
    },
    onSuccess: (operadorActualizado) => {
      queryClient.setQueryData<Operador[]>(['operadores'], (actuales = []) =>
        actuales.map((operador) =>
          operador.id === operadorActualizado.id
            ? { ...operador, activo: !operadorActualizado.activo }
            : operador,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['operadores'], refetchType: 'active' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (editando) {
      editarMutation.mutate({ id: editando.id, nombre });
    } else {
      crearMutation.mutate({ nombre, correo, password });
    }
  };

  const iniciarEdicion = (operador: Operador) => {
    setEditando(operador);
    setNombre(operador.nombre);
    setCorreo(operador.correo);
    setMostrarFormulario(true);
    setError('');
  };

  const abrirFormularioCrear = () => {
    setMostrarFormulario(true);
    setEditando(null);
    setNombre('');
    setCorreo('');
    setPassword('');
    setError('');
  };

  return {
    operadores,
    isLoading,
    mostrarFormulario,
    editando,
    nombre,
    setNombre,
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    crearPending: crearMutation.isPending,
    editarPending: editarMutation.isPending,
    togglePending: toggleEstadoMutation.isPending,
    handleSubmit,
    iniciarEdicion,
    abrirFormularioCrear,
    cerrarFormulario: limpiarFormulario,
    toggleEstado: toggleEstadoMutation.mutate,
  };
}

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activarProducto,
  crearProducto,
  desactivarProducto,
  editarProducto,
  listarProductos,
  type CrearProductoDto,
  type EditarProductoDto,
  type Producto,
} from '../api/productos';

function extraerError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error || 'Error desconocido';
  }
  return 'Error desconocido';
}

export interface FormularioProducto {
  nombre: string;
  precio: string;
  stock: string;
  categoria: string;
}

const formInicial: FormularioProducto = {
  nombre: '',
  precio: '',
  stock: '',
  categoria: '',
};

export function useProductos() {
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formulario, setFormulario] = useState<FormularioProducto>(formInicial);
  const [error, setError] = useState('');

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: listarProductos,
  });

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((producto) => {
      if (producto.categoria) set.add(producto.categoria);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [productos]);

  const limpiarFormulario = () => {
    setFormulario(formInicial);
    setEditando(null);
    setMostrarFormulario(false);
    setError('');
  };

  const crearMutation = useMutation({
    mutationFn: (datos: CrearProductoDto) => crearProducto(datos),
    onSuccess: async (productoCreado) => {
      queryClient.setQueryData<Producto[]>(['productos'], (actuales = []) => {
        if (actuales.some((producto) => producto.id === productoCreado.id)) return actuales;
        return [productoCreado, ...actuales];
      });
      limpiarFormulario();
      await queryClient.invalidateQueries({ queryKey: ['productos'], refetchType: 'active' });
    },
    onError: (err: unknown) => setError(extraerError(err)),
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: EditarProductoDto }) =>
      editarProducto(id, datos),
    onSuccess: async (productoActualizado) => {
      queryClient.setQueryData<Producto[]>(['productos'], (actuales = []) =>
        actuales.map((producto) =>
          producto.id === productoActualizado.id ? productoActualizado : producto,
        ),
      );
      limpiarFormulario();
      await queryClient.invalidateQueries({ queryKey: ['productos'], refetchType: 'active' });
    },
    onError: (err: unknown) => setError(extraerError(err)),
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: async (producto: Producto) => {
      if (producto.activo) {
        await desactivarProducto(producto.id);
      } else {
        await activarProducto(producto.id);
      }
      return producto;
    },
    onSuccess: (productoActualizado) => {
      queryClient.setQueryData<Producto[]>(['productos'], (actuales = []) =>
        actuales.map((producto) =>
          producto.id === productoActualizado.id
            ? { ...producto, activo: !productoActualizado.activo }
            : producto,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['productos'], refetchType: 'active' });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const precio = Number(formulario.precio);
    const stock = editando ? Number(formulario.stock) : Number(formulario.stock);

    if (Number.isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0.');
      return;
    }

    if (!editando && (Number.isNaN(stock) || stock < 0)) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    const categoriaLimpia = formulario.categoria.trim();
    const payload: CrearProductoDto & EditarProductoDto = {
      nombre: formulario.nombre.trim(),
      precio,
      ...(categoriaLimpia ? { categoria: categoriaLimpia } : { categoria: '' as never }),
      ...(editando ? {} : { stock }),
    } as CrearProductoDto & EditarProductoDto;

    if (editando) {
      const datosEditar: EditarProductoDto = {
        nombre: payload.nombre,
        precio: payload.precio,
        ...(categoriaLimpia ? { categoria: categoriaLimpia } : {}),
      };
      editarMutation.mutate({ id: editando.id, datos: datosEditar });
    } else {
      crearMutation.mutate({
        nombre: payload.nombre,
        precio: payload.precio,
        stock,
        categoria: categoriaLimpia || undefined,
      });
    }
  };

  const iniciarEdicion = (producto: Producto) => {
    setEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      precio: String(producto.precio),
      stock: String(producto.stock),
      categoria: producto.categoria ?? '',
    });
    setMostrarFormulario(true);
    setError('');
  };

  const abrirFormularioCrear = () => {
    setMostrarFormulario(true);
    setEditando(null);
    setFormulario(formInicial);
    setError('');
  };

  const actualizarCampo = (campo: keyof FormularioProducto, valor: string) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  return {
    productos,
    isLoading,
    categorias,
    mostrarFormulario,
    editando,
    formulario,
    error,
    crearPending: crearMutation.isPending,
    editarPending: editarMutation.isPending,
    togglePending: toggleEstadoMutation.isPending,
    handleSubmit,
    iniciarEdicion,
    abrirFormularioCrear,
    cerrarFormulario: limpiarFormulario,
    toggleEstado: toggleEstadoMutation.mutate,
    actualizarCampo,
  };
}

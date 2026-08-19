import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CrearProductoUseCase } from '../../../application/use-cases/productos/CrearProductoUseCase';
import { EditarProductoUseCase } from '../../../application/use-cases/productos/EditarProductoUseCase';
import { DesactivarProductoUseCase } from '../../../application/use-cases/productos/DesactivarProductoUseCase';
import { ActivarProductoUseCase } from '../../../application/use-cases/productos/ActivarProductoUseCase';
import { ListarProductosUseCase } from '../../../application/use-cases/productos/ListarProductosUseCase';
import { BuscarProductosUseCase } from '../../../application/use-cases/productos/BuscarProductosUseCase';
import { FiltrarPorCategoriaUseCase } from '../../../application/use-cases/productos/FiltrarPorCategoriaUseCase';
import { ConsultarStockUseCase } from '../../../application/use-cases/productos/ConsultarStockUseCase';

const esquemaCrearProducto = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  categoria: z.string().optional(),
});

const esquemaEditarProducto = z.object({
  nombre: z.string().min(1).optional(),
  precio: z.number().min(0).optional(),
  categoria: z.string().optional(),
});

export class ProductosController {
  constructor(
    private crearProductoUseCase: CrearProductoUseCase,
    private editarProductoUseCase: EditarProductoUseCase,
    private desactivarProductoUseCase: DesactivarProductoUseCase,
    private activarProductoUseCase: ActivarProductoUseCase,
    private listarProductosUseCase: ListarProductosUseCase,
    private buscarProductosUseCase: BuscarProductosUseCase,
    private filtrarPorCategoriaUseCase: FiltrarPorCategoriaUseCase,
    private consultarStockUseCase: ConsultarStockUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearProducto.parse(req.body);
      const resultado = await this.crearProductoUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        ...datos,
      });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async editar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const datos = esquemaEditarProducto.parse(req.body);
      const resultado = await this.editarProductoUseCase.ejecutar({
        productoId: id,
        tiendaId: req.usuario!.tiendaId,
        ...datos,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async desactivar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.desactivarProductoUseCase.ejecutar({
        productoId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json({ message: 'Producto desactivado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async activar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.activarProductoUseCase.ejecutar({
        productoId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json({ message: 'Producto activado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.listarProductosUseCase.ejecutar({
        tiendaId: _req.usuario!.tiendaId,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nombre = req.query.nombre as string;
      const resultado = await this.buscarProductosUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        nombre,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async filtrarPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoria = req.query.categoria as string;
      const resultado = await this.filtrarPorCategoriaUseCase.ejecutar({
        tiendaId: req.usuario!.tiendaId,
        categoria,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async consultarStock(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const resultado = await this.consultarStockUseCase.ejecutar({
        productoId: id,
        tiendaId: req.usuario!.tiendaId,
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

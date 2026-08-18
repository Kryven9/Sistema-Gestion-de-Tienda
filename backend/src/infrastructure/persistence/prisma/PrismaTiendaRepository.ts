import { PrismaClient } from '@prisma/client';
import { Tienda } from '../../../domain/entities/Tienda';
import { TiendaRepository } from '../../../domain/ports/repositories/TiendaRepository';

export class PrismaTiendaRepository implements TiendaRepository {
  constructor(private prisma: PrismaClient) {}

  async guardar(tienda: Tienda): Promise<Tienda> {
    const guardada = await this.prisma.tienda.create({
      data: {
        id: tienda.id,
        nombre: tienda.nombre,
        activo: tienda.activo,
        fechaCreacion: tienda.fechaCreacion,
      },
    });

    return {
      id: guardada.id,
      nombre: guardada.nombre,
      activo: guardada.activo,
      fechaCreacion: guardada.fechaCreacion,
    };
  }

  async buscarPorId(id: string): Promise<Tienda | null> {
    const tienda = await this.prisma.tienda.findUnique({ where: { id } });
    if (!tienda) return null;

    return {
      id: tienda.id,
      nombre: tienda.nombre,
      activo: tienda.activo,
      fechaCreacion: tienda.fechaCreacion,
    };
  }
}

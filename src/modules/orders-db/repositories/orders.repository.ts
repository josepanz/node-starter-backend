import { ConflictException, Injectable } from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { PrismaBaseRepository } from '@core/database/base/prisma/prisma-base.repository';
import { PrismaDatasource } from '@core/database/services/prisma.service';

// P2034: write conflict / deadlock bajo aislamiento Serializable (es reintentable).
const SERIALIZATION_FAILURE = 'P2034';

@Injectable()
export class OrdersRepository extends PrismaBaseRepository<Order> {
  constructor(prisma: PrismaDatasource) {
    super(prisma, prisma.order);
  }

  async findByReference(referenceId: string): Promise<Order | null> {
    return await this.model.findUnique({ where: { referenceId } });
  }

  /**
   * Ejemplo de invariante que un UNIQUE no puede expresar ("máximo N órdenes PENDING por
   * dueño"): `count` + `create` dentro de una transacción interactiva Serializable. Sin
   * Serializable dos requests concurrentes leerían el mismo count y ambos insertarían.
   */
  async createWithPendingLimit(
    data: Prisma.OrderUncheckedCreateInput,
    maxPending: number,
  ): Promise<Order> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const pending = await tx.order.count({
            where: { ownerId: data.ownerId, status: OrderStatus.PENDING },
          });
          if (pending >= maxPending) {
            throw new ConflictException(
              `Se alcanzó el máximo de ${maxPending} órdenes pendientes.`,
            );
          }
          return await tx.order.create({ data });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === SERIALIZATION_FAILURE
      ) {
        throw new ConflictException(
          'Conflicto de concurrencia al crear la orden, reintente.',
        );
      }
      throw error;
    }
  }
}

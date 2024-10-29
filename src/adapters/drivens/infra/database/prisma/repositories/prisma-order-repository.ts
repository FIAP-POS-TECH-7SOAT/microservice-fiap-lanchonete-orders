import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { PrismaService } from '../prisma.service';
import { OrderMapping } from './mapping/orders-mapping';
import { Order, TOrderStatus } from '@core/modules/orders/entities/order';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { GetAllDTO } from '@core/modules/orders/application/ports/repositories/dtos/order-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private prisma: PrismaService,
    private orderProductRepository: OrderProductRepository,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });
    if (!order) {
      return null;
    }
    return OrderMapping.toDomain(order);
  }

  async getAll({ filters }: GetAllDTO): Promise<Order[]> {
    const statusOrder: TOrderStatus[] = ['PRONTO', 'EM PREPARACAO', 'RECEBIDO'];
    const statusFilters = !!filters.status.length
      ? {
          status: {
            in: filters.status,
          },
        }
      : {
          status: {
            in: statusOrder,
          },
        };

    const orders = await this.prisma.order.findMany({
      where: {
        ...statusFilters,
        canceled_at: {
          equals: null,
        },
      },

      orderBy: {
        created_at: 'asc',
      },
    });

    // Sort the orders based on the custom status order "statusOrder"
    // Pronto > Em preparação > Recebido
    const sortedOrders = orders.sort((a, b) => {
      return (
        statusOrder.indexOf(a.status as TOrderStatus) -
        statusOrder.indexOf(b.status as TOrderStatus)
      );
    });

    return sortedOrders.map(OrderMapping.toDomain);
  }

  async update(order: Order): Promise<Order> {
    await Promise.all([
      this.prisma.order.update({
        where: {
          id: order.id.toString(),
        },
        data: OrderMapping.toPrisma(order),
      }),
      this.orderProductRepository.createMany(order.products.getNewItems()),
      this.orderProductRepository.deleteMany(order.products.getRemovedItems()),
    ]);

    return order;
  }

  async create(order: Order): Promise<Order> {
    await this.prisma.order.create({
      data: OrderMapping.toCreatePrisma(order),
    });
    await this.orderProductRepository.createMany(order.products.getItems());
    return order;
  }
}

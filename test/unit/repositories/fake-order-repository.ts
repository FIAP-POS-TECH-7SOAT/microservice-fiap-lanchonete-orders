/* eslint-disable @typescript-eslint/no-unused-vars */
import { Order, TOrderStatus } from '@core/modules/orders/entities/order';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { GetAllDTO } from '@core/modules/orders/application/ports/repositories/dtos/order-dto';

import { OrderMapping } from '@adapters/drivens/infra/database/prisma/repositories/mapping/orders-mapping';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';

interface OrderRepositoryProps {
  canceled_at: Date | null;
  created_at: Date;
  status: TOrderStatus;
  id: string;
  document?: string;
  email?: string;
  name?: string;
  code: string;
  total_amount: number;
}
export class FakeOrderRepository implements OrderRepository {
  private prisma: OrderRepositoryProps[] = [];
  constructor(private orderProductRepository: OrderProductRepository) {}
  async create(data: Order): Promise<Order> {
    const order = OrderMapping.toPrisma(data);
    this.prisma.push(order);
    const orderProducts = data.products.currentItems;
    await this.orderProductRepository.createMany(orderProducts);

    return data;
  }
  async update(data: Order): Promise<Order> {
    const orderIndex = this.prisma.findIndex((item) => item.id === item.id);
    if (orderIndex >= 0) {
      const order = OrderMapping.toPrisma(data);
      this.prisma[orderIndex] = order;

      await this.orderProductRepository.createMany(data.products.getNewItems());
      await this.orderProductRepository.deleteMany(
        data.products.getRemovedItems(),
      );
    }
    return data;
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.prisma.find((item) => item.id.toString() === id);
    if (!order) {
      return null;
    }
    return OrderMapping.toDomain(order as any);
  }

  async getAll({ filters }: GetAllDTO): Promise<Order[]> {
    if (filters.status.length) {
      const orders = this.prisma.filter((item) =>
        filters.status.includes(item.status),
      );
      return orders.map(OrderMapping.toDomain);
    }
    return this.prisma.map(OrderMapping.toDomain);
  }
}

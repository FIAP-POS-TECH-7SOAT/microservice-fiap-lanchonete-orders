/* eslint-disable @typescript-eslint/no-unused-vars */
import { Order } from '@core/modules/orders/entities/order';

import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { OrderProduct } from '@core/modules/orders/entities/order-products';

export class FakeOrderProductRepository implements OrderProductRepository {
  private prisma: OrderProduct[] = [];

  deleteByOrderId(order_id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async createMany(products: OrderProduct[]): Promise<void> {
    products.forEach((item) => {
      this.prisma.push(item);
    });
  }
  async deleteMany(products: OrderProduct[]): Promise<void> {
    const idsToRemoveSet = new Set(products.map((item) => item.id));

    const removed = this.prisma.filter((item) => {
      return !idsToRemoveSet.has(item.id);
    });
    this.prisma = removed;
  }
  async findManyByOrderId(order_id: string): Promise<OrderProduct[]> {
    const t = this.prisma.filter((item) => {
      if (item.order_id.toString() === order_id) {
        return true;
      } else {
        return false;
      }
    });
    return t;
  }

  update(data: Order): Promise<Order> {
    throw new Error('Method not implemented.');
  }
}

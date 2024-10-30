import { OrderProductsMapping } from './mapping/orders-products-mapping';
import { PrismaService } from '../prisma.service';
import { OrderProduct } from '@core/modules/orders/entities/order-products';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaOrderProductRepository implements OrderProductRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findManyByOrderId(order_id: string): Promise<OrderProduct[]> {
    const orderProducts = await this.prisma.orderProduct.findMany({
      where: {
        order_id,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return orderProducts.map(OrderProductsMapping.toDomain);
  }

  async createMany(attachments: OrderProduct[]): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    const data = OrderProductsMapping.toPrismaCreateMany(attachments);

    await this.prisma.orderProduct.createMany(data);
  }
  async deleteMany(products: OrderProduct[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const productsIds = products.map(() => {
      return 'product.id'.toString();
    });

    await this.prisma.orderProduct.deleteMany({
      where: {
        id: {
          in: productsIds,
        },
      },
    });
  }
  async deleteByOrderId(order_id: string): Promise<void> {
    await this.prisma.orderProduct.deleteMany({
      where: {
        order_id,
      },
    });
  }
}

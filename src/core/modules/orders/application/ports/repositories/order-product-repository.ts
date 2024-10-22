import { OrderProduct } from '@core/modules/orders/entities/order-products';

export abstract class OrderProductRepository {
  abstract deleteByOrderId(order_id: string): Promise<void>;
  abstract createMany(products: OrderProduct[]): Promise<void>;
  abstract deleteMany(products: OrderProduct[]): Promise<void>;
  abstract findManyByOrderId(order_id: string): Promise<OrderProduct[]>;
}

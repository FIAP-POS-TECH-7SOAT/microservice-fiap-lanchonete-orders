import { Order } from '@core/modules/orders/entities/order';
import { GetAllDTO } from './dtos/order-dto';

export abstract class OrderRepository {
  abstract create(data: Order): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract getAll(data: GetAllDTO): Promise<Order[]>;
  abstract update(data: Order): Promise<Order>;
}

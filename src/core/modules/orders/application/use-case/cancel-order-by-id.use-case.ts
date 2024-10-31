import { Order } from '@core/modules/orders/entities/order';
import { OrderRepository } from '../ports/repositories/order-repository';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { ResourceAlreadyProcessedError } from '../errors/resource-already-processed-error';
import { OrderAlreadyInProgressError } from '../errors/order-already-in-progress-error';

interface RequestProps {
  id: string;
}
type ResponseProps = Either<
  | ResourceNotFoundError
  | ResourceAlreadyProcessedError
  | OrderAlreadyInProgressError,
  {
    order: Order;
  }
>;
@Injectable()
export class CancelOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}
  async execute({ id }: RequestProps): Promise<ResponseProps> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return left(new ResourceNotFoundError());
    }
    if (order.code) {
      return left(new OrderAlreadyInProgressError());
    }
    if (order.canceled_at) {
      return left(new ResourceAlreadyProcessedError());
    }
    order.canceled_at = new Date();
    await this.orderRepository.update(order);
    return right({ order });
  }
}

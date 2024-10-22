import { Order, TOrderStatus } from '@core/modules/orders/entities/order';
import { OrderRepository } from '../ports/repositories/order-repository';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { InvalidOrderStatusError } from '../errors/invalid-order-status-error';

interface RequestProps {
  id: string;
  status: TOrderStatus;
}
type ResponseProps = Either<
  ResourceNotFoundError | InvalidOrderStatusError,
  {
    order: Order;
  }
>;
@Injectable()
export class UpdateOrderStatusByIdUseCase {
  constructor(private orderRepository: OrderRepository) {}
  async execute({ id, status }: RequestProps): Promise<ResponseProps> {
    const STATUS_FLOW = {
      Pendente: 'Recebido',
      Recebido: 'Em preparação',
      'Em preparação': 'Pronto',
      Pronto: 'Finalizado',
      Finalizado: null,
    };

    const order = await this.orderRepository.findById(id);
    if (!order) {
      return left(new ResourceNotFoundError());
    }
    const newStatus = STATUS_FLOW[status];
    if (!newStatus) {
      return left(new InvalidOrderStatusError());
    }
    order.status = status;
    await this.orderRepository.update(order);
    return right({ order });
  }
}

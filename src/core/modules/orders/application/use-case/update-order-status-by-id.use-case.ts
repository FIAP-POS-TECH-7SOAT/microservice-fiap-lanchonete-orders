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
  constructor(private readonly orderRepository: OrderRepository) {}
  async execute({ id, status }: RequestProps): Promise<ResponseProps> {
    const ORDER_STATUS_FLOW = [
      'PENDENTE',
      'RECEBIDO',
      'EM PREPARACAO',
      'PRONTO',
      'FINALIZADO',
    ];
    const STATUS_FLOW = {
      PENDENTE: 'RECEBIDO',
      RECEBIDO: 'EM PREPARACAO',
      'EM PREPARACAO': 'PRONTO',
      PRONTO: 'FINALIZADO',
      FINALIZADO: null,
    };

    const order = await this.orderRepository.findById(id);
    if (!order) {
      return left(new ResourceNotFoundError());
    }

    const newStatus = STATUS_FLOW[status];
    if (!newStatus) {
      return left(new InvalidOrderStatusError());
    }

    const currentPosition = ORDER_STATUS_FLOW.findIndex(
      (item) => item === order.status,
    );
    const nextPosition = ORDER_STATUS_FLOW.findIndex((item) => item === status);
    if (currentPosition > nextPosition) {
      return left(new InvalidOrderStatusError());
    }
    order.status = status;
    await this.orderRepository.update(order);
    return right({ order });
  }
}

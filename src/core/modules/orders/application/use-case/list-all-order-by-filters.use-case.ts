import { Order } from '@core/modules/orders/entities/order';
import { OrderRepository } from '../ports/repositories/order-repository';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';

interface RequestProps {
  filters: {
    status: string[];
  };
}
type ResponseProps = Either<
  null,
  {
    orders: Order[];
  }
>;

@Injectable()
export class ListAllOrdersByFiltersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}
  async execute({ filters }: RequestProps): Promise<ResponseProps> {
    const orders = await this.orderRepository.getAll({ filters });

    return right({ orders });
  }
}

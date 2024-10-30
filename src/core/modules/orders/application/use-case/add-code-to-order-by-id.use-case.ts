import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../ports/repositories/order-repository';

import { GenerateCodeProvider } from '../ports/providers/generate-code-provider';
import { Order } from '@core/modules/orders/entities/order';
import { Either, left, right } from '@core/common/entities/either';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface RequestProps {
  id: string;
}
type ResponseProps = Either<
  ResourceNotFoundError,
  {
    order: Order;
  }
>;
@Injectable()
export class AddCodeToOrderByIdUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly generateCodeProvider: GenerateCodeProvider,
  ) {}
  async execute({ id }: RequestProps): Promise<ResponseProps> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return left(new ResourceNotFoundError());
    }
    const code = this.generateCodeProvider.generate();
    order.code = code;

    await this.orderRepository.update(order);
    return right({ order });
  }
}

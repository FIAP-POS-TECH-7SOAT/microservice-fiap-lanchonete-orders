import { OrderRepository } from '../ports/repositories/order-repository';

import { OrderProductRepository } from '../ports/repositories/order-product-repository';
import { OrderProduct } from '../../entities/order-products';

import { OrderProductList } from '../../entities/order-products-list';
import { Order } from '@core/modules/orders/entities/order';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

interface RequestProps {
  id: string;
}

interface FindOrderByIdUseCaseResponse {
  order: Order;
}
type ResponseProps = Either<
  ResourceNotFoundError,
  FindOrderByIdUseCaseResponse
>;

@Injectable()
export class FindOrderByIdUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderProductRepository: OrderProductRepository,
  ) {}

  public async execute({ id }: RequestProps): Promise<ResponseProps> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      return left(new ResourceNotFoundError());
    }
    const orderProduct =
      await this.orderProductRepository.findManyByOrderId(id);

    const orderProducts = orderProduct.map((item) =>
      OrderProduct.create(
        {
          amount: item.amount,
          order_id: order.id,
          product_id: item.product_id,
          unit_price: item.unit_price,
        },
        item.id,
      ),
    );
    order.products = new OrderProductList(orderProducts);
    return right({
      order,
    });
  }
}

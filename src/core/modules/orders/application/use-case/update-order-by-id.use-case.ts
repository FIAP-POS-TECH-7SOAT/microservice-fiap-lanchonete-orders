import { Order, OrderClientProps } from '@core/modules/orders/entities/order';
import { OrderRepository } from '../ports/repositories/order-repository';

import { OrderProductRepository } from '../ports/repositories/order-product-repository';
import { OrderProductList } from '../../entities/order-products-list';
import { OrderProduct } from '../../entities/order-products';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
interface RequestProps {
  id: string;
  client: OrderClientProps | null;
  products: {
    id: string;
    amount: number;
    unit_price: number;
  }[];
}
type ResponseProps = Either<
  ResourceNotFoundError,
  {
    order: Order;
  }
>;

@Injectable()
export class UpdateOrderByIdUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderProductRepository: OrderProductRepository,
  ) {}
  async execute({
    id,
    products,
    client,
  }: RequestProps): Promise<ResponseProps> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return left(new ResourceNotFoundError());
    }

    const currentOrderProducts =
      await this.orderProductRepository.findManyByOrderId(id);
    const orderProductList = new OrderProductList(currentOrderProducts);

    if (client) {
      order.client = client;
    }

    const summaryProducts = products.reduce(
      (acc, cur) => {
        acc.total_amount += cur.amount;
        acc.total_price += cur.amount * cur.unit_price;
        acc.orderProducts.push(
          OrderProduct.create({
            amount: cur.amount,
            order_id: order.id,
            product_id: new UniqueEntityID(cur.id),
            unit_price: cur.unit_price,
          }),
        );
        return acc;
      },
      { orderProducts: [] as OrderProduct[], total_amount: 0, total_price: 0 },
    );
    order.total_amount = summaryProducts.total_amount;
    order.total_price = summaryProducts.total_price;

    orderProductList.update(summaryProducts.orderProducts);
    order.products = orderProductList;

    await this.orderRepository.update(order);
    return right({ order });
  }
}

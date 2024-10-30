import { Order, OrderClientProps } from '@core/modules/orders/entities/order';
import { OrderRepository } from '../ports/repositories/order-repository';
import { OrderProduct } from '@core/modules/orders/entities/order-products';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { OrderProductList } from '@core/modules/orders/entities/order-products-list';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';

interface RequestProps {
  products: {
    id: string;
    amount: number;
    unit_price: number;
  }[];
  client: OrderClientProps | null;
}
type ResponseProps = Either<
  null,
  {
    order: Order;
  }
>;
@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}
  async execute({ client, products }: RequestProps): Promise<ResponseProps> {
    const order = Order.create({
      client,
      status: 'PENDENTE',
      code: '',
      total_amount: 0,
      total_price: 0,
    });
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

    order.products = new OrderProductList(summaryProducts.orderProducts);

    await this.orderRepository.create(order);

    return right({
      order,
    });
  }
}

import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Order, OrderProps } from '@core/modules/orders/entities/order';
import { OrderProduct } from '@core/modules/orders/entities/order-products';
import { OrderProductList } from '@core/modules/orders/entities/order-products-list';
import { faker } from '@faker-js/faker';

interface ProductFactory {
  unit_price: number;
  amount: number;
  id: string;
}
export class OrderFactory {
  static createOrder(
    overrides: Partial<OrderProps> = {},
    products?: Partial<ProductFactory>[],
    id?: UniqueEntityID,
  ): Order {
    const defaultClient = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.number.int().toString(),
    };

    const defaultOrder = Order.create(
      {
        client: overrides.client ?? defaultClient,
        status: overrides.status ?? 'PENDENTE',
        created_at: overrides.created_at ?? new Date(),
        canceled_at: overrides.canceled_at ?? null,
        code: overrides.code ?? 'ORD-001',
        total_amount: overrides.total_amount ?? faker.number.int(),
        total_price:
          overrides.total_price ?? Number(faker.commerce.price({ min: 100 })),
      },
      id,
    );

    const defaultProducts = new OrderProductList(
      products
        ? products.map((item) =>
            OrderProduct.create({
              amount: item.amount ?? faker.number.int(),
              product_id: new UniqueEntityID(item.id) ?? new UniqueEntityID(),
              order_id: defaultOrder.id,
              unit_price:
                item.unit_price ?? Number(faker.commerce.price({ min: 100 })),
            }),
          )
        : [
            OrderProduct.create({
              amount: faker.number.int(),
              product_id: new UniqueEntityID(),
              order_id: defaultOrder.id,
              unit_price: Number(faker.commerce.price({ min: 100 })),
            }),
          ],
    );

    defaultOrder.products = overrides.products ?? defaultProducts;

    return defaultOrder;
  }

  static createPendingOrder(
    overrides: Partial<OrderProps> = {},
    products?: Partial<ProductFactory>[],
  ): Order {
    return this.createOrder(
      {
        ...overrides,
        status: 'PENDENTE',
      },
      products,
    );
  }

  static createReceivedOrder(
    overrides: Partial<OrderProps> = {},
    products?: Partial<ProductFactory>[],
  ): Order {
    return this.createOrder(
      {
        ...overrides,
        status: 'RECEBIDO',
      },
      products,
    );
  }

  static createCompletedOrder(
    overrides: Partial<OrderProps> = {},
    products?: Partial<ProductFactory>[],
  ): Order {
    return this.createOrder(
      {
        ...overrides,
        status: 'FINALIZADO',
      },
      products,
    );
  }
}

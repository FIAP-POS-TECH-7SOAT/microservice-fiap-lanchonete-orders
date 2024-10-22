import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Order, TOrderStatus } from '@core/modules/orders/entities/order';
import {
  // Order as OrderPrisma,
  // OrderProduct as OrderProductPrisma,
  Prisma,
} from '@prisma/client';

// type CompleteOrderPrima = OrderPrisma & {
//   products?: OrderProductPrisma[];
// };

export class OrderMapping {
  static toDomain({
    created_at,
    id,
    status,
    canceled_at,
    total_amount,
    total_price,
    code,
    document,
    email,
    name,
  }: any) {
    let myClient: any = null;
    if (document && name && email) {
      myClient = {
        document: document,
        email: email,
        name: name,
      };
    }
    return Order.create(
      {
        client: myClient,
        created_at,
        status: status as TOrderStatus,
        canceled_at: canceled_at,
        code,
        total_amount: Number(total_amount),
        total_price: Number(total_price),
      },
      new UniqueEntityID(id),
    );
  }

  static toCreatePrisma(order: Order): Prisma.OrderCreateInput {
    return {
      id: order.id.toString(),
      document: order.client?.document,
      email: order.client?.email,
      name: order.client?.name,
      created_at: order.created_at,
      status: order.status,
      canceled_at: order.canceled_at,
      total_amount: order.total_amount,
    };
  }
  static toPrisma(order: Order) {
    return {
      canceled_at: order.canceled_at,
      created_at: order.created_at,
      status: order.status,
      id: order.id.toString(),
      document: order.client?.document,
      email: order.client?.email,
      name: order.client?.name,
      code: order.code,
      total_amount: order.total_amount,
    };
  }
}

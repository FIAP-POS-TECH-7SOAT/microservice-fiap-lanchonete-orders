import { Order } from '@core/modules/orders/entities/order';

export class OrderMapping {
  static toView({
    id,
    client,
    status,
    created_at,
    canceled_at,
    code,
    waitTime,
    total_amount,
  }: Order) {
    return {
      id: id.toString(),
      client,
      total_amount: total_amount,
      status,
      created_at,
      canceled_at,
      code,
      waitTime,
    };
  }
}

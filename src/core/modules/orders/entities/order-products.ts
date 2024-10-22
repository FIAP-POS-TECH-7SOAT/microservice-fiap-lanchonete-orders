import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { Entity } from '@core/common/entities/entity';

export interface OrderProductProps {
  order_id: UniqueEntityID;
  product_id: UniqueEntityID;
  amount: number;
  unit_price: number;
}

export class OrderProduct extends Entity<OrderProductProps> {
  public get product_id() {
    return this.props.product_id;
  }

  public get order_id() {
    return this.props.order_id;
  }

  public get amount() {
    return this.props.amount;
  }

  public get unit_price() {
    return this.props.unit_price;
  }
  static create(props: OrderProductProps, id?: UniqueEntityID) {
    const orderProduct = new OrderProduct(props, id);

    return orderProduct;
  }
}

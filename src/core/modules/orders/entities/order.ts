import { format } from 'date-fns';

import { OrderProductList } from './order-products-list';

import { Optional } from '@core/common/entities/optional';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { Entity } from '@core/common/entities/entity';

export interface IOrderProduct {
  id: string;
  amount: number;
}
export interface OrderClientProps {
  name: string;
  email: string;
  document: string;
}
export type TOrderStatus =
  | 'PENDENTE'
  | 'RECEBIDO'
  | 'EM PREPARACAO'
  | 'PRONTO'
  | 'FINALIZADO';

export interface OrderProps {
  client: OrderClientProps | null;
  products: OrderProductList;
  status: TOrderStatus;
  created_at: Date;
  canceled_at?: Date | null;
  code: string;
  total_amount: number;
  total_price: number;
}

export class Order extends Entity<OrderProps> {
  static create(
    props: Optional<OrderProps, 'created_at' | 'canceled_at' | 'products'>,
    id?: UniqueEntityID,
  ) {
    const order = new Order(
      {
        ...props,
        total_amount: Number(props.total_amount),
        total_price: Number(props.total_amount.toFixed(2)),
        products: props.products ?? new OrderProductList(),
        created_at: props.created_at ?? new Date(),
        canceled_at: props.canceled_at ?? null,
      },
      id,
    );
    return order;
  }
  public get products() {
    return this.props.products;
  }
  public set products(products: OrderProductList) {
    this.props.products = products;
  }

  public get waitTime(): string {
    return format(
      new Date().getTime() - this.props.created_at.getTime(),
      'mm:ss',
    );
  }

  public get client(): OrderClientProps | null {
    return this.props.client || null;
  }

  public set client(client: OrderClientProps) {
    this.props.client = {
      document: client.document,
      email: client.email,
      name: client.name,
    };
  }

  public get status(): TOrderStatus {
    return this.props.status;
  }
  public set status(status: TOrderStatus) {
    this.props.status = status;
  }
  public set code(code: string) {
    this.props.code = code;
  }
  public get code() {
    return this.props.code;
  }
  public get created_at() {
    return this.props.created_at;
  }

  public get canceled_at(): Date | null {
    return this.props.canceled_at || null;
  }
  public set canceled_at(canceled_at: Date) {
    this.props.canceled_at = canceled_at;
  }
  public get total_amount(): number {
    return this.props.total_amount;
  }
  public set total_amount(total_amount: number) {
    this.props.total_amount = Number(total_amount);
  }
  public get total_price(): number {
    return this.props.total_price;
  }
  public set total_price(total_price: number) {
    this.props.total_price = Number(total_price.toFixed(2));
  }
}

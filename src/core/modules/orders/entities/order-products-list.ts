import { WatchedList } from '@core/common/entities/watched-list';
import { OrderProduct } from './order-products';

export class OrderProductList extends WatchedList<OrderProduct> {
  compareItems(a: OrderProduct, b: OrderProduct): boolean {
    return a.product_id.equals(b.product_id) && a.amount === b.amount;
  }
}

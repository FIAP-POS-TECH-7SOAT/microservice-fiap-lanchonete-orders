import { Order } from '@core/modules/orders/entities/order';

export interface CreateOrderDTO {
  products: {
    id: string;
    amount: number;
  }[];
  client_id: string | null;
}

export interface UpdateOrderDTO {
  id: string;
  product: string;
  client_id: string;
  status: string;
}

export interface GetAllDTO {
  filters: {
    status: string[];
  };
}

export interface GetAllResponseDTO extends Order {
  waitTime: string;
}

import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';

import { CreateOrderUseCase } from '@core/modules/orders/application/use-case/create-order.use-case';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';

describe(CreateOrderUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let sut: CreateOrderUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);

    sut = new CreateOrderUseCase(orderRepository);
  });

  it('should create a order', async () => {
    const result = await sut.execute({
      client: null,
      products: [
        {
          amount: 1,
          id: 'fake_id_1',
          unit_price: 12,
        },
      ],
    });
    const orders = await orderRepository.getAll({ filters: { status: [] } });
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toBeTruthy();
      expect(orders[0].id).toEqual(result.value.order.id);
    }
  });
});

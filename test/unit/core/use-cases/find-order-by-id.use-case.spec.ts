import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { FindOrderByIdUseCase } from '@core/modules/orders/application/use-case/find-order-by-id.use-case';
import { Order } from '@core/modules/orders/entities/order';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { OrderProduct } from '@core/modules/orders/entities/order-products';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';

describe(FindOrderByIdUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let sut: FindOrderByIdUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);
    sut = new FindOrderByIdUseCase(orderRepository, orderProductRepository);
  });

  it('should return a order by id', async () => {
    const myOrder = Order.create(
      {
        status: 'PENDENTE',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      },
      new UniqueEntityID('1'),
    );
    const myOrderProduct = OrderProduct.create({
      amount: 1,
      order_id: myOrder.id,
      product_id: new UniqueEntityID(),
      unit_price: 100,
    });
    await orderRepository.create(myOrder);
    await orderProductRepository.createMany([myOrderProduct]);

    const result = await sut.execute({
      id: '1',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toEqual('1');
    }
  });

  it('should not find a order by id when the order do not exist', async () => {
    const fixedDate = new Date('2024-10-20T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    const result = await sut.execute({
      id: 'fake-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});

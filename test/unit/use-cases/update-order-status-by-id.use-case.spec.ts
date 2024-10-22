import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';

import { Order } from '@core/modules/orders/entities/order';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { UpdateOrderStatusByIdUseCase } from '@core/modules/orders/application/use-case/update-order-status-by-id.use-case';
import { InvalidOrderStatusError } from '@core/modules/orders/application/errors/invalid-order-status-error';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';

describe(UpdateOrderStatusByIdUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let sut: UpdateOrderStatusByIdUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);
    sut = new UpdateOrderStatusByIdUseCase(orderRepository);
  });

  it('should update order status by id', async () => {
    const myOrder = Order.create(
      {
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: 'fake-code',
        client: null,
      },
      new UniqueEntityID('fake_id_1'),
    );

    await orderRepository.create(myOrder);

    const result = await sut.execute({
      id: 'fake_id_1',
      status: 'Recebido',
    });
    const order = await orderRepository.findById('fake_id_1');
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(order?.status).toEqual('Recebido');
    }
  });

  it('should not update order status by id with a invalid status', async () => {
    const myOrder = Order.create(
      {
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: 'fake-code',
        client: null,
      },
      new UniqueEntityID('fake_id_1'),
    );

    await orderRepository.create(myOrder);

    const result = await sut.execute({
      id: 'fake_id_1',
      status: 'fake-status' as any,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidOrderStatusError);
    }
  });
  it('should not update order status by id with a unexistent order', async () => {
    const result = await sut.execute({
      id: 'unexitent_fake_id_1',
      status: 'Em preparação',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});

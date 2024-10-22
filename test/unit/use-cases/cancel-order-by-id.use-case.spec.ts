import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';

import { Order } from '@core/modules/orders/entities/order';

import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { CancelOrderByIdUseCase } from '@core/modules/orders/application/use-case/cancel-order-by-id.use-case';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';
import { ResourceAlreadyProcessedError } from '@core/modules/orders/application/errors/resource-already-processed-error';
import { OrderAlreadyInProgressError } from '@core/modules/orders/application/errors/order-already-in-progress-error';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';

describe(CancelOrderByIdUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let sut: CancelOrderByIdUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);

    sut = new CancelOrderByIdUseCase(orderRepository);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should cancel a order by id', async () => {
    const fixedDate = new Date('2024-10-20T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
    const myOrder = Order.create(
      {
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      },
      new UniqueEntityID('1'),
    );

    await orderRepository.create(myOrder);

    const result = await sut.execute({
      id: '1',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toEqual('1');
      expect(result.value.order.canceled_at).toBeTruthy();
      expect(result.value.order.canceled_at).toEqual(fixedDate);
    }
  });
  it('should not cancel a order by id when the order do not exist', async () => {
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
  it('should not cancel a order by id when the order is already canceled', async () => {
    const myOrder = Order.create(
      {
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
        canceled_at: new Date('2024-10-20T10:00:00Z'),
      },
      new UniqueEntityID('1'),
    );

    await orderRepository.create(myOrder);

    const result = await sut.execute({
      id: '1',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceAlreadyProcessedError);
    }
  });
  it('should not cancel a order by id when the order is already in progress', async () => {
    const myOrder = Order.create(
      {
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: 'fake-code',
        client: null,
      },
      new UniqueEntityID('1'),
    );

    await orderRepository.create(myOrder);

    const result = await sut.execute({
      id: '1',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(OrderAlreadyInProgressError);
    }
  });
});

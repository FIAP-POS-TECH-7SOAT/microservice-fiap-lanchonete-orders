import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { Order } from '@core/modules/orders/entities/order';

import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { AddCodeToOrderByIdUseCase } from '@core/modules/orders/application/use-case/add-code-to-order-by-id.use-case';
import { FakeGenerateCodeProvider } from '../providers/fake-generation-unique-code';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';

describe(AddCodeToOrderByIdUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let generateCodeProvider: FakeGenerateCodeProvider;
  let sut: AddCodeToOrderByIdUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);
    generateCodeProvider = new FakeGenerateCodeProvider();
    sut = new AddCodeToOrderByIdUseCase(orderRepository, generateCodeProvider);
  });

  it('should add code to order ', async () => {
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
      expect(result.value.order.code).toBeTruthy();
    }
  });
  it('should not add code a order by id when the order do not exist', async () => {
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

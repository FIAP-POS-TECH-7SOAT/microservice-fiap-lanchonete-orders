import { ListAllOrdersByFiltersUseCase } from '@core/modules/orders/application/use-case/list-all-order-by-filters.use-case';
import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { Order } from '@core/modules/orders/entities/order';
import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';

describe(ListAllOrdersByFiltersUseCase.name, () => {
  let orderRepository: OrderRepository;
  let sut: ListAllOrdersByFiltersUseCase;
  let orderProductRepository: OrderProductRepository;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);
    sut = new ListAllOrdersByFiltersUseCase(orderRepository);
  });

  it('should return an empty array of orders when does not have orders', async () => {
    const result = await sut.execute({
      filters: {
        status: [],
      },
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0);
    }
  });

  it('should return all orders ', async () => {
    await orderRepository.create(
      Order.create({
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      }),
    );
    await orderRepository.create(
      Order.create({
        status: 'Em preparação',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      }),
    );
    const result = await sut.execute({
      filters: {
        status: [],
      },
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(2);
    }
  });

  it('should return all orders match filters', async () => {
    await orderRepository.create(
      Order.create({
        status: 'Pendente',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      }),
    );
    await orderRepository.create(
      Order.create({
        status: 'Em preparação',
        total_amount: 1,
        total_price: 1,
        code: '',
        client: null,
      }),
    );
    const result = await sut.execute({
      filters: {
        status: ['Em preparação'],
      },
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1);
      expect(result.value.orders[0].status).toEqual('Em preparação');
    }
  });
});

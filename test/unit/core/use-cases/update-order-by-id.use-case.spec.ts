import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { FakeOrderRepository } from '../repositories/fake-order-repository';
import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { UpdateOrderByIdUseCase } from '@core/modules/orders/application/use-case/update-order-by-id.use-case';
import { Order } from '@core/modules/orders/entities/order';
import { FakeOrderProductRepository } from '../repositories/fake-order-product-repository';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { OrderProduct } from '@core/modules/orders/entities/order-products';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';

describe(UpdateOrderByIdUseCase.name, () => {
  let orderRepository: OrderRepository;
  let orderProductRepository: OrderProductRepository;
  let sut: UpdateOrderByIdUseCase;

  beforeEach(() => {
    orderProductRepository = new FakeOrderProductRepository();
    orderRepository = new FakeOrderRepository(orderProductRepository);
    sut = new UpdateOrderByIdUseCase(orderRepository, orderProductRepository);
  });

  it('should update order by id', async () => {
    const myOrder = Order.create(
      {
        status: 'PENDENTE',
        total_amount: 1,
        total_price: 1,
        code: 'fake-code',
        client: null,
      },
      new UniqueEntityID('fake_id_1'),
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
      id: 'fake_id_1',
      products: [
        {
          amount: 3,
          id: 'fake_id_product_updated_1',
          unit_price: 33,
        },
        {
          amount: 3,
          id: 'fake_id_product_updated_2',
          unit_price: 33,
        },
      ],
      client: null,
    });
    const productsOrder =
      await orderProductRepository.findManyByOrderId('fake_id_1');
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(productsOrder).toHaveLength(2);
    }
  });
  it('should not update a order by id when the order do not exist', async () => {
    const fixedDate = new Date('2024-10-20T10:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);

    const result = await sut.execute({
      id: 'fake-id',
      client: null,
      products: [
        {
          amount: 3,
          id: 'fake_id_product_updated_2',
          unit_price: 33,
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});

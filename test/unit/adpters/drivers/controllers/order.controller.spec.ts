import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus, HttpException } from '@nestjs/common';
import { CreateOrderUseCase } from '@core/modules/orders/application/use-case/create-order.use-case';
import { ListAllOrdersByFiltersUseCase } from '@core/modules/orders/application/use-case/list-all-order-by-filters.use-case';
import { UpdateOrderByIdUseCase } from '@core/modules/orders/application/use-case/update-order-by-id.use-case';
import { FindOrderByIdUseCase } from '@core/modules/orders/application/use-case/find-order-by-id.use-case';
import { CancelOrderByIdUseCase } from '@core/modules/orders/application/use-case/cancel-order-by-id.use-case';
import { UpdateOrderStatusByIdUseCase } from '@core/modules/orders/application/use-case/update-order-status-by-id.use-case';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';
import { OrderController } from '@adapters/drivers/http/controllers/order-controller';
import { OrderMapping } from '@adapters/drivers/http/mapping/order-mapping';
import { OrderFactory } from '../factories/order.factory';
import { left, right } from '@core/common/entities/either';
import { ResourceAlreadyProcessedError } from '@core/modules/orders/application/errors/resource-already-processed-error';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { InvalidOrderStatusError } from '@core/modules/orders/application/errors/invalid-order-status-error';

describe('OrderController', () => {
  let controller: OrderController;
  let createOrderUseCase: CreateOrderUseCase;
  let listAllOrdersByFiltersUseCase: ListAllOrdersByFiltersUseCase;
  let updateOrderByIdUseCase: UpdateOrderByIdUseCase;
  let findOrderByIdUseCase: FindOrderByIdUseCase;
  let cancelOrderByIdUseCase: CancelOrderByIdUseCase;
  let updateOrderStatusByIdUseCase: UpdateOrderStatusByIdUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListAllOrdersByFiltersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateOrderByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindOrderByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CancelOrderByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateOrderStatusByIdUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    listAllOrdersByFiltersUseCase = module.get<ListAllOrdersByFiltersUseCase>(
      ListAllOrdersByFiltersUseCase,
    );
    updateOrderByIdUseCase = module.get<UpdateOrderByIdUseCase>(
      UpdateOrderByIdUseCase,
    );
    findOrderByIdUseCase =
      module.get<FindOrderByIdUseCase>(FindOrderByIdUseCase);
    cancelOrderByIdUseCase = module.get<CancelOrderByIdUseCase>(
      CancelOrderByIdUseCase,
    );
    updateOrderStatusByIdUseCase = module.get<UpdateOrderStatusByIdUseCase>(
      UpdateOrderStatusByIdUseCase,
    );
  });

  describe('create', () => {
    it('should create an order and return its view', async () => {
      const orderData = {
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          document: '123456',
        },
        products: [{ id: 'p1', amount: 2, unit_price: 10 }],
      };

      const order = OrderFactory.createOrder(
        { client: orderData.client },
        orderData.products,
      );
      const expectedOrder = {
        order: OrderMapping.toView(order),
      };

      jest.spyOn(createOrderUseCase, 'execute').mockResolvedValueOnce(
        right({
          order: order,
        }),
      );

      const result = await controller.create(orderData);

      expect(result).toEqual(expectedOrder);
      expect(createOrderUseCase.execute).toHaveBeenCalledWith(orderData);
    });

    it('should throw an error if createOrderUseCase fails', async () => {
      jest
        .spyOn(createOrderUseCase, 'execute')
        .mockResolvedValueOnce(left(null));

      await expect(controller.create({ products: [] })).rejects.toThrow(Error);
    });
  });

  describe('updateByOrderId', () => {
    it('should update an order by id and return its view', async () => {
      const id = '1';
      const updateData = {
        products: [{ id: 'p2', amount: 1, unit_price: 20 }],
      };
      const order = OrderFactory.createOrder(
        {},
        updateData.products,
        new UniqueEntityID('1'),
      );
      const expectedOrder = {
        order: OrderMapping.toView(order),
      };
      jest.spyOn(updateOrderByIdUseCase, 'execute').mockResolvedValueOnce(
        right({
          order: order,
        }),
      );

      const result = await controller.updateByOrderId(updateData, id);

      expect(result).toEqual(expectedOrder);
      expect(updateOrderByIdUseCase.execute).toHaveBeenCalledWith({
        id,
        products: updateData.products,
        client: null,
      });
    });

    it('should throw NOT_FOUND if the order does not exist', async () => {
      const id = '1';
      jest
        .spyOn(updateOrderByIdUseCase, 'execute')
        .mockResolvedValueOnce(left(new ResourceNotFoundError()));

      await expect(
        controller.updateByOrderId({ products: [] }, id),
      ).rejects.toThrow(
        new HttpException('Order not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('listAllOrders', () => {
    it('should return a list of orders based on filters', async () => {
      const filters = { status: 'PENDENTE' };
      const orders = [
        OrderFactory.createPendingOrder(),
        OrderFactory.createPendingOrder(),
      ];
      jest
        .spyOn(listAllOrdersByFiltersUseCase, 'execute')
        .mockResolvedValueOnce(right({ orders }));

      const result = await controller.listAllOrders(filters);

      expect(result).toEqual({ orders: orders.map(OrderMapping.toView) });
      expect(listAllOrdersByFiltersUseCase.execute).toHaveBeenCalledWith({
        filters: { status: ['PENDENTE'] },
      });
    });
  });

  describe('cancel', () => {
    it('should cancel an order and return its view', async () => {
      const id = '1';
      const expectedOrder = OrderFactory.createOrder();
      jest
        .spyOn(cancelOrderByIdUseCase, 'execute')
        .mockResolvedValueOnce(right({ order: expectedOrder }));

      const result = await controller.cancel(id);

      expect(result).toEqual({ order: OrderMapping.toView(expectedOrder) });
    });

    it('should throw CONFLICT if order is already canceled', async () => {
      const id = '1';
      jest
        .spyOn(cancelOrderByIdUseCase, 'execute')
        .mockResolvedValueOnce(left(new ResourceAlreadyProcessedError()));

      await expect(controller.cancel(id)).rejects.toThrow(
        new HttpException(
          'Order has already been canceled',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });
  describe('getOneById', () => {
    it('should return a single order by ID', async () => {
      const orderMock = OrderFactory.createOrder();
      findOrderByIdUseCase.execute = jest
        .fn()
        .mockResolvedValue(right({ order: orderMock }));

      const result = await controller.getOneById(orderMock.id.toString());

      expect(result).toEqual({ order: OrderMapping.toView(orderMock) });
    });

    it('should throw a 404 error if the order is not found', async () => {
      findOrderByIdUseCase.execute = jest.fn().mockResolvedValue({
        isLeft: () => true,
        value: new ResourceNotFoundError(),
      });

      await expect(controller.getOneById('invalidId')).rejects.toThrow(
        new HttpException('Order not found', HttpStatus.NOT_FOUND),
      );
    });
  });
  describe('updateStatus', () => {
    it('should update the status of an order', async () => {
      const orderMock = OrderFactory.createReceivedOrder();
      updateOrderStatusByIdUseCase.execute = jest
        .fn()
        .mockResolvedValue(right({ order: orderMock }));

      const result = await controller.updateStatus({
        id: 'order1',
        status: 'RECEBIDO',
      });

      expect(result).toEqual({ order: OrderMapping.toView(orderMock) });
    });

    it('should throw a 400 error if the status is invalid', async () => {
      updateOrderStatusByIdUseCase.execute = jest.fn().mockResolvedValue({
        isLeft: () => true,
        value: new InvalidOrderStatusError(),
      });

      await expect(
        controller.updateStatus({ id: 'order1', status: 'ANY' as any }),
      ).rejects.toThrow(
        new HttpException('Invalid order status', HttpStatus.BAD_REQUEST),
      );
    });
  });
});

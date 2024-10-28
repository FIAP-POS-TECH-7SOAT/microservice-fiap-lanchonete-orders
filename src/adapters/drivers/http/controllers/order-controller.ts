import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';

import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { CreateOrderProps, createOrderSchema } from './validations';

import { LoggingInterceptor } from '../Interceptors/custom-logger-routes';

import { CreateOrderUseCase } from '@core/modules/orders/application/use-case/create-order.use-case';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListAllOrdersByFiltersUseCase } from '@core/modules/orders/application/use-case/list-all-order-by-filters.use-case';
import {
  FiltersOrderProps,
  filtersOrderSchema,
} from './validations/filters-order.validate';
import {
  UpdateOrderProps,
  updateOrderSchema,
} from './validations/update-order.validate';
import { UpdateOrderByIdUseCase } from '@core/modules/orders/application/use-case/update-order-by-id.use-case';
import { FindOrderByIdUseCase } from '@core/modules/orders/application/use-case/find-order-by-id.use-case';
import { CancelOrderByIdUseCase } from '@core/modules/orders/application/use-case/cancel-order-by-id.use-case';
import { OrderMapping } from '../mapping/order-mapping';
import { UpdateOrderStatusByIdUseCase } from '@core/modules/orders/application/use-case/update-order-status-by-id.use-case';
import { UpdateStatusOrderProps } from './validations/update-status-order.validate';
import { ResourceNotFoundError } from '@core/modules/orders/application/errors/resource-not-found-error';
import { ResourceAlreadyProcessedError } from '@core/modules/orders/application/errors/resource-already-processed-error';
import { TOrderStatus } from '@core/modules/orders/entities/order';
import { InvalidOrderStatusError } from '@core/modules/orders/application/errors/invalid-order-status-error';

@Controller('/orders')
@ApiTags('Orders')
@ApiBearerAuth()
@UseInterceptors(LoggingInterceptor)
export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private listAllOrdersByFiltersUseCase: ListAllOrdersByFiltersUseCase,
    private updateOrderByIdUseCase: UpdateOrderByIdUseCase,
    private findOrderByIdUseCase: FindOrderByIdUseCase,
    private cancelOrderByIdUseCase: CancelOrderByIdUseCase,
    private updateOrderStatusByIdUseCase: UpdateOrderStatusByIdUseCase,
  ) {}

  @Post('/')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async create(@Body() body: CreateOrderProps) {
    const { client, products } = body;

    const result = await this.createOrderUseCase.execute({
      client: client ? client : null,
      products,
    });
    if (result.isLeft()) {
      throw new Error('');
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }

  @Put('/:id')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  async updateByOrderId(
    @Body() body: UpdateOrderProps,
    @Param('id') id: string,
  ) {
    const { products, client } = body;
    const result = await this.updateOrderByIdUseCase.execute({
      id,
      products,
      client: client ? client : null,
    });
    if (result.isLeft()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }

  @Get('/')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(filtersOrderSchema))
  async listAllOrders(@Query() query: FiltersOrderProps) {
    const { status } = query;

    let myStatus: string[] = [];
    if (!status) {
      myStatus = [];
    } else {
      if (typeof status === 'string') {
        myStatus = [status.trim().toUpperCase()];
      } else {
        myStatus = status.map((item) => item.trim().toUpperCase());
      }
    }

    const result = await this.listAllOrdersByFiltersUseCase.execute({
      filters: {
        status: myStatus,
      },
    });
    if (result.isLeft()) {
      throw new Error('');
    }
    return {
      orders: result.value.orders.map(OrderMapping.toView),
    };
  }

  @Get('/:id')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(filtersOrderSchema))
  async getOneById(@Param('id') id: string) {
    const result = await this.findOrderByIdUseCase.execute({ id });
    if (result.isLeft()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }

  @Put('/:id/cancel')
  @HttpCode(200)
  async cancel(@Param('id') id: string) {
    const result = await this.cancelOrderByIdUseCase.execute({ id });
    if (result.isLeft()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      } else if (result.value instanceof ResourceAlreadyProcessedError) {
        throw new HttpException(
          'Order has already been canceled',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }

  @Put('/:id/status/:status')
  @HttpCode(200)
  async updateStatus(@Param() params: UpdateStatusOrderProps) {
    const { id, status } = params;

    const result = await this.updateOrderStatusByIdUseCase.execute({
      id,
      status: status.toUpperCase() as TOrderStatus,
    });
    if (result.isLeft()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      } else if (result.value instanceof InvalidOrderStatusError) {
        throw new HttpException('Invalid order status', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }
}

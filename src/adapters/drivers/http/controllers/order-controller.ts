import {
  Body,
  Controller,
  Get,
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
      throw new Error('');
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }
  @Get('/')
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
  @UsePipes(new ZodValidationPipe(filtersOrderSchema))
  async getOneById(@Param('id') id: string) {
    const result = await this.findOrderByIdUseCase.execute({ id });
    if (result.isLeft()) {
      throw new Error('');
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }
  @Put('/:id')
  async cancel(@Param('id') id: string) {
    const result = await this.cancelOrderByIdUseCase.execute({ id });
    if (result.isLeft()) {
      throw new Error('');
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }
  @Put('/:id/status/:status')
  async updateStatus(@Param() params: UpdateStatusOrderProps) {
    const { id, status } = params;

    const result = await this.updateOrderStatusByIdUseCase.execute({
      id,
      status,
    });
    if (result.isLeft()) {
      throw new Error('');
    }
    return {
      order: OrderMapping.toView(result.value.order),
    };
  }
}

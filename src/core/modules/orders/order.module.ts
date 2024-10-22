import { Module } from '@nestjs/common';
import { AddCodeToOrderByIdUseCase } from './application/use-case/add-code-to-order-by-id.use-case';
import { CancelOrderByIdUseCase } from './application/use-case/cancel-order-by-id.use-case';
import { CreateOrderUseCase } from './application/use-case/create-order.use-case';
import { FindOrderByIdUseCase } from './application/use-case/find-order-by-id.use-case';
import { UpdateOrderByIdUseCase } from './application/use-case/update-order-by-id.use-case';
import { UpdateOrderStatusByIdUseCase } from './application/use-case/update-order-status-by-id.use-case';
import { ListAllOrdersByFiltersUseCase } from './application/use-case/list-all-order-by-filters.use-case';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AddCodeToOrderByIdUseCase,
    CancelOrderByIdUseCase,
    CreateOrderUseCase,
    FindOrderByIdUseCase,
    FindOrderByIdUseCase,
    UpdateOrderByIdUseCase,
    UpdateOrderStatusByIdUseCase,
    ListAllOrdersByFiltersUseCase,
  ],
  exports: [
    AddCodeToOrderByIdUseCase,
    CancelOrderByIdUseCase,
    CreateOrderUseCase,
    FindOrderByIdUseCase,
    FindOrderByIdUseCase,
    UpdateOrderByIdUseCase,
    UpdateOrderStatusByIdUseCase,
    ListAllOrdersByFiltersUseCase,
  ],
})
export class OrderModule {}

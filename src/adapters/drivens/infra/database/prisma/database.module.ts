import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

import { OrderProductRepository } from '@core/modules/orders/application/ports/repositories/order-product-repository';
import { PrismaOrderProductRepository } from './repositories/prisma-order-product-repository';

import { OrderRepository } from '@core/modules/orders/application/ports/repositories/order-repository';
import { PrismaOrderRepository } from './repositories/prisma-order-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: OrderProductRepository,
      useClass: PrismaOrderProductRepository,
    },
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [PrismaService, OrderRepository, OrderProductRepository],
})
export default class DatabaseModule {}

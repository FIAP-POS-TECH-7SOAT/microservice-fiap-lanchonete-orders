import { Module } from '@nestjs/common';

import { OrderController } from './controllers/order-controller';

import DatabaseModule from '@adapters/drivens/infra/database/prisma/database.module';
import { OrderModule } from '@core/modules/orders/order.module';

@Module({
  imports: [DatabaseModule, OrderModule],
  controllers: [OrderController],
})
export class HTTPModule {}

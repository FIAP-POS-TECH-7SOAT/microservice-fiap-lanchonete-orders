import { Module } from '@nestjs/common';

import { OrderController } from './controllers/order-controller';
import { AuthController } from './controllers/auth-controller';

import DatabaseModule from '@adapters/drivens/infra/database/prisma/database.module';
import { OrderModule } from '@core/modules/orders/order.module';

@Module({
  imports: [DatabaseModule, OrderModule],
  controllers: [AuthController, OrderController],
})
export class HTTPModule {}

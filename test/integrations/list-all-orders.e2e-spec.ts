import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

describe('GET /orders: List All Orders', () => {
  let app: INestApplication;
  let response: request.Response;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario: List All Orders Without Filters', () => {
    it('should return an empty array when there are no orders', async () => {
      // When I send a GET request to "/orders"
      response = await request(app.getHttpServer()).get('/orders').send();

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the response should be an empty array
      const orders = response.body.orders;
      expect(orders).toHaveLength(0);
    });
  });

  describe('Scenario: List Orders With Specific Status', () => {
    it('should return only orders with status "PENDENTE"', async () => {
      // Creating multiple orders with different statuses
      await prisma.order.createMany({
        data: [
          {
            id: new UniqueEntityID().toString(),
            status: 'PENDENTE',
          },
          {
            id: new UniqueEntityID().toString(),
            status: 'PENDENTE',
          },
          {
            id: new UniqueEntityID().toString(),
            status: 'RECEBIDO',
          },
        ],
      });

      // When I send a GET request to "/orders?status=Pendente"
      response = await request(app.getHttpServer())
        .get('/orders?status=Pendente')
        .send();

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the response should contain only the "PENDENTE" orders
      const { orders } = response.body;
      expect(orders).toHaveLength(2);
      expect(orders.every((order) => order.status === 'PENDENTE')).toBe(true);
    });

    it('should return an empty array when there are no orders with the specified status', async () => {
      // When I send a GET request to "/orders?status=PRONTO" without creating any "PRONTO" orders
      response = await request(app.getHttpServer())
        .get('/orders?status=PRONTO')
        .send();

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the response should be an empty array
      const orders = response.body.orders;
      expect(orders).toHaveLength(0);
    });
  });

  describe('Scenario: List Orders With Invalid Status', () => {
    it('should return an empty array for an invalid status', async () => {
      // When I send a GET request to "/orders?status=INVALID_STATUS"

      response = await request(app.getHttpServer())
        .get('/orders?status=INVALID_STATUS')
        .send();

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the response should be an empty array
      const orders = response.body.orders;
      expect(orders).toHaveLength(0);
    });
  });
});

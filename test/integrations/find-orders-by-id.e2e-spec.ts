import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';

import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

describe('GET /orders/{id}: Find order by ID feature', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let response: request.Response;

  beforeAll(async () => {
    // Given the NestJS application is initialized
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup: Close the application after all tests
    await app.close();
  });

  describe('Scenario: Successfully retrieving an existing order by ID', () => {
    it('should return the order details when a valid ID is provided', async () => {
      // Given an order is created in the database with "PENDENTE" status
      const id = new UniqueEntityID().toString();

      await prisma.order.create({
        data: {
          id,
          status: 'PENDENTE',
        },
      });

      // When a GET request is sent to "/orders/{id}" with the valid order ID
      response = await request(app.getHttpServer()).get(`/orders/${id}`).send();

      // Then the response status code should be 200, indicating successful retrieval
      expect(response.statusCode).toBe(200);

      // And the response should contain the order details with the correct status
      const { order } = response.body;
      expect(order).toBeDefined();
      expect(order.status).toBe('PENDENTE');
      expect(order.id).toBe(id);
    });
  });

  describe('Scenario: Attempting to retrieve a non-existent order', () => {
    it('should return a 404 error when the order ID does not exist', async () => {
      // Given an order ID that does not exist in the database
      const nonExistentId = new UniqueEntityID().toString();

      // When a GET request is sent to "/orders/{nonExistentId}"
      response = await request(app.getHttpServer())
        .get(`/orders/${nonExistentId}`)
        .send();

      // Then the response status code should be 404, indicating order not found
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });
});

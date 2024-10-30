import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

describe('PUT /orders/{id}: Order update feature', () => {
  let app: INestApplication;
  let response: request.Response;
  let prisma: PrismaService;
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
    // Cleanup: Close the NestJS application after all tests
    await app.close();
  });

  describe('Scenario: Update an existing order with valid data', () => {
    it('should successfully update an existing order with new product details', async () => {
      // Given an existing order with "PENDING" status
      const id = new UniqueEntityID().toString();

      await prisma.order.create({
        data: {
          id,
          status: 'PENDING',
        },
      });

      // When a PUT request is sent to "/orders/{id}" with valid client and product details
      response = await request(app.getHttpServer())
        .put(`/orders/${id}`)
        .send({
          client: {
            name: 'John Doe',
            email: 'john@mail.com',
            document: '14785236920',
          },
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 3,
              unit_price: 4,
            },
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100ce',
              amount: 3,
              unit_price: 3,
            },
          ],
        });

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the order in the database should have "PENDING" status
      // And the total amount should be correctly updated to 6
      const orderDb = await prisma.order.findUnique({
        where: { id },
      });
      const orderProducts = await prisma.orderProduct.findMany({
        where: {
          order_id: id,
        },
      });

      expect(orderDb?.status).toBe('PENDING');
      expect(Number(orderDb?.total_amount)).toBe(6);
      expect(orderProducts).toHaveLength(2);
    });
  });

  describe('Scenario: Attempt to update a non-existent order', () => {
    it('should return a 404 error when updating an order that does not exist', async () => {
      // Given an invalid order ID that does not exist in the database
      const nonExistentId = new UniqueEntityID().toString();

      // When a PUT request is sent to "/orders/{nonExistentId}"
      response = await request(app.getHttpServer())
        .put(`/orders/${nonExistentId}`)
        .send({
          client: {
            name: 'John Doe',
            email: 'john@mail.com',
            document: '14785236920',
          },
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 2,
              unit_price: 10,
            },
          ],
        });

      // Then the response status code should be 404, indicating the order was not found
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('Scenario: Attempt to update an order with invalid client email', () => {
    it('should return a 400 error when an invalid email is provided', async () => {
      // Given an existing order in the database
      const id = new UniqueEntityID().toString();

      await prisma.order.create({
        data: {
          id,
          status: 'PENDING',
        },
      });

      // When a PUT request is sent with an invalid email format
      response = await request(app.getHttpServer())
        .put(`/orders/${id}`)
        .send({
          client: {
            name: 'John Doe',
            email: 'invalid-email',
            document: '14785236920',
          },
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 2,
              unit_price: 10,
            },
          ],
        });

      // Then the response status code should be 400, indicating a validation error
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Validation fails');
    });
  });

  describe('Scenario: Update an order with missing product details', () => {
    it('should return a 400 error when product details are incomplete', async () => {
      // Given an existing order with "PENDING" status
      const id = new UniqueEntityID().toString();

      await prisma.order.create({
        data: {
          id,
          status: 'PENDING',
        },
      });

      // When a PUT request is sent without product details
      response = await request(app.getHttpServer())
        .put(`/orders/${id}`)
        .send({
          client: {
            name: 'John Doe',
            email: 'john@mail.com',
            document: '14785236920',
          },
          products: [
            {
              // Missing "id" and "unit_price" for a product
              amount: 3,
            },
          ],
        });

      // Then the response status code should be 400, indicating a validation error
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Validation fails');
    });
  });
});

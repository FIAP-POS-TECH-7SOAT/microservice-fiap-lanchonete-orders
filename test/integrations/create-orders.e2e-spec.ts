import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';

import { resetDatabase } from './configs/setup-database';

describe('POST /orders: Order creation feature', () => {
  let app: INestApplication;
  let response: request.Response;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario: Creating an order with valid product details', () => {
    beforeEach(async () => {
      // Given the database is reset
      await resetDatabase(global.prisma);
    });

    it('should create a new order successfully', async () => {
      // When I send a POST request to "/orders" with valid product details
      response = await request(app.getHttpServer())
        .post('/orders')
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
              unit_price: 3,
            },
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100ce',
              amount: 3,
              unit_price: 3,
            },
          ],
        });

      // Then the response status code should be 201
      expect(response.statusCode).toBe(201);

      // And the order status should be "Pendente"
      // And the total amount should be 3
      const orderDb = await global.prisma.order.findFirst();
      const orderProductDb = await global.prisma.orderProduct.findMany({
        where: {
          order_id: orderDb?.id,
        },
      });

      expect(orderDb?.status).toBe('PENDENTE');
      expect(Number(orderDb?.total_amount)).toBe(6);
      expect(orderProductDb).toHaveLength(2);
    });
    it('should create a new order successfully without a client', async () => {
      // When I send a POST request to "/orders" with valid product details
      // And without client
      response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 3,
              unit_price: 3,
            },
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100ce',
              amount: 3,
              unit_price: 3,
            },
          ],
        });

      // Then the response status code should be 201
      expect(response.statusCode).toBe(201);

      // And the order status should be "Pendente"
      // And the total amount should be 3
      const orderDb = await global.prisma.order.findFirst();
      const orderProductDb = await global.prisma.orderProduct.findMany({
        where: {
          order_id: orderDb?.id,
        },
      });

      expect(orderDb?.status).toBe('PENDENTE');
      expect(Number(orderDb?.total_amount)).toBe(6);
      expect(orderProductDb).toHaveLength(2);
    });
  });
  describe('Scenario: Creating an order with invalid product details', () => {
    beforeEach(async () => {
      // Given the database is reset
      await resetDatabase(global.prisma);
    });

    it("shouldn't create a new order with invalid email", async () => {
      // When I send a POST request to "/orders" with invalid email
      response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          client: {
            name: 'John Doe',
            email: 'not-a-mail',
            document: '14785236920',
          },
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 3,
              unit_price: 3,
            },
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100ce',
              amount: 3,
              unit_price: 3,
            },
          ],
        });

      // Then the response status code should be 400
      expect(response.statusCode).toBe(400);
    });
    it("shouldn't create a new order without required value", async () => {
      // When I send a POST request to "/orders" with invalid email
      response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          client: {
            name: 'John Doe',
            email: 'john@mail.com',
            // document: '14785236920',
          },
          products: [
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100cd',
              amount: 3,
              unit_price: 3,
            },
            {
              id: 'ddc2bc43-2d19-445a-8354-2bdb78d100ce',
              amount: 3,
              unit_price: 3,
            },
          ],
        });

      // Then the response status code should be 400
      expect(response.statusCode).toBe(400);
    });
  });
});

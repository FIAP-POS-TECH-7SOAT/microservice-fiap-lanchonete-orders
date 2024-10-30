import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';
import { PrismaService } from '@adapters/drivens/infra/database/prisma/prisma.service';

describe('PUT /orders/{id}/status/{status}: Update order status by ID feature', () => {
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

  describe('Scenario: Successfully updating the status of an existing order by ID', () => {
    it('should update the order status and return the updated order details when a valid ID is provided', async () => {
      const id = new UniqueEntityID().toString();

      // Given an order is created in the database with "PENDENTE" status
      await prisma.order.create({
        data: {
          id,
          status: 'PENDENTE',
        },
      });
      const status = 'RECEBIDO';

      // When a PUT request is sent to "/orders/{id}/status/{status}" with the valid order ID
      response = await request(app.getHttpServer())
        .put(`/orders/${id}/status/${status}`)
        .send();

      // Then the response status code should be 200
      expect(response.statusCode).toBe(200);

      // And the response should contain the updated order details
      const { order } = response.body;
      expect(order).toBeDefined();
      expect(order.id).toBe(id);
      expect(order.status).toEqual('RECEBIDO'); // Verifica se o status foi atualizado corretamente
    });
  });

  describe('Scenario: Attempting to update the status of a non-existing order', () => {
    it('should return a 404 error when the order does not exist', async () => {
      const nonExistingId = new UniqueEntityID().toString();
      const status = 'RECEBIDO';

      // When a PUT request is sent to "/orders/{id}/status/{status}" with a non-existing order ID
      response = await request(app.getHttpServer())
        .put(`/orders/${nonExistingId}/status/${status}`)
        .send();

      // Then the response status code should be 404
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Order not found'); // Mensagem de erro adequada
    });
  });

  describe('Scenario: Attempting to update the status with an invalid status', () => {
    it('should return a 400 error when the status is invalid', async () => {
      const id = new UniqueEntityID().toString();

      // Given an order is created in the database with "PENDENTE" status
      await prisma.order.create({
        data: {
          id,
          status: 'PENDENTE',
        },
      });
      const invalidStatus = 'INVALID_STATUS';

      // When a PUT request is sent to "/orders/{id}/status/{status}" with an invalid status
      response = await request(app.getHttpServer())
        .put(`/orders/${id}/status/${invalidStatus}`)
        .send();

      // Then the response status code should be 400
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid order status'); // Mensagem de erro adequada
    });
  });

  describe('Scenario: Attempting to transition from a status that is not valid', () => {
    it('should return a 400 error when transitioning from an invalid status', async () => {
      const id = new UniqueEntityID().toString();

      // Given an order is created in the database with "FINALIZADO" status
      await prisma.order.create({
        data: {
          id,
          status: 'FINALIZADO',
        },
      });
      const status = 'RECEBIDO'; // Tentando voltar para um status anterior

      // When a PUT request is sent to "/orders/{id}/status/{status}" with a valid order ID
      response = await request(app.getHttpServer())
        .put(`/orders/${id}/status/${status}`)
        .send();

      // Then the response status code should be 400
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid order status'); // Mensagem de erro adequada
    });
  });
});

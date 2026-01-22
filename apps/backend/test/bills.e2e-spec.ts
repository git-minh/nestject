/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanupTestData, resetSequences } from './setup';

describe('BillsController (e2e)', () => {
  let app: INestApplication<App>;
  let unitId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  beforeEach(async () => {
    await cleanupTestData();
    await resetSequences();

    // Create prerequisite data
    const propertyResponse = await request(app.getHttpServer())
      .post('/properties')
      .send({ code: 'TEST', name: 'Test Property' });

    const propertyId = propertyResponse.body[0].id;

    const unitResponse = await request(app.getHttpServer())
      .post('/units')
      .send({ propertyId, name: '101' });

    unitId = unitResponse.body[0].id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('GET /bills', () => {
    it('should return an empty array when no bills exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/bills')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all bills with joined unit data', async () => {
      await request(app.getHttpServer()).post('/bills').send({
        unitId,
        month: 1,
        year: 2024,
        totalAmount: 5000000,
      });

      const response = await request(app.getHttpServer())
        .get('/bills')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('bill');
      expect(response.body[0]).toHaveProperty('unit');
    });
  });

  describe('GET /bills/:id', () => {
    it('should return a bill by id with unit and items', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/bills')
        .send({
          unitId,
          month: 1,
          year: 2024,
          electricStart: 100,
          electricEnd: 200,
          electricRate: 3500,
          totalAmount: 5000000,
        });

      const billId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/bills/${billId}`)
        .expect(200);

      expect(response.body).toHaveProperty('bill');
      expect(response.body).toHaveProperty('unit');
      expect(response.body).toHaveProperty('items');
      expect(response.body.bill).toHaveProperty('id', billId);
    });

    it('should return 404 for non-existent bill', async () => {
      await request(app.getHttpServer()).get('/bills/9999').expect(404);
    });
  });

  describe('POST /bills', () => {
    it('should create a new bill with all fields', async () => {
      const billData = {
        unitId,
        month: 1,
        year: 2024,
        electricStart: 100,
        electricEnd: 200,
        electricRate: 3500,
        waterUsage: 10,
        waterRate: 25000,
        totalAmount: 5600000,
        paidAmount: 0,
        status: 'unpaid',
        note: 'Test bill',
      };

      const response = await request(app.getHttpServer())
        .post('/bills')
        .send(billData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('month', 1);
      expect(response.body[0]).toHaveProperty('year', 2024);
    });

    it('should create a bill with minimal fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/bills')
        .send({
          unitId,
          month: 2,
          year: 2024,
          totalAmount: 3000000,
        })
        .expect(201);

      expect(response.body[0]).toHaveProperty('id');
    });
  });

  describe('PATCH /bills/:id', () => {
    it('should update a bill', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/bills')
        .send({
          unitId,
          month: 1,
          year: 2024,
          totalAmount: 5000000,
          status: 'unpaid',
        });

      const billId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/bills/${billId}`)
        .send({ paidAmount: 2500000, status: 'partial' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'partial');
    });

    it('should return 404 when updating non-existent bill', async () => {
      await request(app.getHttpServer())
        .patch('/bills/9999')
        .send({ status: 'paid' })
        .expect(404);
    });
  });

  describe('GET /bills/:id/items', () => {
    it('should return bill items for a bill', async () => {
      const createBillResponse = await request(app.getHttpServer())
        .post('/bills')
        .send({
          unitId,
          month: 1,
          year: 2024,
          totalAmount: 5000000,
        });

      const billId = createBillResponse.body[0].id;

      // Create bill items
      await request(app.getHttpServer())
        .post(`/bills/${billId}/items`)
        .send({ type: 'ELECTRIC', description: 'Electric', amount: 350000 });

      await request(app.getHttpServer())
        .post(`/bills/${billId}/items`)
        .send({ type: 'WATER', description: 'Water', amount: 250000 });

      const response = await request(app.getHttpServer())
        .get(`/bills/${billId}/items`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('type', 'ELECTRIC');
      expect(response.body[1]).toHaveProperty('type', 'WATER');
    });

    it('should return 404 for non-existent bill', async () => {
      await request(app.getHttpServer()).get('/bills/9999/items').expect(404);
    });
  });

  describe('POST /bills/:id/items', () => {
    it('should create a bill item', async () => {
      const createBillResponse = await request(app.getHttpServer())
        .post('/bills')
        .send({
          unitId,
          month: 1,
          year: 2024,
          totalAmount: 5000000,
        });

      const billId = createBillResponse.body[0].id;

      const itemData = {
        type: 'PARKING',
        description: 'Parking fee',
        amount: 100000,
      };

      const response = await request(app.getHttpServer())
        .post(`/bills/${billId}/items`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        bill_id: billId,
        type: itemData.type,
        description: itemData.description,
      });
    });

    it('should return 404 when creating item for non-existent bill', async () => {
      await request(app.getHttpServer())
        .post('/bills/9999/items')
        .send({ type: 'OTHER', description: 'Test', amount: 50000 })
        .expect(404);
    });
  });
});

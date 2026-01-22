import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanupTestData, resetSequences } from './setup';

describe('LeasesController (e2e)', () => {
  let app: INestApplication<App>;
  let unitId: number;
  let tenantId: number;

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

    const tenantResponse = await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'Test Tenant', phone: '0901234567' });

    tenantId = tenantResponse.body[0].id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('GET /leases', () => {
    it('should return an empty array when no leases exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/leases')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all leases with joined data', async () => {
      await request(app.getHttpServer()).post('/leases').send({
        unitId,
        tenantId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      const response = await request(app.getHttpServer())
        .get('/leases')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('lease');
      expect(response.body[0]).toHaveProperty('tenant');
      expect(response.body[0]).toHaveProperty('unit');
    });
  });

  describe('GET /leases/:id', () => {
    it('should return a lease by id with joined data', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/leases')
        .send({
          unitId,
          tenantId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          deposit: 10000000,
          rentPrice: 5000000,
        });

      const leaseId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/leases/${leaseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('lease');
      expect(response.body).toHaveProperty('tenant');
      expect(response.body).toHaveProperty('unit');
      expect(response.body.lease).toHaveProperty('id', leaseId);
    });

    it('should return 404 for non-existent lease', async () => {
      await request(app.getHttpServer()).get('/leases/9999').expect(404);
    });
  });

  describe('POST /leases', () => {
    it('should create a new lease with all fields', async () => {
      const leaseData = {
        unitId,
        tenantId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        deposit: 10000000,
        rentPrice: 5000000,
        occupantCount: 2,
        active: true,
      };

      const response = await request(app.getHttpServer())
        .post('/leases')
        .send(leaseData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('start_date', '2024-01-01');
      expect(response.body[0]).toHaveProperty('end_date', '2024-12-31');
    });

    it('should create a lease with minimal fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/leases')
        .send({
          unitId,
          tenantId,
          startDate: '2024-06-01',
          endDate: '2025-05-31',
        })
        .expect(201);

      expect(response.body[0]).toHaveProperty('id');
    });
  });

  describe('PATCH /leases/:id', () => {
    it('should update a lease', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/leases')
        .send({
          unitId,
          tenantId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          active: true,
        });

      const leaseId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/leases/${leaseId}`)
        .send({ active: false, rentPrice: 6000000 })
        .expect(200);

      expect(response.body).toHaveProperty('active', false);
    });

    it('should return 404 when updating non-existent lease', async () => {
      await request(app.getHttpServer())
        .patch('/leases/9999')
        .send({ active: false })
        .expect(404);
    });
  });

  describe('DELETE /leases/:id', () => {
    it('should delete a lease', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/leases')
        .send({
          unitId,
          tenantId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      const leaseId = createResponse.body[0].id;

      await request(app.getHttpServer())
        .delete(`/leases/${leaseId}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer()).get(`/leases/${leaseId}`).expect(404);
    });

    it('should return 404 when deleting non-existent lease', async () => {
      await request(app.getHttpServer()).delete('/leases/9999').expect(404);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanupTestData, resetSequences } from './setup';

describe('TenantsController (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('GET /tenants', () => {
    it('should return an empty array when no tenants exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/tenants')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tenants', async () => {
      await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'John Doe', phone: '0901234567' });

      await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Jane Doe', phone: '0909876543' });

      const response = await request(app.getHttpServer())
        .get('/tenants')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'John Doe');
      expect(response.body[1]).toHaveProperty('name', 'Jane Doe');
    });
  });

  describe('GET /tenants/:id', () => {
    it('should return a tenant by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'John Doe', phone: '0901234567' });

      const tenantId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('phone', '0901234567');
    });

    it('should return 404 for non-existent tenant', async () => {
      await request(app.getHttpServer()).get('/tenants/9999').expect(404);
    });
  });

  describe('POST /tenants', () => {
    it('should create a new tenant with all fields', async () => {
      const tenantData = {
        name: 'New Tenant',
        phone: '0912345678',
      };

      const response = await request(app.getHttpServer())
        .post('/tenants')
        .send(tenantData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(tenantData);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should create a tenant with minimal fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Minimal Tenant' })
        .expect(201);

      expect(response.body[0]).toHaveProperty('name', 'Minimal Tenant');
    });
  });

  describe('PATCH /tenants/:id', () => {
    it('should update a tenant', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'John Doe', phone: '0901234567' });

      const tenantId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/tenants/${tenantId}`)
        .send({ name: 'John Updated', phone: '0999999999' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'John Updated');
      expect(response.body).toHaveProperty('phone', '0999999999');
    });

    it('should update only provided fields', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'John Doe', phone: '0901234567' });

      const tenantId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/tenants/${tenantId}`)
        .send({ phone: '0888888888' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('phone', '0888888888');
    });

    it('should return 404 when updating non-existent tenant', async () => {
      await request(app.getHttpServer())
        .patch('/tenants/9999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /tenants/:id', () => {
    it('should delete a tenant', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'John Doe' });

      const tenantId = createResponse.body[0].id;

      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/tenants/${tenantId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent tenant', async () => {
      await request(app.getHttpServer()).delete('/tenants/9999').expect(404);
    });
  });
});

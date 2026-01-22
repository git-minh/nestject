import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanupTestData, resetSequences } from './setup';

describe('UnitsController (e2e)', () => {
  let app: INestApplication<App>;
  let propertyId: number;

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

    // Create a property for units
    const response = await request(app.getHttpServer())
      .post('/properties')
      .send({ code: 'TEST', name: 'Test Property' });
    propertyId = response.body[0].id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('GET /units', () => {
    it('should return an empty array when no units exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/units')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all units', async () => {
      await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '101', floor: 1 });

      await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '102', floor: 1 });

      const response = await request(app.getHttpServer())
        .get('/units')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should filter units by propertyId', async () => {
      // Create second property
      const prop2Response = await request(app.getHttpServer())
        .post('/properties')
        .send({ code: 'TEST2', name: 'Test Property 2' });
      const property2Id = prop2Response.body[0].id;

      await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '101' });

      await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId: property2Id, name: '201' });

      const response = await request(app.getHttpServer())
        .get(`/units?propertyId=${propertyId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', '101');
    });
  });

  describe('GET /units/:id', () => {
    it('should return a unit by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '101', floor: 1, basePrice: 5000000 });

      const unitId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .get(`/units/${unitId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', '101');
      expect(response.body).toHaveProperty('floor', 1);
    });

    it('should return 404 for non-existent unit', async () => {
      await request(app.getHttpServer()).get('/units/9999').expect(404);
    });
  });

  describe('POST /units', () => {
    it('should create a new unit', async () => {
      const unitData = {
        propertyId,
        name: '301',
        floor: 3,
        basePrice: 6000000,
      };

      const response = await request(app.getHttpServer())
        .post('/units')
        .send(unitData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: unitData.name,
        floor: unitData.floor,
      });
    });

    it('should create a unit with minimal fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '401' })
        .expect(201);

      expect(response.body[0]).toHaveProperty('name', '401');
    });
  });

  describe('PATCH /units/:id', () => {
    it('should update a unit', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '101', floor: 1 });

      const unitId = createResponse.body[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/units/${unitId}`)
        .send({ name: 'Updated 101', floor: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated 101');
      expect(response.body).toHaveProperty('floor', 2);
    });

    it('should return 404 when updating non-existent unit', async () => {
      await request(app.getHttpServer())
        .patch('/units/9999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /units/:id', () => {
    it('should delete a unit', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/units')
        .send({ propertyId, name: '101' });

      const unitId = createResponse.body[0].id;

      await request(app.getHttpServer()).delete(`/units/${unitId}`).expect(200);

      // Verify deletion
      await request(app.getHttpServer()).get(`/units/${unitId}`).expect(404);
    });

    it('should return 404 when deleting non-existent unit', async () => {
      await request(app.getHttpServer()).delete('/units/9999').expect(404);
    });
  });
});

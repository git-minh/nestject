import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanupTestData, resetSequences } from './setup';

describe('PropertiesController (e2e)', () => {
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

  describe('GET /properties', () => {
    it('should return an empty array when no properties exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/properties')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all properties', async () => {
      // Create test properties
      await request(app.getHttpServer())
        .post('/properties')
        .send({ code: 'K10', name: 'Property 1', address: '123 Test St' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/properties')
        .send({ code: 'K11', name: 'Property 2' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/properties')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('code', 'K10');
      expect(response.body[1]).toHaveProperty('code', 'K11');
    });
  });

  describe('POST /properties', () => {
    it('should create a new property with all fields', async () => {
      const propertyData = {
        code: 'K12',
        name: 'New Property',
        address: '456 New St',
        electricId: 'ELEC001',
        waterId: 'WATER001',
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        code: propertyData.code,
        name: propertyData.name,
        address: propertyData.address,
      });
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should create a property with minimal fields', async () => {
      const propertyData = {
        code: 'K13',
        name: 'Minimal Property',
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        code: propertyData.code,
        name: propertyData.name,
      });
    });

    it('should reject duplicate property codes', async () => {
      const propertyData = {
        code: 'K14',
        name: 'First Property',
      };

      await request(app.getHttpServer())
        .post('/properties')
        .send(propertyData)
        .expect(201);

      // Try to create another property with the same code
      await request(app.getHttpServer())
        .post('/properties')
        .send({ code: 'K14', name: 'Duplicate Property' })
        .expect(500); // Should fail due to unique constraint
    });
  });
});

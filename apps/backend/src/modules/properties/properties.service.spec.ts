/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { DATABASE_CONNECTION } from '../../db/database.module';
import {
  createMockDatabase,
  mockSelectQuery,
  mockInsertQuery,
  testDataFactory,
} from '../../test/test-utils';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(async () => {
    mockDb = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of properties', async () => {
      const mockProperties = [
        testDataFactory.property({ id: 1, code: 'K10', name: 'Property 1' }),
        testDataFactory.property({ id: 2, code: 'K11', name: 'Property 2' }),
      ];

      mockSelectQuery(mockDb, mockProperties);

      const result = await service.findAll();

      expect(result).toEqual(mockProperties);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return an empty array when no properties exist', async () => {
      mockSelectQuery(mockDb, []);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new property and return it', async () => {
      const createDto = {
        code: 'K12',
        name: 'New Property',
        address: '456 New St',
        electricId: 'ELEC002',
        waterId: 'WATER002',
      };

      const createdProperty = testDataFactory.property({
        id: 3,
        code: createDto.code,
        name: createDto.name,
        address: createDto.address,
        electric_id: createDto.electricId,
        water_id: createDto.waterId,
      });

      mockInsertQuery(mockDb, [createdProperty]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdProperty]);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create a property with minimal fields', async () => {
      const createDto = {
        code: 'K13',
        name: 'Minimal Property',
      };

      const createdProperty = testDataFactory.property({
        id: 4,
        code: createDto.code,
        name: createDto.name,
        address: null,
        electric_id: null,
        water_id: null,
      });

      mockInsertQuery(mockDb, [createdProperty]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdProperty]);
    });
  });
});

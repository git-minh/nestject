import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UnitsService } from './units.service';
import { DATABASE_CONNECTION } from '../../db/database.module';
import {
  createMockDatabase,
  mockSelectQuery,
  mockInsertQuery,
  mockUpdateQuery,
  mockDeleteQuery,
  testDataFactory,
} from '../../test/test-utils';

describe('UnitsService', () => {
  let service: UnitsService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(async () => {
    mockDb = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all units when no propertyId is provided', async () => {
      const mockUnits = [
        testDataFactory.unit({ id: 1, name: '101' }),
        testDataFactory.unit({ id: 2, name: '102' }),
      ];

      mockSelectQuery(mockDb, mockUnits);

      const result = await service.findAll();

      expect(result).toEqual(mockUnits);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return filtered units when propertyId is provided', async () => {
      const mockUnits = [
        testDataFactory.unit({ id: 1, property_id: 1, name: '101' }),
      ];

      mockSelectQuery(mockDb, mockUnits);

      const result = await service.findAll(1);

      expect(result).toEqual(mockUnits);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return an empty array when no units exist', async () => {
      mockSelectQuery(mockDb, []);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a unit when it exists', async () => {
      const mockUnit = testDataFactory.unit({ id: 1 });

      mockSelectQuery(mockDb, [mockUnit]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUnit);
    });

    it('should throw NotFoundException when unit does not exist', async () => {
      mockSelectQuery(mockDb, []);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Unit with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new unit and return it', async () => {
      const createDto = {
        propertyId: 1,
        name: '201',
        floor: 2,
        basePrice: 6000000,
      };

      const createdUnit = testDataFactory.unit({
        id: 3,
        property_id: createDto.propertyId,
        name: createDto.name,
        floor: createDto.floor,
        base_price: createDto.basePrice.toString(),
      });

      mockInsertQuery(mockDb, [createdUnit]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdUnit]);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create a unit with minimal fields', async () => {
      const createDto = {
        propertyId: 1,
        name: '301',
      };

      const createdUnit = testDataFactory.unit({
        id: 4,
        property_id: createDto.propertyId,
        name: createDto.name,
        floor: null,
        base_price: null,
      });

      mockInsertQuery(mockDb, [createdUnit]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdUnit]);
    });
  });

  describe('update', () => {
    it('should update a unit and return the updated unit', async () => {
      const updateDto = {
        name: 'Updated Unit',
        floor: 3,
      };

      const updatedUnit = testDataFactory.unit({
        id: 1,
        name: updateDto.name,
        floor: updateDto.floor,
      });

      mockUpdateQuery(mockDb, [updatedUnit]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedUnit);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent unit', async () => {
      mockUpdateQuery(mockDb, []);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        basePrice: 7000000,
      };

      const updatedUnit = testDataFactory.unit({
        id: 1,
        base_price: updateDto.basePrice.toString(),
      });

      mockUpdateQuery(mockDb, [updatedUnit]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedUnit);
    });
  });

  describe('remove', () => {
    it('should delete a unit and return the deleted unit', async () => {
      const deletedUnit = testDataFactory.unit({ id: 1 });

      mockDeleteQuery(mockDb, [deletedUnit]);

      const result = await service.remove(1);

      expect(result).toEqual(deletedUnit);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent unit', async () => {
      mockDeleteQuery(mockDb, []);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Unit with ID 999 not found',
      );
    });
  });
});

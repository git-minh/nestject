/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeasesService } from './leases.service';
import { DATABASE_CONNECTION } from '../../db/database.module';
import {
  createMockDatabase,
  mockSelectQuery,
  mockInsertQuery,
  mockUpdateQuery,
  mockDeleteQuery,
  testDataFactory,
} from '../../test/test-utils';

describe('LeasesService', () => {
  let service: LeasesService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(async () => {
    mockDb = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeasesService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<LeasesService>(LeasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of leases with joined tenant and unit data', async () => {
      const mockLeases = [
        {
          lease: testDataFactory.lease({ id: 1 }),
          tenant: testDataFactory.tenant({ id: 1 }),
          unit: testDataFactory.unit({ id: 1 }),
        },
        {
          lease: testDataFactory.lease({ id: 2 }),
          tenant: testDataFactory.tenant({ id: 2 }),
          unit: testDataFactory.unit({ id: 2 }),
        },
      ];

      mockSelectQuery(mockDb, mockLeases);

      const result = await service.findAll();

      expect(result).toEqual(mockLeases);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return an empty array when no leases exist', async () => {
      mockSelectQuery(mockDb, []);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a lease with joined data when it exists', async () => {
      const mockLease = {
        lease: testDataFactory.lease({ id: 1 }),
        tenant: testDataFactory.tenant({ id: 1 }),
        unit: testDataFactory.unit({ id: 1 }),
      };

      mockSelectQuery(mockDb, [mockLease]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockLease);
    });

    it('should throw NotFoundException when lease does not exist', async () => {
      mockSelectQuery(mockDb, []);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Lease with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new lease and return it', async () => {
      const createDto = {
        unitId: 1,
        tenantId: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        deposit: 10000000,
        rentPrice: 5000000,
        occupantCount: 2,
        active: true,
      };

      const createdLease = testDataFactory.lease({
        id: 3,
        unit_id: createDto.unitId,
        tenant_id: createDto.tenantId,
        start_date: createDto.startDate,
        end_date: createDto.endDate,
        deposit: createDto.deposit.toString(),
        rent_price: createDto.rentPrice.toString(),
        occupant_count: createDto.occupantCount,
        active: createDto.active,
      });

      mockInsertQuery(mockDb, [createdLease]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdLease]);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create a lease with minimal required fields', async () => {
      const createDto = {
        unitId: 1,
        tenantId: 1,
        startDate: '2024-06-01',
        endDate: '2025-05-31',
      };

      const createdLease = testDataFactory.lease({
        id: 4,
        unit_id: createDto.unitId,
        tenant_id: createDto.tenantId,
        start_date: createDto.startDate,
        end_date: createDto.endDate,
      });

      mockInsertQuery(mockDb, [createdLease]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdLease]);
    });
  });

  describe('update', () => {
    it('should update a lease and return the updated lease', async () => {
      const updateDto = {
        rentPrice: 6000000,
        active: false,
      };

      const updatedLease = testDataFactory.lease({
        id: 1,
        rent_price: updateDto.rentPrice.toString(),
        active: updateDto.active,
      });

      mockUpdateQuery(mockDb, [updatedLease]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedLease);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent lease', async () => {
      mockUpdateQuery(mockDb, []);

      await expect(service.update(999, { active: false })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        endDate: '2025-12-31',
      };

      const updatedLease = testDataFactory.lease({
        id: 1,
        end_date: updateDto.endDate,
      });

      mockUpdateQuery(mockDb, [updatedLease]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedLease);
    });
  });

  describe('remove', () => {
    it('should delete a lease and return the deleted lease', async () => {
      const deletedLease = testDataFactory.lease({ id: 1 });

      mockDeleteQuery(mockDb, [deletedLease]);

      const result = await service.remove(1);

      expect(result).toEqual(deletedLease);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent lease', async () => {
      mockDeleteQuery(mockDb, []);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Lease with ID 999 not found',
      );
    });
  });
});

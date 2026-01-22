/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { DATABASE_CONNECTION } from '../../db/database.module';
import {
  createMockDatabase,
  mockSelectQuery,
  mockInsertQuery,
  mockUpdateQuery,
  mockDeleteQuery,
  testDataFactory,
} from '../../test/test-utils';

describe('TenantsService', () => {
  let service: TenantsService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(async () => {
    mockDb = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const mockTenants = [
        testDataFactory.tenant({ id: 1, name: 'Tenant 1' }),
        testDataFactory.tenant({ id: 2, name: 'Tenant 2' }),
      ];

      mockSelectQuery(mockDb, mockTenants);

      const result = await service.findAll();

      expect(result).toEqual(mockTenants);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return an empty array when no tenants exist', async () => {
      mockSelectQuery(mockDb, []);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a tenant when it exists', async () => {
      const mockTenant = testDataFactory.tenant({ id: 1 });

      mockSelectQuery(mockDb, [mockTenant]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      mockSelectQuery(mockDb, []);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Tenant with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new tenant and return it', async () => {
      const createDto = {
        name: 'New Tenant',
        phone: '0909876543',
      };

      const createdTenant = testDataFactory.tenant({
        id: 3,
        name: createDto.name,
        phone: createDto.phone,
      });

      mockInsertQuery(mockDb, [createdTenant]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdTenant]);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create a tenant with minimal fields', async () => {
      const createDto = {
        name: 'Minimal Tenant',
      };

      const createdTenant = testDataFactory.tenant({
        id: 4,
        name: createDto.name,
        phone: null,
      });

      mockInsertQuery(mockDb, [createdTenant]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdTenant]);
    });
  });

  describe('update', () => {
    it('should update a tenant and return the updated tenant', async () => {
      const updateDto = {
        name: 'Updated Tenant',
        phone: '0912345678',
      };

      const updatedTenant = testDataFactory.tenant({
        id: 1,
        name: updateDto.name,
        phone: updateDto.phone,
      });

      mockUpdateQuery(mockDb, [updatedTenant]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTenant);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      mockUpdateQuery(mockDb, []);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        phone: '0999999999',
      };

      const updatedTenant = testDataFactory.tenant({
        id: 1,
        phone: updateDto.phone,
      });

      mockUpdateQuery(mockDb, [updatedTenant]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTenant);
    });
  });

  describe('remove', () => {
    it('should delete a tenant and return the deleted tenant', async () => {
      const deletedTenant = testDataFactory.tenant({ id: 1 });

      mockDeleteQuery(mockDb, [deletedTenant]);

      const result = await service.remove(1);

      expect(result).toEqual(deletedTenant);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent tenant', async () => {
      mockDeleteQuery(mockDb, []);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Tenant with ID 999 not found',
      );
    });
  });
});

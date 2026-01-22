/* eslint-disable @typescript-eslint/no-floating-promises */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BillsService } from './bills.service';
import { DATABASE_CONNECTION } from '../../db/database.module';
import {
  createMockDatabase,
  mockSelectQuery,
  mockInsertQuery,
  mockUpdateQuery,
  testDataFactory,
} from '../../test/test-utils';

describe('BillsService', () => {
  let service: BillsService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(async () => {
    mockDb = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of bills with joined unit data', async () => {
      const mockBills = [
        {
          bill: testDataFactory.monthlyBill({ id: 1 }),
          unit: testDataFactory.unit({ id: 1 }),
        },
        {
          bill: testDataFactory.monthlyBill({ id: 2 }),
          unit: testDataFactory.unit({ id: 2 }),
        },
      ];

      mockSelectQuery(mockDb, mockBills);

      const result = await service.findAll();

      expect(result).toEqual(mockBills);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return an empty array when no bills exist', async () => {
      mockSelectQuery(mockDb, []);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a bill with unit and items when it exists', async () => {
      const mockBillResult = {
        bill: testDataFactory.monthlyBill({ id: 1 }),
        unit: testDataFactory.unit({ id: 1 }),
      };
      const mockItems = [
        testDataFactory.billItem({ id: 1, bill_id: 1, type: 'ELECTRIC' }),
        testDataFactory.billItem({ id: 2, bill_id: 1, type: 'WATER' }),
      ];

      // First call for bill query
      mockSelectQuery(mockDb, [mockBillResult]);

      // We need to handle multiple select calls
      let callCount = 0;
      (mockDb.select as jest.Mock).mockImplementation(() => {
        callCount++;
        const result = callCount === 1 ? [mockBillResult] : mockItems;
        const promise = Promise.resolve(result);
        const chain = {
          from: jest.fn().mockReturnValue(promise),
          where: jest.fn().mockReturnValue(promise),
          leftJoin: jest.fn().mockReturnValue(promise),
        };
        Object.assign(promise, chain);
        chain.from = jest.fn().mockReturnValue(promise);
        return promise;
      });

      const result = await service.findOne(1);

      expect(result).toHaveProperty('bill');
      expect(result).toHaveProperty('unit');
      expect(result).toHaveProperty('items');
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      mockSelectQuery(mockDb, []);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Bill with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new bill and return it', async () => {
      const createDto = {
        unitId: 1,
        month: 1,
        year: 2024,
        electricStart: 100,
        electricEnd: 200,
        electricRate: 3500,
        waterUsage: 10,
        waterRate: 25000,
        totalAmount: 5600000,
        paidAmount: 0,
        status: 'unpaid' as const,
        note: 'Test bill',
      };

      const createdBill = testDataFactory.monthlyBill({
        id: 3,
        unit_id: createDto.unitId,
        month: createDto.month,
        year: createDto.year,
        electric_start: createDto.electricStart,
        electric_end: createDto.electricEnd,
        electric_rate: createDto.electricRate.toString(),
        water_usage: createDto.waterUsage,
        water_rate: createDto.waterRate.toString(),
        total_amount: createDto.totalAmount.toString(),
        paid_amount: createDto.paidAmount.toString(),
        status: createDto.status,
        note: createDto.note,
      });

      mockInsertQuery(mockDb, [createdBill]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdBill]);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create a bill with minimal required fields', async () => {
      const createDto = {
        unitId: 1,
        month: 2,
        year: 2024,
        totalAmount: 3000000,
      };

      const createdBill = testDataFactory.monthlyBill({
        id: 4,
        unit_id: createDto.unitId,
        month: createDto.month,
        year: createDto.year,
        total_amount: createDto.totalAmount.toString(),
      });

      mockInsertQuery(mockDb, [createdBill]);

      const result = await service.create(createDto);

      expect(result).toEqual([createdBill]);
    });
  });

  describe('update', () => {
    it('should update a bill and return the updated bill', async () => {
      const updateDto = {
        paidAmount: 3000000,
        status: 'partial' as const,
      };

      const updatedBill = testDataFactory.monthlyBill({
        id: 1,
        paid_amount: updateDto.paidAmount.toString(),
        status: updateDto.status,
      });

      mockUpdateQuery(mockDb, [updatedBill]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedBill);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent bill', async () => {
      mockUpdateQuery(mockDb, []);

      await expect(service.update(999, { status: 'paid' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        note: 'Updated note',
      };

      const updatedBill = testDataFactory.monthlyBill({
        id: 1,
        note: updateDto.note,
      });

      mockUpdateQuery(mockDb, [updatedBill]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedBill);
    });
  });

  describe('findBillItems', () => {
    it('should return bill items when bill exists', async () => {
      const mockBill = testDataFactory.monthlyBill({ id: 1 });
      const mockItems = [
        testDataFactory.billItem({ id: 1, bill_id: 1, type: 'ELECTRIC' }),
        testDataFactory.billItem({ id: 2, bill_id: 1, type: 'WATER' }),
      ];

      let callCount = 0;
      (mockDb.select as jest.Mock).mockImplementation(() => {
        callCount++;
        const result = callCount === 1 ? [mockBill] : mockItems;
        const promise = Promise.resolve(result);
        const chain = {
          from: jest.fn().mockReturnValue(promise),
          where: jest.fn().mockReturnValue(promise),
        };
        Object.assign(promise, chain);
        chain.from = jest.fn().mockReturnValue(promise);
        return promise;
      });

      const result = await service.findBillItems(1);

      expect(result).toEqual(mockItems);
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      mockSelectQuery(mockDb, []);

      await expect(service.findBillItems(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBillItems(999)).rejects.toThrow(
        'Bill with ID 999 not found',
      );
    });
  });

  describe('createBillItem', () => {
    it('should create a bill item when bill exists', async () => {
      const mockBill = testDataFactory.monthlyBill({ id: 1 });
      const createDto = {
        type: 'PARKING',
        description: 'Parking fee',
        amount: 100000,
      };

      const createdItem = testDataFactory.billItem({
        id: 3,
        bill_id: 1,
        type: createDto.type,
        description: createDto.description,
        amount: createDto.amount.toString(),
      });

      // First select for checking bill exists
      (mockDb.select as jest.Mock).mockImplementation(() => {
        const promise = Promise.resolve([mockBill]);
        const chain = {
          from: jest.fn().mockReturnValue(promise),
          where: jest.fn().mockReturnValue(promise),
        };
        Object.assign(promise, chain);
        chain.from = jest.fn().mockReturnValue(promise);
        return promise;
      });

      mockInsertQuery(mockDb, [createdItem]);

      const result = await service.createBillItem(1, createDto);

      expect(result).toEqual([createdItem]);
    });

    it('should throw NotFoundException when creating item for non-existent bill', async () => {
      mockSelectQuery(mockDb, []);

      await expect(
        service.createBillItem(999, {
          type: 'OTHER',
          description: 'Test',
          amount: 50000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

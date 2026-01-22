/**
 * Test utilities and mock helpers for unit tests
 */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

type DatabaseSchema = typeof schema;
type MockDatabase = NodePgDatabase<DatabaseSchema>;

/**
 * Creates a mock database object with chainable query builder methods.
 * Use jest.spyOn on the returned mock to set up specific return values.
 */
export function createMockDatabase(): MockDatabase {
  // Make the queryBuilder thenable (awaitable)
  const createChainablePromise = (defaultValue: unknown[] = []) => {
    const chain: Record<string, jest.Mock> = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockImplementation(() => {
        return Promise.resolve(defaultValue);
      }),
    };

    // Make the chain itself a promise
    const promise = Promise.resolve(defaultValue);
    Object.assign(promise, chain);

    // Update chain methods to return proper promises
    chain.from = jest.fn().mockImplementation(() => {
      const subChain = { ...chain };
      const subPromise = Promise.resolve(defaultValue);
      Object.assign(subPromise, subChain);
      return subPromise;
    });

    return promise as unknown;
  };

  const mockDb = {
    select: jest.fn().mockImplementation(() => createChainablePromise()),
    insert: jest.fn().mockImplementation(() => createChainablePromise()),
    update: jest.fn().mockImplementation(() => createChainablePromise()),
    delete: jest.fn().mockImplementation(() => createChainablePromise()),
    query: {},
  } as unknown as MockDatabase;

  return mockDb;
}

/**
 * Helper to create a mock select query chain that resolves to the given data
 */
export function mockSelectQuery<T>(mockDb: MockDatabase, data: T[]): jest.Mock {
  const chain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
  };

  // Make the chain awaitable
  const promise = Promise.resolve(data);
  Object.assign(promise, chain);

  // Update chain methods to return the same awaitable chain
  chain.from = jest.fn().mockReturnValue(promise);
  chain.where = jest.fn().mockReturnValue(promise);
  chain.leftJoin = jest.fn().mockReturnValue(promise);

  const selectMock = jest.fn().mockReturnValue(promise);
  (mockDb.select as jest.Mock) = selectMock;

  return selectMock;
}

/**
 * Helper to create a mock insert query chain that resolves to the given data
 */
export function mockInsertQuery<T>(mockDb: MockDatabase, data: T[]): jest.Mock {
  // Create the chain with values returning something that has returning
  const valuesChain = {
    returning: jest.fn().mockResolvedValue(data),
  };

  const insertMock = jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue(valuesChain),
  });

  (mockDb.insert as jest.Mock) = insertMock;

  return insertMock;
}

/**
 * Helper to create a mock update query chain that resolves to the given data
 */
export function mockUpdateQuery<T>(mockDb: MockDatabase, data: T[]): jest.Mock {
  const returningMock = jest.fn().mockResolvedValue(data);
  const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
  const setMock = jest.fn().mockReturnValue({ where: whereMock });

  const updateMock = jest.fn().mockReturnValue({
    set: setMock,
  });

  (mockDb.update as jest.Mock) = updateMock;

  return updateMock;
}

/**
 * Helper to create a mock delete query chain that resolves to the given data
 */
export function mockDeleteQuery<T>(mockDb: MockDatabase, data: T[]): jest.Mock {
  const returningMock = jest.fn().mockResolvedValue(data);
  const whereMock = jest.fn().mockReturnValue({ returning: returningMock });

  const deleteMock = jest.fn().mockReturnValue({
    where: whereMock,
  });

  (mockDb.delete as jest.Mock) = deleteMock;

  return deleteMock;
}

/**
 * Sample data factories for testing
 */
export const testDataFactory = {
  property: (
    overrides: Partial<typeof schema.properties.$inferSelect> = {},
  ) => ({
    id: 1,
    code: 'K10',
    name: 'Test Property',
    address: '123 Test St',
    electric_id: 'ELEC001',
    water_id: 'WATER001',
    ...overrides,
  }),

  unit: (overrides: Partial<typeof schema.units.$inferSelect> = {}) => ({
    id: 1,
    property_id: 1,
    name: '101',
    floor: 1,
    base_price: '5000000',
    ...overrides,
  }),

  tenant: (overrides: Partial<typeof schema.tenants.$inferSelect> = {}) => ({
    id: 1,
    name: 'John Doe',
    phone: '0901234567',
    email: 'john@example.com',
    identity_card: '123456789',
    ...overrides,
  }),

  lease: (overrides: Partial<typeof schema.leases.$inferSelect> = {}) => ({
    id: 1,
    unit_id: 1,
    tenant_id: 1,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    deposit: '10000000',
    rent_price: '5000000',
    occupant_count: 2,
    active: true,
    ...overrides,
  }),

  monthlyBill: (
    overrides: Partial<typeof schema.monthlyBills.$inferSelect> = {},
  ) => ({
    id: 1,
    unit_id: 1,
    month: 1,
    year: 2024,
    electric_start: 100,
    electric_end: 200,
    electric_rate: '3500',
    water_usage: 10,
    water_rate: '25000',
    total_amount: '5600000',
    paid_amount: '0',
    status: 'unpaid',
    note: null,
    created_at: new Date('2024-01-15'),
    ...overrides,
  }),

  billItem: (
    overrides: Partial<typeof schema.billItems.$inferSelect> = {},
  ) => ({
    id: 1,
    bill_id: 1,
    type: 'ELECTRIC',
    description: 'Electric bill',
    amount: '350000',
    ...overrides,
  }),
};

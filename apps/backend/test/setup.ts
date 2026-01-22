/**
 * E2E Test Setup
 *
 * This file handles test database initialization for E2E tests.
 * It sets up a clean database state before tests run.
 */

import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import * as path from 'path';

type DatabaseSchema = typeof schema;

let pool: Pool | null = null;
let db: NodePgDatabase<DatabaseSchema> | null = null;
let isInitialized = false;

/**
 * Initialize test database connection (singleton)
 */
export async function setupTestDatabase(): Promise<NodePgDatabase<DatabaseSchema>> {
  if (isInitialized && db) {
    return db;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set for E2E tests',
    );
  }

  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });

  // Run migrations
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../drizzle'),
    });
  } catch (error) {
    // Migrations might already be applied, continue
    console.log('Migration note:', (error as Error).message);
  }

  isInitialized = true;
  return db;
}

/**
 * Get the database instance, initializing if needed
 */
export async function getTestDb(): Promise<NodePgDatabase<DatabaseSchema>> {
  if (!db) {
    return setupTestDatabase();
  }
  return db;
}

/**
 * Clean up all test data from tables
 */
export async function cleanupTestData(): Promise<void> {
  const database = await getTestDb();

  // Delete in reverse order of dependencies
  await database.delete(schema.billItems);
  await database.delete(schema.monthlyBills);
  await database.delete(schema.leases);
  await database.delete(schema.tenants);
  await database.delete(schema.units);
  await database.delete(schema.properties);
}

/**
 * Close database connection
 */
export async function teardownTestDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
    isInitialized = false;
  }
}

/**
 * Reset auto-increment sequences
 */
export async function resetSequences(): Promise<void> {
  const database = await getTestDb();

  const tables = [
    'properties',
    'units',
    'tenants',
    'leases',
    'monthly_bills',
    'bill_items',
  ];

  for (const table of tables) {
    try {
      await database.execute(
        sql.raw(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`),
      );
    } catch {
      // Sequence might not exist or have different name
    }
  }
}

// Auto-initialize when this file is loaded by Jest's setupFilesAfterEnv
// This ensures the database connection is ready before any tests run
beforeAll(async () => {
  await setupTestDatabase();
});

// Clean up the connection after all tests complete
afterAll(async () => {
  await teardownTestDatabase();
});

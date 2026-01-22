/**
 * E2E Test Setup
 *
 * This file handles test database initialization for E2E tests.
 * It sets up a clean database state before tests run.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import * as path from 'path';

let pool: Pool | null = null;

/**
 * Initialize test database connection
 */
export async function setupTestDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set for E2E tests',
    );
  }

  pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  // Run migrations
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../drizzle'),
    });
  } catch (error) {
    // Migrations might already be applied, continue
    console.log('Migration note:', (error as Error).message);
  }

  return db;
}

/**
 * Clean up all test data from tables
 */
export async function cleanupTestData() {
  if (!pool) return;

  const db = drizzle(pool, { schema });

  // Delete in reverse order of dependencies
  await db.delete(schema.billItems);
  await db.delete(schema.monthlyBills);
  await db.delete(schema.leases);
  await db.delete(schema.tenants);
  await db.delete(schema.units);
  await db.delete(schema.properties);
}

/**
 * Close database connection
 */
export async function teardownTestDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Reset auto-increment sequences
 */
export async function resetSequences() {
  if (!pool) return;

  const db = drizzle(pool, { schema });

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
      await db.execute(
        sql.raw(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`),
      );
    } catch {
      // Sequence might not exist or have different name
    }
  }
}

// Global setup for Jest
export default async function globalSetup() {
  await setupTestDatabase();
}

// Global teardown for Jest
export async function globalTeardown() {
  await teardownTestDatabase();
}

import {
  pgTable,
  serial,
  text,
  integer,
  date,
  boolean,
  decimal,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// --- BETTER AUTH TABLES ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// --- EXISTING APP TABLES ---

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g., K10, TD1
  name: text('name').notNull(),
  address: text('address'),
  electric_id: text('electric_id'),
  water_id: text('water_id'),
});

export const units = pgTable(
  'units',
  {
    id: serial('id').primaryKey(),
    property_id: integer('property_id')
      .references(() => properties.id)
      .notNull(),
    name: text('name').notNull(), // e.g., 101, T01
    floor: integer('floor'),
    base_price: decimal('base_price', { precision: 12, scale: 0 }), // VND
  },
  (t) => [uniqueIndex('unit_property_idx').on(t.property_id, t.name)],
);

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  identity_card: text('identity_card'),
});

export const leases = pgTable('leases', {
  id: serial('id').primaryKey(),
  unit_id: integer('unit_id')
    .references(() => units.id)
    .notNull(),
  tenant_id: integer('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  deposit: decimal('deposit', { precision: 12, scale: 0 }),
  rent_price: decimal('rent_price', { precision: 12, scale: 0 }),
  occupant_count: integer('occupant_count').default(1),
  active: boolean('active').default(true),
});

export const monthlyBills = pgTable(
  'monthly_bills',
  {
    id: serial('id').primaryKey(),
    unit_id: integer('unit_id')
      .references(() => units.id)
      .notNull(),
    month: integer('month').notNull(),
    year: integer('year').notNull(),

    electric_start: integer('electric_start'),
    electric_end: integer('electric_end'),
    electric_rate: decimal('electric_rate', { precision: 12, scale: 0 }),

    water_usage: integer('water_usage'), // Could be index or headcount
    water_rate: decimal('water_rate', { precision: 12, scale: 0 }),

    total_amount: decimal('total_amount', {
      precision: 12,
      scale: 0,
    }).notNull(),
    paid_amount: decimal('paid_amount', { precision: 12, scale: 0 }).default(
      '0',
    ),
    status: text('status').default('unpaid'), // unpaid, partial, paid
    note: text('note'),
    created_at: timestamp('created_at').defaultNow(),
  },
  (t) => [uniqueIndex('bill_unit_month_idx').on(t.unit_id, t.month, t.year)],
);

export const billItems = pgTable('bill_items', {
  id: serial('id').primaryKey(),
  bill_id: integer('bill_id')
    .references(() => monthlyBills.id)
    .notNull(),
  type: text('type').notNull(), // ELECTRIC, WATER, PARKING, WIFI, SERVICE, OTHER
  description: text('description'),
  amount: decimal('amount', { precision: 12, scale: 0 }).notNull(),
});

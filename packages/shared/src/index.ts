import { z } from "zod";
import {
  pgTable,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const APP_NAME = "Nestject App";

export interface HelloMessage {
  message: string;
  timestamp: number;
}

// --- BETTER AUTH TABLES (Drizzle Schema) ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// User Schema (Legacy)
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});
export type UserDto = z.infer<typeof userSchema>;

// --- Apartment Management Schemas ---

export const propertySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
});
export type PropertyDto = z.infer<typeof propertySchema>;

export const unitSchema = z.object({
  propertyId: z.number(),
  name: z.string().min(1),
  floor: z.number().optional(),
  basePrice: z.number().optional(),
});
export type UnitDto = z.infer<typeof unitSchema>;

export const tenantSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
});
export type TenantDto = z.infer<typeof tenantSchema>;

export const leaseSchema = z.object({
  unitId: z.number(),
  tenantId: z.number(),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  deposit: z.number().optional(),
  rentPrice: z.number().optional(),
  occupantCount: z.number().optional(),
  active: z.boolean().optional(),
});
export type LeaseDto = z.infer<typeof leaseSchema>;

export const billSchema = z.object({
  unitId: z.number(),
  month: z.number().min(1).max(12),
  year: z.number(),
  electricStart: z.number().optional(),
  electricEnd: z.number().optional(),
  electricRate: z.number().optional(),
  waterUsage: z.number().optional(),
  waterRate: z.number().optional(),
  totalAmount: z.number(),
  paidAmount: z.number().optional(),
  status: z.enum(["unpaid", "partial", "paid"]).optional(),
  note: z.string().optional(),
});
export type BillDto = z.infer<typeof billSchema>;

export const billItemSchema = z.object({
  type: z.enum(["ELECTRIC", "WATER", "PARKING", "WIFI", "SERVICE", "OTHER"]),
  description: z.string().optional(),
  amount: z.number(),
});
export type BillItemDto = z.infer<typeof billItemSchema>;

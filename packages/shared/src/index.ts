import { z } from "zod";

export const APP_NAME = "Nestject App";

export interface HelloMessage {
  message: string;
  timestamp: number;
}

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

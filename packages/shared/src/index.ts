import { z } from "zod";

export const APP_NAME = "Nestject App";

export interface HelloMessage {
  message: string;
  timestamp: number;
}

// Shared Zod Schema
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

// Infer Type from Schema
export type UserDto = z.infer<typeof userSchema>;

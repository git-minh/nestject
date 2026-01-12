# AGENTS.md

This file provides context and instructions for AI agents operating within this repository.

## 1. Project Structure

This repository is a **Turborepo** monorepo using **pnpm workspaces**:

- **apps/**
    - **frontend/** (`@nestject/frontend`): Next.js (v16+) application.
        - Stack: Tailwind CSS v4, Shadcn UI, TanStack Query, Orval, React Hook Form.
        - Port: `3000`.
    - **backend/** (`@nestject/backend`): NestJS (v11+) application.
        - Stack: NestJS Zod, Swagger, Pino Logger.
        - Port: `3001`.
- **packages/**
    - **shared/** (`@nestject/shared`): Shared TypeScript types, Zod schemas, and utilities.

**Package Manager:** `pnpm` is the required package manager.

---

## 2. Build, Lint, and Test Commands

### Root Commands (Turbo)
*   **Install Dependencies:** `pnpm install`
*   **Dev Mode (All Apps):** `pnpm dev` (Runs `turbo dev`)
*   **Build (All Apps):** `pnpm build` (Runs `turbo build`)
*   **Lint (All Apps):** `pnpm lint` (Runs `turbo lint`)
*   **Test (All Apps):** `pnpm test` (Runs `turbo test`)

### Targeted Commands (`pnpm --filter <pkg> <cmd>`)
*   **Frontend Dev:** `pnpm --filter @nestject/frontend dev`
*   **Backend Dev:** `pnpm --filter @nestject/backend start:dev`
*   **Frontend API Gen:** `pnpm --filter @nestject/frontend generate:api` (Run this after backend changes)

### Backend Testing (`apps/backend`)
*   **Run a Single Test File:**
    ```bash
    pnpm --filter @nestject/backend test -- src/app.controller.spec.ts
    ```
*   **Run a Specific Test Case:**
    ```bash
    pnpm --filter @nestject/backend test -- -t "should return"
    ```

---

## 3. Code Style & Conventions

### Shared Code (`packages/shared`)
*   **Zod Schemas:** Define Zod schemas here. Export the schema *and* the inferred type.
    ```typescript
    import { z } from "zod";
    export const userSchema = z.object({ ... });
    export type UserDto = z.infer<typeof userSchema>;
    ```
*   **Usage:** Import using `@nestject/shared`.

### Frontend (Next.js)
*   **Components:**
    *   Use **Shadcn UI** components from `@/components/ui`.
    *   Create new components using functional syntax and typed props.
*   **Data Fetching:**
    *   **Do not write manual fetch calls.**
    *   Use **Orval** generated hooks (`src/lib/api/generated.ts`).
    *   If the backend API changes, run `pnpm --filter @nestject/frontend generate:api`.
*   **Forms:**
    *   Use **React Hook Form** with `zodResolver`.
    *   Use the shared Zod schema for validation.
*   **Styling:** Tailwind CSS utility classes.

### Backend (NestJS)
*   **Validation:**
    *   Use `nestjs-zod`.
    *   Create DTOs using `createZodDto` from the shared Zod schema.
    ```typescript
    import { createZodDto } from 'nestjs-zod';
    import { userSchema } from '@nestject/shared';
    export class CreateUserDto extends createZodDto(userSchema) {}
    ```
*   **Documentation:** Swagger is auto-generated. Ensure DTOs are used in controllers so Swagger picks them up.
*   **Logging:** Use `nestjs-pino` (`Logger` from `nestjs-pino`, not `@nestjs/common`).

---

## 4. Error Handling

*   **Frontend:** Use Error Boundaries. Handle API errors in TanStack Query `onError` callbacks or global query cache settings.
*   **Backend:** Use standard NestJS HTTP Exceptions (e.g., `NotFoundException`). `ZodValidationPipe` handles validation errors automatically.

## 5. Development Workflow

1.  **Define Type:** Add Zod schema to `@nestject/shared`.
2.  **Backend:** Create Controller/Service using the Zod DTO.
3.  **Generate:** Run `pnpm --filter @nestject/frontend generate:api` (requires backend running).
4.  **Frontend:** Import the generated hook (e.g., `useCreateUser`) and build the UI.

# AGENTS.md

This file provides context and instructions for AI agents operating within this repository.

## 1. Project Structure

This repository is a **Turborepo** monorepo using **pnpm workspaces**:

- **apps/**
    - **frontend/** (`@nestject/frontend`): Next.js (v16+) application.
        - **Stack:** React 19, Tailwind CSS v4, Shadcn UI, TanStack Query v5.
        - **API:** Orval generated hooks (uses `fetch` under the hood).
        - **Port:** `3000`.
    - **backend/** (`@nestject/backend`): NestJS (v11+) application.
        - **Stack:** Fastify (or Express), NestJS Zod, Swagger, Pino Logger.
        - **Database:** PostgreSQL (Neon) via **Drizzle ORM**.
        - **Port:** `3001`.
- **packages/**
    - **shared/** (`@nestject/shared`): Shared TypeScript types, Zod schemas, and constants.

**Package Manager:** `pnpm` is the REQUIRED package manager. Never use `npm` or `yarn`.

---

## 2. Key Commands

### Root Workspace
*   **Dev (All):** `pnpm dev` (Runs frontend + backend in parallel).
*   **Build (All):** `pnpm build`.
*   **Lint (All):** `pnpm lint`.
*   **Test (All):** `pnpm test`.

### Backend (`apps/backend`)
*   **Start Dev:** `pnpm --filter @nestject/backend start:dev`
*   **Database Migrations:**
    *   *Generate:* `pnpm --filter @nestject/backend db:generate` (After changing `schema.ts`)
    *   *Migrate:* `pnpm --filter @nestject/backend db:migrate` (Apply to DB)
*   **Testing:**
    *   *Run All:* `pnpm --filter @nestject/backend test`
    *   *Single File:* `pnpm --filter @nestject/backend test -- src/modules/users/users.service.spec.ts`
    *   *Specific Case:* `pnpm --filter @nestject/backend test -- -t "should create a user"`

### Frontend (`apps/frontend`)
*   **Start Dev:** `pnpm --filter @nestject/frontend dev`
*   **Generate API Client:** `pnpm --filter @nestject/frontend generate:api`
    *   *Trigger:* Run this AFTER updating the Backend API/Swagger. Backend must be running.

---

## 3. Code Style & Conventions

### Shared Library (`@nestject/shared`)
*   **Single Source of Truth:** Define Zod schemas here first. Export both the Schema and the inferred Type.
    ```typescript
    import { z } from "zod";
    export const userSchema = z.object({ name: z.string() });
    export type UserDto = z.infer<typeof userSchema>;
    ```

### Backend (NestJS)
*   **Architecture:** Modular (Controller -> Service -> Database).
*   **Validation:** Use `nestjs-zod`. Create DTOs by extending the shared schema:
    ```typescript
    class CreateUserDto extends createZodDto(userSchema) {}
    ```
*   **Database (Drizzle):**
    *   Define tables in `src/db/schema.ts`.
    *   Inject `DATABASE_CONNECTION` to access the `db` instance.
    *   Use explicit types for queries.
*   **Logging:** Use `nestjs-pino`. Inject `Logger` from `nestjs-pino`.

### Frontend (Next.js)
*   **Data Fetching:** **NEVER** write manual `fetch` or `axios` calls.
    *   Use **Orval** generated hooks from `@/lib/api`.
    *   Example: `const { data, isLoading } = usePropertiesControllerFindAll();`
*   **UI Components:** Use **Shadcn UI** from `@/components/ui`.
    *   Add new components via CLI: `pnpm dlx shadcn@latest add [component]`.
*   **Forms:** Use `react-hook-form` + `zodResolver` + Shared Zod Schema.
*   **Styling:** Tailwind CSS utility classes. Avoid arbitrary values (`w-[123px]`); use theme tokens.

---

## 4. Development Workflow (The "Feature Dev" Cycle)

Follow this strict order when implementing features involving full-stack data flow:

1.  **Shared:** Update `@nestject/shared` with new Zod Schemas/Types.
2.  **Backend DB:** Update `schema.ts`, run `db:generate` & `db:migrate`.
3.  **Backend API:** Implement Controller/Service using the Shared DTOs.
4.  **Codegen:** Run `pnpm --filter @nestject/frontend generate:api` (ensure backend is running).
5.  **Frontend:** Build UI using the new generated React Query hooks.

---

## 5. Error Handling & Quality

*   **Backend:** Throw standard NestJS `HttpException` (e.g., `NotFoundException`). Let the global filter handle the response structure.
*   **Frontend:** Handle `isError` and `error` states from React Query hooks. Use Error Boundaries for critical crashes.
*   **Commits:** Use conventional commits (feat, fix, docs, chore).

## 6. Feature Development Agents

When asked to build a complex feature, adopt the **7-Phase Workflow** detailed in `docs/FEATURE_DEV.md`.

*   **Code Explorer:** Analyze existing patterns first.
*   **Code Architect:** Design the Schema -> API -> UI flow.
*   **Code Reviewer:** Verify compliance with this file.

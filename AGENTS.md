# AGENTS.md

This file contains instructions and context for AI agents (like Cursor, Copilot, etc.) working in this repository.
**Read this file fully before making any changes.**

## 1. Project Overview

This is a **Turborepo** monorepo using **pnpm workspaces**.

- **Root:** Configuration, shared tasks.
- **apps/frontend (`@nestject/frontend`):** Next.js 16+ (App Router), React 19, Tailwind CSS v4, Shadcn UI.
- **apps/backend (`@nestject/backend`):** NestJS 11+, Fastify/Express, PostgreSQL (Drizzle ORM).
- **packages/shared (`@nestject/shared`):** Zod schemas, TypeScript types, constants.

**Package Manager:** `pnpm` (REQUIRED). Do not use `npm` or `yarn`.

---

## 2. Key Commands & Operations

### Global (Root)

- `pnpm dev`: Start both frontend (3000) and backend (3001) in parallel.
- `pnpm build`: Build all apps/packages.
- `pnpm lint`: Lint all apps/packages.
- `pnpm test`: Run tests across the workspace.

### Backend (`apps/backend`)

- **Start:** `pnpm --filter @nestject/backend start:dev`
- **Database Migrations:**
  1.  Modify `src/db/schema.ts`.
  2.  Generate: `pnpm --filter @nestject/backend db:generate`
  3.  Migrate: `pnpm --filter @nestject/backend db:migrate`
- **Testing (Jest):**
  - _Run All:_ `pnpm --filter @nestject/backend test`
  - _Single File:_ `pnpm --filter @nestject/backend test -- src/modules/users/users.service.spec.ts`
  - _Specific Test Case:_ `pnpm --filter @nestject/backend test -- -t "should create a user"`
  - _Watch Mode:_ `pnpm --filter @nestject/backend test:watch`

### Frontend (`apps/frontend`)

- **Start:** `pnpm --filter @nestject/frontend dev`
- **API Client Generation (Orval):**
  - _Command:_ `pnpm --filter @nestject/frontend generate:api`
  - _Prerequisite:_ Backend must be running (Swagger JSON must be accessible).
  - _Trigger:_ Run this **immediately** after backend API changes.

---

## 3. Code Style & Guidelines

### General

- **Formatting:** Prettier is enforced. Run `pnpm format` if unsure.
- **Imports:** Use absolute imports with `@/` aliases where configured.
  - Backend: `import ... from '@/modules/...'` (if aliased) or relative if standard NestJS.
  - Frontend: `import ... from "@/components/..."`.
- **Types:** Strict TypeScript. No `any`. Use Zod schemas for runtime validation.

### Shared Library (`packages/shared`)

- **Single Source of Truth:** Define data structures here first.
- **Pattern:** Export Zod schema + inferred Type.
  ```typescript
  import { z } from "zod";
  export const userSchema = z.object({ id: z.string(), name: z.string() });
  export type UserDto = z.infer<typeof userSchema>;
  ```

### Backend (NestJS)

- **Validation:** Use `nestjs-zod` to create DTOs from shared schemas.
  ```typescript
  class CreateUserDto extends createZodDto(userSchema.omit({ id: true })) {}
  ```
- **Database:** Use **Drizzle ORM**.
  - Inject `DATABASE_CONNECTION`.
  - Do NOT use Repository pattern layers unless complex logic requires it. Use `this.db.select()...` directly in Services.
  - Always use `returning()` for INSERT/UPDATE operations.
- **Error Handling:** Throw standard `HttpException` (e.g., `NotFoundException`, `BadRequestException`). Global filters handle the rest.
- **Logging:** Use `nestjs-pino`.

### Frontend (Next.js)

- **Data Fetching:**
  - **STRICTLY FORBIDDEN:** Manual `fetch` or `axios` calls in components.
  - **REQUIRED:** Use **Orval** generated hooks (`@/lib/api/...`).
  - Example: `const { data, isLoading } = usePropertiesControllerFindAll();`
- **Components:**
  - Use **Shadcn UI** (`@/components/ui`) for base elements.
  - New components: `pnpm dlx shadcn@latest add [component-name]`.
  - "Container/Presentation" pattern is optional but keep logic out of pure UI components.
- **Styling:**
  - Tailwind CSS v4.
  - Avoid arbitrary values (e.g., `w-[350px]`). Use theme spacing/colors.
  - Use `cn()` utility for class merging.

---

## 4. Feature Development Workflow

Follow this **strict sequence** to prevent drift between Frontend and Backend:

1.  **Shared:** Update/Create Zod Schemas in `@nestject/shared`.
2.  **Backend DB:** Update `schema.ts`, generate migrations, apply migrations.
3.  **Backend API:** Implement Controller/Service using the Shared DTOs.
4.  **Codegen:** Run `pnpm --filter @nestject/frontend generate:api` (Backend must be running).
5.  **Frontend:** Implement UI using the _newly generated_ hooks.

---

## 5. Agent Behavior & Rules

- **Plan First:** Before writing code, analyze the file structure and dependencies.
- **Safety:** Never commit secrets. verify `env` files are ignored.
- **Context:** When editing a file, read the surrounding code to match the style (e.g., check how other Controllers are implemented before adding a new one).
- **Tests:**
  - If fixing a bug, write a test case that reproduces it first (TDD).
  - If adding a feature, add corresponding unit tests (Backend) or verify via build (Frontend).
- **Refactoring:** Do not refactor unrelated code unless explicitly asked.
- **Dependencies:** Check `package.json` before importing new libraries. If a library is missing, ask for permission to install it.

## 6. Testing Specifics

- **Backend Unit Tests:** Located alongside source files (`*.spec.ts`).
- **Mocking:** Use `jest.spyOn` or `@golevelup/ts-jest` (if available) for mocking dependencies.
- **Frontend Tests:** Currently relied on Linting/Build. Ensure `pnpm lint` and `pnpm build` pass before finishing.

---

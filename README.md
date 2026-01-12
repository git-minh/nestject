# Nestject Monorepo

A production-ready fullstack monorepo featuring **Next.js 16**, **NestJS 11**, and **Turborepo**.

## 🚀 Tech Stack

### Monorepo & Tooling
- **Turborepo**: High-performance build system.
- **pnpm**: Fast, disk-efficient package manager (Workspaces enabled).
- **TypeScript**: End-to-end type safety.

### Frontend (`@nestject/frontend`)
- **Framework**: Next.js 16 (App Router).
- **Language**: React 19.
- **Styling**: Tailwind CSS v4, Shadcn UI, Lucide React.
- **State/Fetching**: TanStack Query v5.
- **Forms**: React Hook Form + Zod.
- **API Client**: Orval (Auto-generated hooks from Backend Swagger).

### Backend (`@nestject/backend`)
- **Framework**: NestJS 11.
- **Database**: PostgreSQL (Neon Tech) via **Drizzle ORM**.
- **Validation**: `nestjs-zod` (Global Pipes).
- **Documentation**: Swagger (OpenAPI).
- **Logging**: Pino (High performance JSON logger).

### Shared (`@nestject/shared`)
- Shared TypeScript Interfaces & DTOs.
- Shared Zod Schemas (Single source of truth for validation).

---

## 📂 Project Structure

```text
.
├── apps/
│   ├── frontend/          # Next.js Application
│   └── backend/           # NestJS Application
├── packages/
│   └── shared/            # Shared types/schemas
├── package.json           # Root scripts
├── pnpm-workspace.yaml    # Workspace config
└── turbo.json             # Build pipeline config
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- pnpm (`npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
The backend requires a PostgreSQL connection string (Neon DB).

Create `apps/backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 4. Database Migration
Push the schema to your Neon database:
```bash
# Generate SQL migrations
pnpm --filter @nestject/backend db:generate

# Apply migrations to DB
pnpm --filter @nestject/backend db:migrate
```

### 5. Run Development Server
Start both Frontend (3000) and Backend (3001) simultaneously:
```bash
pnpm dev
```

---

## 🔄 Development Workflow

### Adding a New Feature
1.  **Shared:** Define the Zod Schema in `packages/shared`.
2.  **Backend:** Create the Controller/Service using `nestjs-zod` DTOs.
3.  **Generate Client:** Update the frontend API hooks based on the new Backend Swagger.
    ```bash
    pnpm --filter @nestject/frontend generate:api
    ```
4.  **Frontend:** Build the UI using the generated hooks (e.g., `useCreateUser`).

### Useful Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start all apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm dev:frontend` | Start only frontend |
| `pnpm dev:backend` | Start only backend |
| `pnpm gen:api` | Generate Frontend API Client from Backend |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply Drizzle migrations |

---

## 📝 License
Private Repository.

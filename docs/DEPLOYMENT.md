# Deployment Guide

This guide covers deploying the Nestject monorepo to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │    Backend      │         Database            │
│   (Vercel)      │  (Railway)      │         (Neon)              │
│   Next.js 16    │   NestJS 11     │      PostgreSQL 16          │
│   Auto-deploy   │   Docker        │      Serverless             │
└────────┬────────┴────────┬────────┴─────────────┬───────────────┘
         │                 │                      │
         └─────────────────┴──────────────────────┘
```

## Prerequisites

- [Neon](https://neon.tech) account (database)
- [Vercel](https://vercel.com) account (frontend)
- [Railway](https://railway.app) or [Fly.io](https://fly.io) account (backend)
- [Docker Hub](https://hub.docker.com) account (container registry)
- [CircleCI](https://circleci.com) account (CI/CD)

---

## 1. Database Setup (Neon)

### Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **New Project**
3. Choose a name and region (closest to your users)
4. Copy the connection string

### Connection String Format

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### Run Migrations

```bash
# Set the production database URL
export DATABASE_URL="postgresql://..."

# Run migrations
pnpm --filter @nestject/backend db:migrate
```

---

## 2. Frontend Deployment (Vercel)

### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `cd ../.. && pnpm build --filter @nestject/frontend`
   - **Output Directory**: `.next`

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | Production |
| `DATABASE_URL` | `postgresql://...` | Production |
| `BETTER_AUTH_SECRET` | `your-secret-key` | Production |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | Production |

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from apps/frontend directory)
cd apps/frontend
vercel --prod
```

### Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## 3. Backend Deployment

### Option A: Railway (Recommended)

#### Setup Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `/` (monorepo root)
   - **Dockerfile Path**: `apps/backend/Dockerfile`

#### Environment Variables

Add in Railway Dashboard → Variables:

```env
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3001
```

#### Railway CLI Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

### Option B: Fly.io

#### Create fly.toml

Create `apps/backend/fly.toml`:

```toml
app = "nestject-backend"
primary_region = "sin"  # Singapore, change as needed

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

#### Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (first time)
cd apps/backend
fly launch

# Deploy (subsequent)
fly deploy
```

#### Set Secrets

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set CORS_ORIGIN="https://your-frontend.vercel.app"
```

---

## 4. CI/CD with CircleCI

### Configure CircleCI Contexts

Create two contexts in CircleCI (Organization Settings → Contexts):

#### Context: `docker-hub`
| Variable | Description |
|----------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |

#### Context: `production`
| Variable | Description |
|----------|-------------|
| `PRODUCTION_DATABASE_URL` | Neon production connection string |
| `RAILWAY_TOKEN` | Railway API token |
| `FLY_API_TOKEN` | Fly.io API token (if using Fly) |

### Get API Tokens

**Railway Token:**
1. Railway Dashboard → Account Settings → Tokens
2. Create new token

**Fly.io Token:**
```bash
fly auth token
```

### Workflow

The CI/CD pipeline:

```
master branch push
       │
       ▼
   ┌───────┐
   │ Build │ ← Build Docker image
   └───┬───┘
       │
       ▼
   ┌────────┐
   │  Push  │ ← Push to Docker Hub
   └───┬────┘
       │
       ▼
   ┌──────────┐
   │ Migrate  │ ← Run database migrations
   └────┬─────┘
       │
       ▼
   ┌────────┐
   │ Deploy │ ← Deploy to Railway/Fly
   └────────┘
```

---

## 5. Manual Deployment

### Build Docker Image

```bash
# From monorepo root
docker build -f apps/backend/Dockerfile -t nestject-backend .
```

### Run Locally

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e CORS_ORIGIN="http://localhost:3000" \
  nestject-backend
```

### Push to Registry

```bash
# Tag for Docker Hub
docker tag nestject-backend:latest your-username/nestject-backend:latest

# Push
docker push your-username/nestject-backend:latest
```

---

## 6. Environment Variables Reference

### Backend

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `PORT` | ❌ | Server port (default: 3001) | `3001` |
| `NODE_ENV` | ❌ | Environment | `production` |
| `CORS_ORIGIN` | ✅ | Allowed CORS origins (comma-separated) | `https://app.example.com` |

### Frontend

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL | `https://api.example.com` |
| `DATABASE_URL` | ✅ | For Better Auth | `postgresql://...` |
| `BETTER_AUTH_SECRET` | ✅ | Auth secret key | `random-secret` |
| `BETTER_AUTH_URL` | ✅ | Frontend URL | `https://app.example.com` |

---

## 7. Monitoring & Logs

### Railway
```bash
railway logs
```

### Fly.io
```bash
fly logs
```

### Vercel
View logs in Vercel Dashboard → Your Project → Deployments → Functions

---

## 8. Rollback

### Railway
```bash
railway rollback
```

### Fly.io
```bash
fly releases list
fly deploy --image registry.fly.io/nestject-backend:v123
```

### Vercel
Use the Vercel Dashboard to instantly rollback to a previous deployment.

---

## Troubleshooting

### Database Connection Issues

1. Check if IP is whitelisted in Neon
2. Verify SSL mode is enabled (`?sslmode=require`)
3. Check connection string format

### CORS Errors

1. Verify `CORS_ORIGIN` includes the frontend URL
2. Check for trailing slashes
3. Ensure protocol matches (https vs http)

### Build Failures

1. Check Docker build logs
2. Verify all dependencies are in `package.json`
3. Ensure pnpm-lock.yaml is committed

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong `BETTER_AUTH_SECRET`
- [ ] Enable Neon's connection pooling
- [ ] Set up rate limiting
- [ ] Configure proper CORS origins
- [ ] Use environment-specific database credentials
- [ ] Enable logging and monitoring

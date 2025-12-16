# Database Setup Instructions

This guide will help you set up PostgreSQL for local development.

## Option 1: Use PostgreSQL Locally (Recommended for Development)

### Windows - Using PostgreSQL Installer

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download latest stable version
   - Run the installer

2. **During Installation**
   - Set password for `postgres` user (remember this!)
   - Port: 5432 (default)
   - Keep all defaults

3. **Create Database**
   ```bash
   # After installation, open Command Prompt and run:
   createdb -U postgres merchant_onboarding
   ```

4. **Get Connection String**
   ```
   postgresql://postgres:your_password@localhost:5432/merchant_onboarding
   ```

5. **Add to .env.local**
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/merchant_onboarding"
   ```

### Windows - Using Docker (Alternative)

```bash
# If you have Docker installed:
docker run --name postgres-merchant -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=merchant_onboarding -p 5432:5432 -d postgres:latest

# Connection string:
# postgresql://postgres:postgres@localhost:5432/merchant_onboarding
```

## Option 2: Use Free Cloud Services (Production-Ready)

### Vercel Postgres (Recommended)
- Go to: https://vercel.com/docs/storage/vercel-postgres/quickstart
- Follow setup steps
- Copy the connection string to `.env.local`

### Neon (Free Tier Available)
- Go to: https://neon.tech/
- Create free account
- Create new project
- Copy connection string

### Railway (Free Tier)
- Go to: https://railway.app/
- Create PostgreSQL service
- Copy connection string

## Verify Connection

```bash
# After setting DATABASE_URL, test with:
pnpm prisma db push

# Or open Prisma Studio:
pnpm prisma studio
```

## If Connection Fails

**Error: "Connection refused"**
- Make sure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify port 5432 is available

**Error: "SSL error"**
- Add `?sslmode=require` to cloud database URLs
- Example: `postgresql://...?sslmode=require`

**Error: "Auth failed"**
- Check username/password in connection string
- For local: default user is `postgres`

## Quick Test Commands

```bash
# Verify Prisma setup
pnpm prisma generate

# Apply migrations
pnpm prisma migrate dev --name init

# Open database UI
pnpm prisma studio

# Reset database (development only)
pnpm prisma migrate reset
```

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]

Examples:
- Local: postgresql://postgres:password@localhost:5432/merchant_onboarding
- Cloud: postgresql://user:pass@host.postgres.vercel-storage.com/db?sslmode=require
```

---

**Status**: Ready to set up. Follow your chosen option above!

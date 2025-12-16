# PostgreSQL Setup for Vercel - Choose One Option

## Option 1: Vercel Postgres (EASIEST - Recommended)
1. Go to: https://vercel.com/dashboard
2. Select your project: `b2zi-merchant`
3. Go to **"Storage"** tab
4. Click **"Create Database"** → **"Postgres"**
5. Click **"Create"**
6. Copy the `POSTGRES_PRISMA_URL` from the connection string
7. Go to **Settings** → **Environment Variables**
8. Add: `DATABASE_URL` = (paste the URL)
9. Redeploy

---

## Option 2: Neon (FREE, Easy)
1. Go to: https://neon.tech/
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string (looks like: `postgresql://...`)
5. Go to your Vercel project
6. **Settings** → **Environment Variables**
7. Add: `DATABASE_URL` = (paste the URL)
8. Redeploy

---

## Option 3: Railway (FREE for 5 days, then paid)
1. Go to: https://railway.app/
2. Sign up with GitHub
3. Create new project → PostgreSQL
4. Copy the connection URL
5. Go to your Vercel project
6. **Settings** → **Environment Variables**
7. Add: `DATABASE_URL` = (paste the URL)
8. Redeploy

---

## After Setting DATABASE_URL:

Run these commands locally to set up the database:

```bash
cd C:\Users\user\Downloads\merchant-onboarding-redesign

# Set the DATABASE_URL temporarily
set DATABASE_URL=your_postgresql_url_here

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or create tables from schema
npx prisma db push
```

Then push to GitHub and Vercel will redeploy with the database connected!

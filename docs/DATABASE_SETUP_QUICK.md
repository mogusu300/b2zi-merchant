# Database Setup Guide - Choose Your Provider

**Current Status**: PostgreSQL not running locally. Let's set up a cloud database instead (faster & easier).

## 🚀 Quick Setup Options

### Option 1: Neon PostgreSQL (⭐ Recommended - Free)

**Why Neon?**
- Free tier with 3 projects
- Generous free credits
- Easy one-click setup
- Auto-scales
- Great for development

**Steps:**

1. **Sign up at Neon**
   - Go to https://neon.tech
   - Click "Sign Up"
   - Use your email or GitHub
   - Create a new project

2. **Get Connection String**
   - In Neon dashboard, go to your project
   - Click "Connection" tab
   - Copy the "Connection string" (looks like: `postgresql://user:password@host/dbname?sslmode=require`)
   - **Important**: Make sure `sslmode=require` is at the end

3. **Update .env.local**
   ```bash
   # Edit .env.local and replace this line:
   DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxxxxxxxxxxxxxxxx@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require"
   # With your actual connection string from Neon
   ```

4. **Run Migration**
   ```bash
   npx prisma db push --accept-data-loss
   ```

5. **View Database**
   ```bash
   npx prisma studio
   # Opens at http://localhost:5555
   ```

---

### Option 2: Vercel Postgres (If using Vercel)

**Why Vercel Postgres?**
- Integrated with Vercel hosting
- Automatic backup
- Zero-config if deploying on Vercel

**Steps:**

1. **Create Vercel Account** (if you don't have one)
   - Go to https://vercel.com
   - Sign up

2. **Create Postgres Database**
   - Go to Vercel dashboard
   - Create new project or open existing
   - Go to "Storage" → "Create Database" → "Postgres"

3. **Get Connection String**
   - Copy the `.env.local` snippet
   - Should show `POSTGRES_URL=`

4. **Update .env.local**
   ```bash
   # Use the POSTGRES_URL or create DATABASE_URL from the connection info
   DATABASE_URL="postgresql://user:password@host.postgres.vercel-storage.com/dbname?sslmode=require"
   ```

5. **Run Migration**
   ```bash
   npx prisma db push --accept-data-loss
   ```

---

### Option 3: Local PostgreSQL (Advanced)

**Why Local?**
- No internet connection needed
- Fully offline
- Best for learning

**Requirements:**
- PostgreSQL installed on your machine
- Database server running

**Steps:**

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/
   - Follow installer (remember password!)

2. **Create Database**
   ```bash
   # Open PostgreSQL command line or use pgAdmin
   createdb merchant_onboarding
   ```

3. **Update .env.local**
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/merchant_onboarding"
   ```

4. **Run Migration**
   ```bash
   npx prisma db push --accept-data-loss
   ```

---

### Option 4: Railway.app (Quick Deploy)

**Why Railway?**
- Very easy setup
- Good free tier
- Integrates with GitHub

**Steps:**

1. **Sign up at Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create PostgreSQL**
   - Click "New Project"
   - Add "Provision PostgreSQL"
   - Wait for setup

3. **Get Connection String**
   - Click on the Postgres service
   - Copy the "Database URL"

4. **Update .env.local**
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/dbname"
   ```

5. **Run Migration**
   ```bash
   npx prisma db push --accept-data-loss
   ```

---

## ✅ Verify Setup

Once you've updated `.env.local`, test the connection:

```bash
# 1. Test connection with Prisma
npx prisma db push --accept-data-loss

# 2. View database UI
npx prisma studio

# 3. The dev server should now work
pnpm dev
```

---

## 🔧 What Happens During Migration

```
npx prisma db push --accept-data-loss
    ↓
Reads: prisma/schema.prisma
    ↓
Compares with live database schema
    ↓
Creates tables if they don't exist
    ↓
Creates Merchant table with all fields:
  - id (primary key)
  - businessName
  - ownerName
  - email (unique)
  - phone
  - businessType
  - businessAddress
  - idType
  - idFrontUrl
  - idBackUrl
  - status (default: "pending")
  - password
  - createdAt
  - updatedAt
    ↓
Success! Tables ready to use
```

---

## 📝 After Setting Up Database

### Your App Will Now:
✅ Save merchant registrations to database  
✅ Store file uploads  
✅ Persist status changes (approve/reject)  
✅ Load real merchants on admin dashboard  
✅ Be production-ready  

### Testing the Integration:
```bash
# 1. Start dev server
pnpm dev

# 2. Go to registration
http://localhost:3000/register

# 3. Fill form and register a merchant
# 4. Check admin dashboard
http://localhost:3000/admin

# 5. Try approving/rejecting
# 6. Reload page - changes persist!
```

---

## 🆘 Troubleshooting

### "Can't reach database server"
**Solution**: Make sure:
- Connection string is correct in `.env.local`
- Database service is running (for local PostgreSQL)
- No typos in DATABASE_URL

### "SSL error"
**Solution**: Ensure connection string has `?sslmode=require` at the end

### "Authentication failed"
**Solution**: Check username and password in connection string

### "Database already exists"
**Solution**: Run with `--accept-data-loss` flag:
```bash
npx prisma db push --accept-data-loss
```

---

## 🎯 Recommended Setup (For You)

Based on your situation, **I recommend Neon PostgreSQL**:

1. Takes 2 minutes to set up
2. Completely free
3. Great for development
4. Instantly works
5. Easy to monitor

**Quick steps:**
1. Go to https://neon.tech
2. Sign up (free)
3. Create project
4. Copy connection string
5. Paste in `.env.local`
6. Run: `npx prisma db push --accept-data-loss`
7. Done!

---

## 📊 Comparison Table

| Provider | Setup Time | Cost | Best For |
|----------|-----------|------|----------|
| **Neon** | 2 min | Free | Development |
| **Vercel** | 3 min | Free+ | Vercel deploys |
| **Railway** | 5 min | Free+ | Quick setup |
| **Local** | 15 min | Free | Offline work |

---

## 🚀 Once Database is Connected

Your merchant system will:
- ✅ Save new registrations
- ✅ Store approved/rejected status
- ✅ Keep files uploaded
- ✅ Display real merchants in admin
- ✅ Persist all changes
- ✅ Be ready for production

---

**Next Step**: Choose your database provider and follow the setup steps above!

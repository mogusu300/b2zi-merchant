# ⚡ Database Setup - 5 Minute Complete Guide

## 🎯 You Have 3 Options

### Option 1: Neon (⭐ RECOMMENDED)
**Time: 2 minutes | Cost: Free | Best for: Everyone**

```
1. Go to https://neon.tech
2. Click "Sign Up"
3. Create project (auto-generated name OK)
4. Copy connection string
5. Paste in .env.local
6. Done!
```

### Option 2: Vercel Postgres
**Time: 3 minutes | Cost: Free+ | Best for: Vercel users**

```
1. Go to Vercel dashboard
2. Create/open project
3. Storage → Create Database → Postgres
4. Copy connection string
5. Paste in .env.local
6. Done!
```

### Option 3: Local PostgreSQL
**Time: 15 minutes | Cost: Free | Best for: Offline work**

```
1. Download PostgreSQL from postgresql.org
2. Install (remember password!)
3. Create database: createdb merchant_onboarding
4. Update .env.local with local connection
5. Done!
```

---

## 📝 After You Have Connection String

### Step 1: Update .env.local

Find this line in `.env.local`:
```
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxxxxxxxxxxxxxxxx@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require"
```

Replace with your actual connection string (from Neon, Vercel, or local setup).

**Important**: Keep the `?sslmode=require` at the end if your provider requires it.

### Step 2: Run This Command

```bash
npx prisma db push --accept-data-loss
```

**You'll see:**
```
✔ Database synced, created 1 table

Merchant table created with:
├── id
├── businessName
├── ownerName
├── email (unique)
├── phone
├── businessType
├── businessAddress
├── idType
├── idFrontUrl
├── idBackUrl
├── password
├── status (default: "pending")
├── createdAt
└── updatedAt
```

### Step 3: Verify Setup

```bash
npx prisma studio
```

Open http://localhost:5555 and you'll see your database UI!

---

## ✅ After Database Connection

### Registration Flow Works
- User registers at `/register`
- Data saved to database
- Files uploaded and linked

### Admin Dashboard Works
- Shows real merchants from database
- Status changes persist
- Search filters real data

### Everything Persists
- Page refreshes don't lose data
- Changes survive server restart
- Data stays in database

---

## 🚨 Common Issues & Fixes

### "Can't reach database server"
```
❌ Wrong: DATABASE_URL has typo
✅ Fix: Copy directly from provider (no typos)
```

### "SSL error"
```
❌ Wrong: Missing ?sslmode=require
✅ Fix: Add ?sslmode=require to end of URL
```

### "Authentication failed"
```
❌ Wrong: Wrong password in connection string
✅ Fix: Copy exact connection string from provider
```

### "Database already exists"
```
❌ Wrong: Running migration twice
✅ Fix: That's OK! Use --accept-data-loss flag
```

---

## 🎬 Quick Test After Setup

### Test 1: Register Merchant
```
1. Go to http://localhost:3000/register
2. Fill form
3. Upload images
4. Click "Register"
5. ✅ See success message
6. Check: npx prisma studio → Merchant table → See your merchant!
```

### Test 2: Admin Dashboard
```
1. Go to http://localhost:3000/admin
2. See your registered merchant in list
3. Search for it (should find it)
4. Click "Approve"
5. Status changes to "Approved"
6. Refresh page
7. ✅ Status still "Approved" (data persisted!)
```

### Test 3: Persistence
```
1. Kill server (Ctrl+C)
2. Restart server (pnpm dev)
3. Go to /admin
4. ✅ Merchant still there with same status!
5. ✅ Data persisted between sessions!
```

---

## 📊 Your Checklist

- [ ] Choose database provider (Neon recommended)
- [ ] Sign up for free account
- [ ] Create database project
- [ ] Copy connection string
- [ ] Update .env.local with string
- [ ] Run: `npx prisma db push --accept-data-loss`
- [ ] Run: `npx prisma studio` to verify
- [ ] Test registration at /register
- [ ] Test admin at /admin
- [ ] Verify data persists (refresh page)
- [ ] Celebrate! 🎉

---

## 🎯 Timeline

```
Right now (5 min):
├── Sign up Neon (2 min)
├── Copy connection string (1 min)
└── Update .env.local (2 min)

Next (5 min):
├── Run: npx prisma db push (2 min)
├── Run: npx prisma studio (1 min)
└── Verify in UI (2 min)

Done! (0 min):
└── Everything works!

Total: 10 minutes
```

---

## 📚 Full Details Available

- **DATABASE_SETUP_QUICK.md** - All database options explained
- **SERVER_STATUS_GUIDE.md** - What's working right now
- **FINAL_SETUP_GUIDE.md** - Complete setup walkthrough

---

## 🚀 Go Get Your Database

### 👉 Visit: https://neon.tech

That's it! Takes 2 minutes and you're done.

Your merchant system will then be:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Data-persistent
- ✅ Ready to deploy

---

**Let's make this happen!** 🎉

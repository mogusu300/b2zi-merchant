# FieldPro - Quick Start Guide

**Date:** January 17, 2026  
**Status:** ✅ Ready to Use

---

## 🚀 Start Everything in 3 Steps

### Step 1: Terminal 1 - Backend Server
```bash
cd c:\Users\user\Downloads\merchant-onboarding-redesign\backend
pnpm install
pnpm prisma:migrate
pnpm dev

# Running on: http://localhost:5000
# API docs: http://localhost:5000/api/v1
```

### Step 2: Terminal 2 - Frontend App
```bash
cd c:\Users\user\Downloads\merchant-onboarding-redesign\fieldprohararemerchantonboardingportal
pnpm install
pnpm dev

# Running on: http://localhost:3000
# Mobile: http://10.51.175.215:3000
```

### Step 3: Open in Browser
```
http://localhost:3000
```

**That's it!** App is now running with backend.

---

## 📱 What to Test

### On the App (http://localhost:3000)

1. **Hunter Dashboard** (default view)
   - Dashboard with stats ✅
   - Merchant list ✅
   - Onboarding form ✅

2. **Merchant Login** (click button top-right)
   - Phone: `+263771234567` (test data)
   - Password: `TestPass123`
   - See merchant portal

3. **Merchant Portal**
   - Profile information
   - Documents tab
   - Activity log
   - Logout button

---

## 🔌 Backend Endpoints

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Register a Hunter
```bash
curl -X POST http://localhost:5000/api/v1/auth/hunter/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+263771234567",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123"
  }'
```

### Login Hunter
```bash
curl -X POST http://localhost:5000/api/v1/auth/hunter/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get Token (use in API calls)
```bash
# Response includes: accessToken, refreshToken, expiresIn
```

### Use Token to Access Protected Routes
```bash
curl http://localhost:5000/api/v1/hunters/me \
  -H "Authorization: Bearer {accessToken}"
```

---

## 📁 Key Files

### Backend
| File | Purpose |
|------|---------|
| `backend/src/server.ts` | Main Express app |
| `backend/src/routes/auth.routes.ts` | Auth endpoints |
| `backend/prisma/schema.prisma` | Database schema |
| `backend/.env` | Configuration |
| `backend/README.md` | Setup guide |

### Frontend
| File | Purpose |
|------|---------|
| `App.tsx` | Main app (router) |
| `components/MerchantLogin.tsx` | Merchant login page |
| `components/MerchantPortal.tsx` | Merchant dashboard |
| `components/Dashboard.tsx` | Hunter dashboard |
| `manifest.json` | PWA config |

---

## 🔐 Test Credentials

### Merchant (Sample)
- Phone: `+263771234567`
- Password: `TestPass123`
- Status: PENDING (needs to be created in DB)

### Hunter (Create Your Own)
```bash
# Use register endpoint to create one
# OR use Prisma Studio

# Then login with:
# Email: <your email>
# Password: <your password>
```

---

## 🗄️ Database Setup

### PostgreSQL Required

**Option 1: Local Installation**
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Create database:
createdb fieldpro_dev

# Verify in pgAdmin or psql
psql -l | grep fieldpro_dev
```

**Option 2: Docker**
```bash
docker run -d \
  --name fieldpro-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fieldpro_dev \
  -p 5432:5432 \
  postgres:16

# Verify
docker ps | grep fieldpro-db
```

**Option 3: Prisma Studio (Visual)**
```bash
cd backend
pnpm prisma:studio

# Opens UI to browse/edit database
# http://localhost:5555
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Start PostgreSQL
- Windows: Services → PostgreSQL → Start
- Mac: brew services start postgresql
- Docker: docker start fieldpro-db
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000

Solution: Kill existing process or change PORT in .env
```

### Migration Error
```bash
# Reset database (dev only!)
cd backend
npx prisma migrate reset

# Then run migrations again
pnpm prisma:migrate
```

### Frontend Can't Connect to Backend
```
Check:
1. Backend running on :5000?
2. CORS_ORIGIN in backend/.env includes frontend URL?
3. Firewall allowing communication?

Solution: Update in backend/.env
CORS_ORIGIN="http://localhost:3000"
```

---

## 📖 Documentation

Read these in order:

1. **BACKEND_FRONTEND_INTEGRATION_COMPLETE.md** (this folder)
   - Overview of what's built
   - How to run everything
   - Testing instructions

2. **BACKEND_IMPLEMENTATION_PROGRESS.md** (this folder)
   - What was implemented
   - API response formats
   - Database schema

3. **backend/README.md**
   - Backend setup
   - API reference
   - Troubleshooting

4. **IMPLEMENTATION_ROADMAP.md** (this folder)
   - Full 16-week plan
   - What's next (Phase 3+)

5. **BACKEND_ARCHITECTURE_DESIGN.md** (this folder)
   - Complete technical spec
   - Business logic details
   - Security considerations

---

## ✨ Features Implemented

✅ **Backend:**
- Express.js server
- PostgreSQL database
- JWT authentication
- Password hashing
- Input validation
- Error handling
- CORS protection
- Protected routes

✅ **Frontend:**
- Merchant login page
- Merchant portal
- Hunter dashboard
- Token management
- Session persistence
- Mobile responsive
- PWA ready

✅ **Security:**
- bcryptjs 12-round hashing
- JWT tokens (1h + 7d refresh)
- Role-based access control
- Input validation
- SQL injection prevention
- Error handling

---

## 🎯 Next Steps

### Phase 3 (Weeks 5-6)
- Merchant CRUD endpoints
- Merchant onboarding flow
- Document upload handler

### Phase 4 (Weeks 7-8)
- File upload to S3
- Document verification
- OCR integration

### Phase 5 (Weeks 9-10)
- Merchant UI pages
- Hunter dashboard pages
- Performance metrics

### Phase 6+ (Weeks 11-16)
- Admin features
- Testing & QA
- Deployment

---

## 📞 Support

### Quick Help
- API not responding? → Check backend terminal
- Frontend won't load? → Check browser console (F12)
- Database error? → Check PostgreSQL is running

### Full Documentation
All docs are in this folder. Read in order:
1. BACKEND_FRONTEND_INTEGRATION_COMPLETE.md (start here)
2. backend/README.md
3. BACKEND_IMPLEMENTATION_PROGRESS.md
4. IMPLEMENTATION_ROADMAP.md

---

## ⚡ Common Commands

```bash
# Backend
cd backend
pnpm dev                    # Start server
pnpm build                  # Build for prod
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open DB UI

# Frontend
cd fieldprohararemerchantonboardingportal
pnpm dev                    # Start dev server
pnpm build                  # Build for prod
pnpm preview                # Preview build

# Database
createdb fieldpro_dev       # Create database
dropdb fieldpro_dev         # Delete database
psql fieldpro_dev           # Connect to DB
```

---

## 🚀 You're Ready!

```
Backend:  http://localhost:5000 ✅
Frontend: http://localhost:3000 ✅
Database: PostgreSQL ready ✅

Start the servers and test the app!
```

---

**Questions?** Check the documentation files or review the code comments.

**Next Phase?** Follow IMPLEMENTATION_ROADMAP.md for Phase 3 implementation.

Happy coding! 🎉

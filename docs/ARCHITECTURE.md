# Merchant Onboarding System - Architecture Overview

## Project Analysis Summary

### Current State
- **Framework**: Next.js 16 with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Form**: 2-step registration process (Business Info → ID Verification)
- **Status**: Previously client-side only (no backend/database)

### What Was Added

## 1. Database Layer (Prisma)

**File**: `prisma/schema.prisma`

Defines the `Merchant` model with these fields:

```
id (UUID)              → Unique identifier
businessName           → Store/business name
ownerName              → Owner's full name
email (unique)         → Unique email address
phone                  → Contact number
businessType           → Type of business
businessAddress        → Business location
password               → User password (TODO: hash)
idType                 → NRC or Passport
idFrontUrl             → Front of ID document URL
idBackUrl              → Back of ID document URL
status                 → pending/approved/rejected
createdAt              → Registration timestamp
updatedAt              → Last update timestamp
```

**File**: `lib/prisma.ts`

Singleton instance of PrismaClient for safe database connections in development and production.

---

## 2. API Routes

### Registration API
**File**: `app/api/register/route.ts`

- **Method**: POST
- **Purpose**: Save merchant data to database
- **Validation**: 
  - Required fields check
  - Email format validation
  - Duplicate email prevention
- **Response**: Returns merchant ID on success

```typescript
POST /api/register
{
  businessName: string (required)
  ownerName: string (required)
  email: string (required, unique)
  phone: string (required)
  businessType: string (required)
  businessAddress: string (required)
  password: string (required, min 8 chars)
  idType: string (required - "nrc" | "passport")
  idFrontUrl: string (optional)
  idBackUrl: string (optional)
}
```

### File Upload API
**File**: `app/api/upload/route.ts`

- **Method**: POST
- **Purpose**: Handle ID document uploads
- **Validation**:
  - File type check (JPEG, PNG, WebP only)
  - File size limit (10MB max)
- **Current**: Returns temporary URLs
- **TODO**: Implement Vercel Blob, S3, or Cloudinary

```typescript
POST /api/upload
Content-Type: multipart/form-data
- file: File (image only, max 10MB)
```

---

## 3. Frontend Updates

### Registration Form
**File**: `app/register/page.tsx`

**New Fields Added**:
- Owner Name (was missing)
- Business Type (was missing)
- Business Address (was missing)

**New Features**:
- API integration for form submission
- File upload before registration
- Error message display
- Loading state during submission
- Automatic redirect to success page on completion

**Form Flow**:
1. User enters business info (step 1)
2. Click "Continue to Verification"
3. Upload ID documents (step 2)
4. Click "Complete Registration"
5. Files uploaded → Data saved to database
6. Redirect to success page

---

## 4. Admin Dashboard

**File**: `app/admin/page.tsx`

View all registered merchants with:
- Business details
- Owner information
- Registration status (pending/approved/rejected)
- Timestamps
- Links to view uploaded ID documents
- Status badges with color coding

```
http://localhost:3000/admin
```

---

## 5. Configuration Files

### Prisma Schema
**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Environment Template
**File**: `.env.local.example`

Template for required environment variables. Copy to `.env.local` and fill in values.

### Setup Documentation
**File**: `DATABASE_SETUP.md`

Complete guide for:
- Database provider setup (Vercel, Neon, Railway, Local)
- Prisma configuration
- Migration commands
- Troubleshooting

---

## Data Flow Diagram

```
┌─────────────────────────────────────┐
│  User Registration Form              │
│  (app/register/page.tsx)             │
└──────────────┬──────────────────────┘
               │
         Step 1: Enter Info
               │
               ▼
    ┌──────────────────────┐
    │  Validation Check    │
    └──────────┬───────────┘
               │
         Step 2: Upload Files
               │
               ▼
    ┌──────────────────────┐
    │  File Upload API     │
    │  /api/upload         │
    └──────────┬───────────┘
               │
        Get temporary URLs
               │
               ▼
    ┌──────────────────────┐
    │  Registration API    │
    │  /api/register       │
    └──────────┬───────────┘
               │
     Save to PostgreSQL via Prisma
               │
               ▼
    ┌──────────────────────┐
    │  Success Page        │
    │  /register/success   │
    └──────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Files |
|-------|-----------|-------|
| **Frontend** | Next.js 16, React 19, TypeScript | `app/register/page.tsx`, `app/admin/page.tsx` |
| **Styling** | Tailwind CSS, shadcn/ui | `components/ui/*` |
| **Backend** | Next.js API Routes | `app/api/**` |
| **Database** | PostgreSQL | `.env.local` |
| **ORM** | Prisma | `prisma/schema.prisma`, `lib/prisma.ts` |
| **File Storage** | TBD (Vercel Blob, S3, etc) | `app/api/upload/route.ts` |

---

## Key Features Implemented

✅ **Form Validation**
- Required field checks
- Email format validation
- Duplicate email prevention

✅ **Database Integration**
- Prisma ORM setup
- PostgreSQL support
- Automatic schema generation

✅ **File Upload**
- Image file type validation
- Size limit enforcement
- Temporary URL generation

✅ **Admin Dashboard**
- View all merchants
- Status tracking
- Document links

✅ **Error Handling**
- User-friendly error messages
- API error responses
- Form validation feedback

✅ **Loading States**
- Submit button disabled during processing
- Visual feedback for user

---

## Security Considerations (TODO)

| Item | Status | Priority |
|------|--------|----------|
| Password Hashing | TODO | 🔴 High |
| Email Verification | TODO | 🔴 High |
| File Storage Implementation | TODO | 🔴 High |
| Rate Limiting | TODO | 🟡 Medium |
| Input Validation (Zod) | TODO | 🟡 Medium |
| CSRF Protection | TODO | 🟡 Medium |
| Database Backups | TODO | 🟢 Low |

---

## Deployment Checklist

- [ ] Set up PostgreSQL database (Vercel Postgres recommended)
- [ ] Add DATABASE_URL to environment variables
- [ ] Run `pnpm prisma migrate deploy`
- [ ] Implement file upload service (Vercel Blob, S3, etc)
- [ ] Add password hashing (bcrypt)
- [ ] Add email verification
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Add CORS if needed for external APIs
- [ ] Test registration flow end-to-end
- [ ] Verify admin dashboard access
- [ ] Set up database backups

---

## Next Steps

1. **Immediate**: Database setup and testing
   ```bash
   pnpm add @prisma/client
   pnpm prisma migrate dev --name init
   ```

2. **Important**: Security implementation
   - Add password hashing (bcrypt)
   - Add email verification
   - Implement file storage service

3. **Enhancement**: Admin features
   - Merchant approval workflow
   - Status update API
   - Email notifications

4. **Advanced**: Merchant portal
   - Dashboard login
   - Profile management
   - Document resubmission

---

## File Structure

```
merchant-onboarding-redesign/
├── app/
│   ├── api/
│   │   ├── register/route.ts          [NEW] Registration endpoint
│   │   └── upload/route.ts            [NEW] File upload endpoint
│   ├── admin/
│   │   └── page.tsx                   [NEW] Admin dashboard
│   ├── register/
│   │   └── page.tsx                   [UPDATED] Form with API integration
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                            [Existing UI components]
│   └── theme-provider.tsx
├── hooks/
├── lib/
│   ├── prisma.ts                      [NEW] Prisma singleton
│   └── utils.ts
├── prisma/
│   └── schema.prisma                  [NEW] Database schema
├── public/
├── styles/
├── .env.local.example                 [NEW] Environment template
├── DATABASE_SETUP.md                  [NEW] Setup guide
├── tsconfig.json
└── package.json
```

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Setup database
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL

# Create database tables
pnpm prisma migrate dev --name init

# Open Prisma Studio
pnpm prisma studio

# Start development server
pnpm dev

# Test endpoints
# - Registration: POST http://localhost:3000/api/register
# - Upload: POST http://localhost:3000/api/upload
# - Admin: GET http://localhost:3000/admin
# - Register: GET http://localhost:3000/register
```

---

## Support Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Neon**: https://neon.tech/docs
- **Railway**: https://docs.railway.app/


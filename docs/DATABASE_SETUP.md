# Merchant Onboarding - Database Setup Guide

This guide walks you through setting up Prisma with a PostgreSQL database for the merchant onboarding system.

## Overview

The system now includes:
- ✅ Prisma ORM for database management
- ✅ Merchant registration with form validation
- ✅ File upload API for ID documents
- ✅ Admin dashboard to view all registered merchants
- ✅ Automatic Prisma client generation

## Files Added/Modified

### New Files Created:
- `prisma/schema.prisma` - Database schema definition
- `lib/prisma.ts` - Prisma client singleton utility
- `app/api/register/route.ts` - Registration API endpoint
- `app/api/upload/route.ts` - File upload API endpoint
- `app/admin/page.tsx` - Admin dashboard to view merchants
- `.env.local.example` - Environment variables template

### Modified Files:
- `app/register/page.tsx` - Updated with API integration and new fields

## Step-by-Step Setup

### 1. Install Prisma

Prisma will be auto-installed in v0, but you can manually install it:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

### 2. Set Up Database

Choose one of these PostgreSQL providers:

#### Option A: Vercel Postgres (Recommended for Vercel deployments)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a Postgres database
3. Copy the connection string (with `?sslmode=require`)

#### Option B: Neon (Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project and database
3. Get your connection string

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a PostgreSQL service
3. Copy the database URL

#### Option D: Local PostgreSQL
```bash
# Install PostgreSQL on your machine
# Create a database:
createdb merchant_onboarding
```

### 3. Create `.env.local`

Copy `.env.local.example` to `.env.local` and add your database URL:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
DATABASE_URL="postgresql://user:password@host:5432/merchant_onboarding"
```

**For Vercel Postgres:**
```
DATABASE_URL="postgresql://user:password@host.postgres.vercel-storage.com/dbname?sslmode=require"
```

### 4. Create Database Tables

```bash
# Generate Prisma client and create tables
pnpm prisma migrate dev --name init
```

This will:
- Generate the Prisma client
- Create the migration file
- Run the migration against your database
- Create the `Merchant` table with all required columns

### 5. Verify Setup

```bash
# Open Prisma Studio to view your database
pnpm prisma studio
```

Visit `http://localhost:5555` to see your database UI.

## Database Schema

The `Merchant` table includes:

```prisma
model Merchant {
  id                String   @id @default(cuid())          // Unique ID
  businessName      String                                  // Store/business name
  ownerName         String                                  // Owner's full name
  email             String   @unique                        // Unique email
  phone             String                                  // Contact number
  businessType      String?                                 // e.g., Retail, Services
  businessAddress   String?                                 // Business location
  password          String                                  // Hashed password (TODO: implement)
  idType            String                                  // "nrc" or "passport"
  idFrontUrl        String?                                 // URL to front of ID
  idBackUrl         String?                                 // URL to back of ID
  status            String   @default("pending")           // pending, approved, rejected
  createdAt         DateTime @default(now())               // Registration timestamp
  updatedAt         DateTime @updatedAt                    // Last update timestamp
}
```

## API Endpoints

### POST `/api/register`

Register a new merchant.

**Request:**
```json
{
  "businessName": "My Store",
  "ownerName": "John Doe",
  "email": "john@example.com",
  "phone": "+263771234567",
  "businessType": "Retail",
  "businessAddress": "123 Main St, Harare",
  "idType": "nrc",
  "password": "SecurePassword123!",
  "idFrontUrl": "https://example.com/id-front.jpg",
  "idBackUrl": "https://example.com/id-back.jpg"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Merchant registered successfully",
  "merchantId": "cld1234abcd5678"
}
```

**Response (Error):**
```json
{
  "error": "A merchant with this email already exists"
}
```

### POST `/api/upload`

Upload ID document images.

**Request:**
```
Content-Type: multipart/form-data
- file: File (JPEG, PNG, WebP, max 10MB)
```

**Response:**
```json
{
  "url": "/uploads/1234567890-abc123-document.jpg"
}
```

## Admin Dashboard

View all registered merchants:

```
http://localhost:3000/admin
```

The dashboard shows:
- Merchant information
- Registration status
- ID document links
- Registration timestamps

## File Upload Implementation

The upload API currently returns temporary URLs. For production, implement one of:

### Option 1: Vercel Blob (Recommended)
```bash
pnpm add @vercel/blob
```

Update `app/api/upload/route.ts`:
```typescript
import { put } from '@vercel/blob'

const blob = await put(file.name, file, { access: 'public' })
return NextResponse.json({ url: blob.url })
```

### Option 2: AWS S3
```bash
pnpm add @aws-sdk/client-s3
```

### Option 3: Cloudinary
```bash
pnpm add next-cloudinary
```

## Security Considerations

### ⚠️ TODO Items:

1. **Password Hashing**
   - Currently passwords are stored in plaintext
   - Implement bcrypt or argon2:
   ```bash
   pnpm add bcrypt
   ```
   ```typescript
   import bcrypt from 'bcrypt'
   const hashedPassword = await bcrypt.hash(password, 10)
   ```

2. **File Upload Storage**
   - Implement secure file storage (Vercel Blob, S3, Cloudinary)
   - Add file validation and scanning

3. **Email Verification**
   - Add email verification step before activation
   - Use services like SendGrid or Resend

4. **Rate Limiting**
   - Add rate limiting to API endpoints
   - Prevent brute force attacks

5. **Input Validation**
   - Add Zod schemas for request validation
   - Validate phone numbers and business addresses

## Development Commands

```bash
# Start dev server
pnpm dev

# Open Prisma Studio
pnpm prisma studio

# Create migration after schema changes
pnpm prisma migrate dev --name <description>

# Reset database (development only!)
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma generate

# View SQL migration files
ls prisma/migrations/
```

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
pnpm prisma generate
```

### "connection refused" error
- Check DATABASE_URL is correct
- Ensure database server is running
- Test connection: `psql <DATABASE_URL>`

### "P3014 Prisma Migrate could not create the shadow database"
For Vercel Postgres:
1. Check URL has `?sslmode=require`
2. Ensure your Vercel database is initialized

### Port 5555 (Prisma Studio) already in use
```bash
pnpm prisma studio --browser none  # Don't auto-open browser
```

## Next Steps

1. ✅ Complete database setup
2. ✅ Test registration form
3. ✅ Check admin dashboard
4. 📋 Implement email verification
5. 📋 Add password hashing
6. 📋 Set up file storage service
7. 📋 Add authentication/login
8. 📋 Create admin approval workflow

## Support

For issues:
- Check Prisma docs: https://www.prisma.io/docs/
- View schema: `pnpm prisma studio`
- Check logs in browser console and server terminal

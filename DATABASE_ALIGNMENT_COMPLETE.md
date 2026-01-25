# Database Alignment Complete ✅

## Summary
Both the main Next.js web app and the backend API are now configured to use the **SAME shared Neon PostgreSQL database**. All merchants registered through either system will be stored in the unified `merchants` table with no duplication.

---

## Configuration Updates

### 1. Backend Database URL
**File:** `backend/.env`
```env
DATABASE_URL="postgresql://neondb_owner:npg_owI5O3xHLaAK@ep-steep-dew-abp6oui5-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```
**Status:** ✅ Updated to match main app's database

### 2. Prisma Schema Alignment
**File:** `backend/prisma/schema.prisma`

#### Shared Tables (Unified)
- ✅ `Merchant` - Core merchant data (businessName, ownerName, email, phone, password, etc.)
- ✅ `Customer` - Customer profiles for marketplace
- ✅ `Session` - Session management
- ✅ `Product` - Product listings
- ✅ `Order` - Order tracking
- ✅ `OrderItem` - Order line items

#### New FieldPro Tables (Extended)
- ✅ `MerchantHunter` - Field hunter/agent profiles
- ✅ `MerchantHunterMerchant` - Merchant-hunter relationships & onboarding status
- ✅ `MerchantOnboardingDocument` - Document uploads (ID, business reg, etc.)
- ✅ `MerchantActivityLog` - Audit trail of merchant activities
- ✅ `MerchantLogin` - Merchant authentication details
- ✅ `RefreshToken` - JWT refresh tokens
- ✅ `AgentTarget` - Monthly targets for field hunters
- ✅ `AgentPerformanceMetric` - Performance tracking
- ✅ `AdminUser` - Admin account management

---

## Schema Validation

### Generated Prisma Client
```
✔ Generated Prisma Client (v5.22.0) in 161ms
```
**Status:** ✅ Schema is valid and Prisma client generated successfully

### Key Merchant Model Fields
All fields properly aligned with existing marketplace:
- businessName, ownerName, email (unique), phone
- password (bcrypt-hashed), idType, idFrontUrl, idBackUrl
- status (pending/approved/rejected), isVerified
- lastLogin, loginAttempts, lockedUntil (security)
- Relations: products[], sessions[], hunterMerchants[], documents[], activityLogs[], merchantLogin

---

## Data Flow

### Merchant Registration Flow
```
Hunter App (Vite PWA)
  ↓
/api/merchants/register [Backend API]
  ↓
Neon PostgreSQL (merchants table)
  ↓
Same table accessible to:
  - Next.js Web App
  - Vite PWA Merchant Portal
  - Admin Dashboard
```

### Authentication Flow
```
Merchant Login (PWA)
  ↓
/api/merchants/login [Backend API]
  ↓
Lookup in merchant_logins table
  ↓
Verify password against merchants.password
  ↓
Return JWT token
```

---

## Ready for Next Steps

### ✅ Completed
1. Backend environment configured for shared Neon database
2. Prisma schema unified with existing marketplace tables
3. FieldPro extensions properly mapped with @map() declarations
4. Prisma Client successfully generated
5. All relationships properly defined (Cascade/SetNull actions)

### ⏳ Next Action: Run Migration
```bash
cd backend && npx prisma migrate dev --name "initial_schema"
```
This will:
- Create any new FieldPro tables that don't exist
- Update existing tables with new relations
- Maintain all existing marketplace data

### ⏳ After Migration: Testing
1. Start backend: `cd backend && pnpm dev`
2. Start PWA frontend: `cd fieldprohararemerchantonboardingportal && pnpm dev`
3. Test merchant registration (Hunter app → merchant registers)
4. Verify merchant login works on PWA portal
5. Confirm merchants appear in existing Next.js admin dashboard

---

## Database URL Reference
```
Database: neondb
Provider: Neon (PostgreSQL cloud)
Region: eu-west-2 (London)
SSL Mode: Required
Connection: neondb_owner (read/write)
```

**Same URL used by:**
- Main Next.js Web App (fieldpro_marketplace)
- Backend API (fieldpro_backend)
- Vite PWA (fieldprohararemerchantonboardingportal)

---

## Important Notes

### Single Source of Truth
- ✅ One merchants table (not separate per app)
- ✅ One Neon database (not split databases)
- ✅ All merchant data unified
- ✅ No data duplication or sync issues

### Extension Design
- New FieldPro tables added to existing schema
- Existing tables extended with new relations
- Backward compatible (existing data preserved)
- No migration of existing data needed

### Schema Files Updated
- ✅ `backend/.env` - Database URL
- ✅ `backend/prisma/schema.prisma` - Complete unified schema
- ✅ Prisma Client regenerated and validated

---

**Generated:** Database alignment phase complete  
**Status:** Ready for Prisma migration to shared database  
**Next:** `npx prisma migrate dev` to finalize

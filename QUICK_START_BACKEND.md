# FieldPro Harare Backend - Quick Start & Reference

## Quick Database Setup

```bash
# 1. Install Prisma CLI
npm install @prisma/client prisma

# 2. Create .env with DATABASE_URL
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/fieldpro" > .env

# 3. Run migrations
npx prisma migrate deploy

# 4. Generate Prisma client
npx prisma generate

# 5. View database (optional UI)
npx prisma studio
```

---

## API Routes Quick Reference

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/hunters/login` | No | Hunter login |
| POST | `/api/v1/auth/hunters/refresh` | No | Get new access token |
| POST | `/api/v1/auth/hunters/logout` | Yes | Logout hunter |
| POST | `/api/v1/auth/merchants/login` | No | Merchant login |
| POST | `/api/v1/auth/merchants/request-otp` | No | Request OTP |
| POST | `/api/v1/auth/merchants/verify-otp` | No | Verify OTP & login |

### Merchant Management (Hunter)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/merchants/check-existence` | Hunter | Check if merchant exists |
| POST | `/api/v1/merchants/onboard` | Hunter | Register new merchant |
| GET | `/api/v1/merchants/:id` | Hunter | Get merchant details |
| PATCH | `/api/v1/merchants/:id` | Hunter | Update merchant |
| POST | `/api/v1/merchants/:id/documents/upload` | Hunter | Upload document |
| GET | `/api/v1/merchants/:id/documents` | Hunter | List documents |
| DELETE | `/api/v1/merchants/:id/documents/:docId` | Hunter | Delete document |

### Hunter Profile

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/hunters/me` | Hunter | Get my profile |
| PATCH | `/api/v1/hunters/me` | Hunter | Update my profile |
| GET | `/api/v1/hunters/me/merchants` | Hunter | List my merchants |
| GET | `/api/v1/hunters/me/stats` | Hunter | Get my stats |
| GET | `/api/v1/hunters/me/targets` | Hunter | Get my targets |

### Merchant Portal

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/merchants/me/onboarding-status` | Merchant | Check onboarding status |
| GET | `/api/v1/merchants/me/documents` | Merchant | View my documents |

---

## Key Data Models

### MerchantHunter
```typescript
{
  id: number
  email: string (unique)
  phone: string (unique)
  firstName: string
  lastName: string
  status: 'active' | 'inactive' | 'suspended'
  zone: string
  totalOnboardedCount: number
  conversionRate: decimal
  createdAt: DateTime
}
```

### MerchantHunterMerchant (Junction)
```typescript
{
  id: number
  merchantHunterId: number (FK)
  merchantId: string (FK)
  onboardingStatus: 'pending_verification' | 'verified' | 'rejected' | 'dormant'
  isPrimaryHunter: boolean
  onboardedAt: DateTime
  verificationCompletedAt: DateTime | null
}
```

### MerchantOnboardingDocument
```typescript
{
  id: number
  merchantHunterMerchantId: number (FK)
  merchantId: string (FK)
  merchantHunterId: number (FK)
  documentType: 'business_license' | 'national_id' | 'tax_certificate' | ...
  s3Url: string
  isVerified: boolean
  verifiedAt: DateTime | null
  uploadedAt: DateTime
}
```

---

## Common Code Patterns

### Pattern 1: Authenticated Route Handler

```typescript
// app/api/v1/example/route.ts
import { NextRequest } from 'next/server';
import { getTokenFromRequest } from '@/middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { UnauthorizedError } from '@/lib/errors/api-error';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token || token.role !== 'merchant_hunter') {
      throw new UnauthorizedError('Only hunters allowed');
    }

    // Your logic here
    const hunterId = token.hunter_id;

    // Return response
    return successResponse({ message: 'Success' });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, 401, error.errorCode);
    }
    return errorResponse('Internal error', 500);
  }
}
```

### Pattern 2: Input Validation

```typescript
import { z } from 'zod';
import { validationErrorResponse } from '@/lib/utils/response';

const createMerchantSchema = z.object({
  name: z.string().min(3).max(255),
  owner_name: z.string().min(3).max(255),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email(),
});

// In route handler
const body = await request.json();
const validation = createMerchantSchema.safeParse(body);

if (!validation.success) {
  return validationErrorResponse(
    validation.error.flatten().fieldErrors
  );
}

const data = validation.data;
// ... continue with validated data
```

### Pattern 3: Database Transaction

```typescript
import { prisma } from '@/lib/db';

try {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create merchant
    const merchant = await tx.merchant.create({
      data: { /* ... */ }
    });

    // Step 2: Link to hunter
    const mhm = await tx.merchantHunterMerchant.create({
      data: {
        merchantHunterId: hunterId,
        merchantId: merchant.id,
      }
    });

    // Step 3: Log activity
    await tx.merchantActivityLog.create({
      data: { /* ... */ }
    });

    return { merchant, mhm };
  });

  // All succeeded - commit automatic
  return successResponse(result);
} catch (error) {
  // All rolled back automatic
  return errorResponse(error.message, 500);
}
```

### Pattern 4: File Upload to S3

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadDocumentToS3(
  file: File,
  merchantId: string,
  documentType: string
) {
  // Validate
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }

  // Generate S3 key
  const s3Key = `merchants/${merchantId}/${crypto.randomUUID()}_${sanitizeFilename(file.name)}`;

  // Upload
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
    ServerSideEncryption: 'AES256',
  });

  await s3.send(command);

  // Generate pre-signed URL for download
  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });

  const downloadUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

  return { s3Key, s3Url: downloadUrl };
}
```

---

## Debugging Tips

### Check Active Database Connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'fieldpro';
```

### Find Slow Queries
```sql
SELECT query, calls, mean_exec_time, max_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### View Merchant Onboarding Flow
```sql
SELECT 
  al.activity_type,
  al.activity_description,
  m.businessName,
  h.firstName,
  al.created_at
FROM merchant_activity_logs al
JOIN merchant_hunters h ON al.merchant_hunter_id = h.id
LEFT JOIN merchants m ON al.merchant_id = m.id
WHERE al.created_at > NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;
```

### Check Hunter Performance
```sql
SELECT 
  h.firstName,
  h.lastName,
  COUNT(mhm.id) as merchants_onboarded,
  COUNT(CASE WHEN mhm.onboarding_status = 'verified' THEN 1 END) as verified,
  ROUND(
    100.0 * COUNT(CASE WHEN mhm.onboarding_status = 'verified' THEN 1 END) / 
    NULLIF(COUNT(mhm.id), 0), 
    2
  ) as verification_rate
FROM merchant_hunters h
LEFT JOIN merchant_hunter_merchants mhm ON h.id = mhm.merchant_hunter_id
GROUP BY h.id
ORDER BY merchants_onboarded DESC;
```

---

## Environment Variables Checklist

```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=                    # Use: openssl rand -base64 32
JWT_REFRESH_SECRET=            # Use: openssl rand -base64 32

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=fieldpro-documents

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# URLs
API_URL=https://api.fieldpro-harare.com
FRONTEND_URL=https://fieldpro-harare.com
MERCHANT_PORTAL_URL=https://merchant.fieldpro-harare.com

# Monitoring (optional)
SENTRY_DSN=
LOG_LEVEL=info
NODE_ENV=production
```

---

## Testing Checklist

```bash
# Unit tests
npm test -- lib/auth
npm test -- lib/validators

# Integration tests
npm test -- __tests__/api/merchants/onboard.test.ts

# API smoke test
npm run test:smoke

# Load test
npx artillery quick --count 100 --num 10 http://localhost:3000/api/v1/health

# Security scan
npm audit
npm run lint

# Type check
npx tsc --noEmit
```

---

## Common Errors & Solutions

### Error: "UNIQUE constraint failed"
**Cause:** Attempting to create merchant with duplicate phone/email
**Solution:**
```typescript
// Always check first
const existing = await prisma.merchant.findUnique({
  where: { phone: input.phone }
});

if (existing) {
  throw new ConflictError('Merchant already exists');
}
```

### Error: "Token has expired"
**Cause:** JWT access token expired
**Solution:**
```typescript
// Frontend should catch and call refresh endpoint
if (error.code === 'TOKEN_EXPIRED') {
  const newToken = await refreshToken(refreshToken);
  // Retry request with new token
}
```

### Error: "File upload timeout"
**Cause:** Large file or slow network
**Solution:**
```typescript
// Increase timeout, implement multipart upload for large files
const uploadParams = {
  // ...
  partSize: 5 * 1024 * 1024, // 5MB chunks
};
```

### Error: "Pool exhausted"
**Cause:** Too many database connections
**Solution:**
```typescript
// In prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL") // For connection pooling
}
```

---

## Performance Tips

### 1. Database Indexes
```sql
-- Already defined in schema, verify they exist
CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone);
CREATE INDEX IF NOT EXISTS idx_merchant_hunters_email ON merchant_hunters(email);
```

### 2. Query Optimization
```typescript
// ❌ Bad: N+1 query
const hunters = await prisma.merchantHunter.findMany();
for (const hunter of hunters) {
  const merchants = await prisma.merchantHunterMerchant.findMany({
    where: { merchantHunterId: hunter.id }
  });
}

// ✅ Good: Single query with join
const hunters = await prisma.merchantHunter.findMany({
  include: {
    merchantMappings: true,
  },
});
```

### 3. Pagination
```typescript
// Always paginate large result sets
const merchants = await prisma.merchant.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### 4. Caching
```typescript
// Cache frequently accessed data
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Cache for 5 minutes
const hunter = await redis.get(`hunter:${hunterId}`);
if (!hunter) {
  const fresh = await prisma.merchantHunter.findUnique({
    where: { id: hunterId }
  });
  await redis.setex(`hunter:${hunterId}`, 300, JSON.stringify(fresh));
}
```

---

## Support & References

- **Prisma Docs:** https://www.prisma.io/docs/
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8949
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **AWS S3 SDKv3:** https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/

---

**Last Updated:** January 17, 2026  
**For questions:** Refer to BACKEND_ARCHITECTURE_DESIGN.md

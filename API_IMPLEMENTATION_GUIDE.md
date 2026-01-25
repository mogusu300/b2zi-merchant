# FieldPro Harare - API Implementation Guide

## File Structure

```
app/
├── api/
│   └── v1/
│       ├── auth/
│       │   ├── hunters/
│       │   │   ├── login/
│       │   │   │   └── route.ts (POST)
│       │   │   ├── refresh/
│       │   │   │   └── route.ts (POST)
│       │   │   ├── logout/
│       │   │   │   └── route.ts (POST)
│       │   │   └── profile/
│       │   │       └── route.ts (GET, PATCH)
│       │   └── merchants/
│       │       ├── login/
│       │       │   └── route.ts (POST)
│       │       ├── request-otp/
│       │       │   └── route.ts (POST)
│       │       └── verify-otp/
│       │           └── route.ts (POST)
│       │
│       ├── merchants/
│       │   ├── route.ts (GET - list, POST - create)
│       │   ├── [id]/
│       │   │   ├── route.ts (GET, PATCH, DELETE)
│       │   │   └── documents/
│       │   │       ├── route.ts (GET - list, POST - upload)
│       │   │       └── [docId]/
│       │   │           ├── route.ts (GET, DELETE)
│       │   │           └── download/
│       │   │               └── route.ts (GET)
│       │   ├── check-existence/
│       │   │   └── route.ts (POST)
│       │   └── lookup/
│       │       └── route.ts (GET)
│       │
│       ├── hunters/
│       │   ├── me/
│       │   │   ├── merchants/
│       │   │   │   └── route.ts (GET)
│       │   │   ├── stats/
│       │   │   │   └── route.ts (GET)
│       │   │   ├── targets/
│       │   │   │   └── route.ts (GET)
│       │   │   └── route.ts (GET - profile)
│       │   └── [id]/
│       │       └── route.ts (GET)
│       │
│       └── admin/
│           └── merchants/
│               └── [id]/
│                   └── verify/
│                       └── route.ts (POST)
│
├── middleware.ts (JWT verification, role-based access)
├── lib/
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── otp.ts
│   ├── validators/
│   │   ├── merchant.ts
│   │   ├── hunter.ts
│   │   └── common.ts
│   ├── storage/
│   │   └── s3.ts
│   ├── db/
│   │   ├── transactions.ts
│   │   └── queries.ts
│   └── errors/
│       └── api-error.ts
└── utils/
    ├── response.ts
    └── logger.ts
```

---

## Core Implementation Files

### 1. JWT Token Management (`lib/auth/jwt.ts`)

```typescript
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY || '3600');
const JWT_REFRESH_EXPIRY = 7 * 24 * 60 * 60; // 7 days

export interface HunterJwtPayload extends JwtPayload {
  sub: string;
  hunter_id: number;
  email: string;
  role: 'merchant_hunter';
  status: string;
  iat: number;
  exp: number;
}

export interface MerchantJwtPayload extends JwtPayload {
  sub: string;
  merchant_id: string;
  business_name: string;
  role: 'merchant';
  iat: number;
  exp: number;
}

export function generateHunterToken(hunter: any): string {
  const payload: HunterJwtPayload = {
    sub: `hunter_${hunter.id}`,
    hunter_id: hunter.id,
    email: hunter.email,
    role: 'merchant_hunter',
    status: hunter.status,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'fieldpro-api',
    subject: `hunter_${hunter.id}`,
  });
}

export function generateMerchantToken(merchant: any): string {
  const payload: MerchantJwtPayload = {
    sub: merchant.id,
    merchant_id: merchant.id,
    business_name: merchant.businessName,
    role: 'merchant',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'fieldpro-api',
    subject: merchant.id,
  });
}

export function generateRefreshToken(userId: string | number, role: string): string {
  const payload = {
    sub: userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + JWT_REFRESH_EXPIRY,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    issuer: 'fieldpro-api',
  });
}

export function verifyToken(token: string): HunterJwtPayload | MerchantJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'fieldpro-api',
    });
    return decoded as HunterJwtPayload | MerchantJwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function verifyRefreshToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: 'fieldpro-api',
    });
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
```

### 2. Password Hashing (`lib/auth/password.ts`)

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 3. OTP Generation (`lib/auth/otp.ts`)

```typescript
import crypto from 'crypto';

export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
}

export function generateOTPRequest(
  merchantId: string,
  expirationMinutes: number = 5
): {
  otp_request_id: string;
  otp: string;
  expires_at: Date;
} {
  const otpRequestId = crypto.randomUUID();
  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  return {
    otp_request_id: otpRequestId,
    otp,
    expires_at: expiresAt,
  };
}

export function validateOTP(
  providedOTP: string,
  storedOTP: string,
  expiresAt: Date
): boolean {
  // Check if OTP has expired
  if (new Date() > expiresAt) {
    return false;
  }

  // Compare OTPs
  return providedOTP === storedOTP;
}
```

### 4. Input Validators (`lib/validators/merchant.ts`)

```typescript
import { z } from 'zod';

export const merchantOnboardingSchema = z.object({
  name: z
    .string()
    .min(3, 'Business name must be at least 3 characters')
    .max(255, 'Business name must be less than 255 characters'),

  owner_name: z
    .string()
    .min(3, 'Owner name must be at least 3 characters')
    .max(255, 'Owner name must be less than 255 characters'),

  email: z
    .string()
    .email('Invalid email format'),

  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),

  business_registration_number: z
    .string()
    .regex(/^[A-Z0-9]{6,20}$/, 'Invalid business registration number'),

  business_category_id: z
    .number()
    .int()
    .positive('Invalid category'),

  physical_address: z
    .string()
    .min(5, 'Physical address must be at least 5 characters'),

  gps_latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),

  gps_longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
});

export const checkMerchantExistenceSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  business_name: z.string().optional(),
  business_registration_number: z.string().optional(),
}).refine(
  (data) => Object.values(data).some(value => value),
  'At least one search field must be provided'
);

export type MerchantOnboarding = z.infer<typeof merchantOnboardingSchema>;
export type CheckMerchantExistence = z.infer<typeof checkMerchantExistenceSchema>;
```

### 5. API Response Handler (`lib/utils/response.ts`)

```typescript
import { NextResponse } from 'next/server';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  path?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      path: path || '',
    },
    { status: statusCode }
  );
}

export function errorResponse(
  message: string,
  statusCode: number = 400,
  errorCode?: string,
  errors?: Record<string, string[]>,
  path?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode,
      errors,
      timestamp: new Date().toISOString(),
      path: path || '',
    },
    { status: statusCode }
  );
}

export function validationErrorResponse(
  errors: Record<string, string[]>,
  path?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString(),
      path: path || '',
    },
    { status: 422 }
  );
}
```

### 6. Custom Error Class (`lib/errors/api-error.ts`)

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(422, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}
```

### 7. Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import type { HunterJwtPayload, MerchantJwtPayload } from '@/lib/auth/jwt';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that don't require authentication
  const publicRoutes = [
    '/api/v1/auth/hunters/login',
    '/api/v1/auth/hunters/refresh',
    '/api/v1/auth/merchants/login',
    '/api/v1/auth/merchants/request-otp',
    '/api/v1/auth/merchants/verify-otp',
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Extract token from header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Missing authorization token' },
      { status: 401 }
    );
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Attach decoded token to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-token', JSON.stringify(decoded));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/v1/:path*'],
};

// Helper to extract token from request
export function getTokenFromRequest(request: NextRequest): HunterJwtPayload | MerchantJwtPayload | null {
  const tokenHeader = request.headers.get('x-user-token');
  if (!tokenHeader) return null;
  try {
    return JSON.parse(tokenHeader);
  } catch {
    return null;
  }
}
```

### 8. Database Queries Helper (`lib/db/queries.ts`)

```typescript
import { prisma } from '@/lib/db';
import { NotFoundError, ConflictError } from '@/lib/errors/api-error';

export async function findMerchantByPhone(phone: string) {
  return prisma.merchant.findUnique({
    where: { phone },
  });
}

export async function findMerchantByEmail(email: string) {
  return prisma.merchant.findUnique({
    where: { email },
  });
}

export async function findHunterByEmail(email: string) {
  return prisma.merchantHunter.findUnique({
    where: { email },
  });
}

export async function createMerchantWithHunter(
  merchantData: any,
  hunterId: number
) {
  return prisma.$transaction(async (tx) => {
    // 1. Create merchant
    const merchant = await tx.merchant.create({
      data: {
        businessName: merchantData.name,
        ownerName: merchantData.owner_name,
        email: merchantData.email,
        phone: merchantData.phone,
        businessAddress: merchantData.physical_address,
        status: 'pending',
        // Required fields - set defaults if not provided
        password: '', // Will be set during merchant login setup
        idType: 'nrc',
      },
    });

    // 2. Create merchant profile
    if (merchantData.gps_latitude || merchantData.gps_longitude) {
      await tx.merchantProfile.create({
        data: {
          merchantId: merchant.id,
          // gps coordinates stored here
        },
      });
    }

    // 3. Link to hunter
    const hunterMerchant = await tx.merchantHunterMerchant.create({
      data: {
        merchantHunterId: hunterId,
        merchantId: merchant.id,
        onboardingStatus: 'pending_verification',
        isPrimaryHunter: true,
      },
    });

    // 4. Log activity
    await tx.merchantActivityLog.create({
      data: {
        activityType: 'merchant_created',
        merchantHunterId: hunterId,
        merchantId: merchant.id,
        activityDescription: `Merchant ${merchant.businessName} registered by hunter`,
        changes: {
          status: 'pending',
        },
      },
    });

    // 5. Update hunter stats
    await tx.merchantHunter.update({
      where: { id: hunterId },
      data: {
        totalOnboardedCount: { increment: 1 },
      },
    });

    return { merchant, hunterMerchant };
  });
}

export async function getHunterMerchants(
  hunterId: number,
  status?: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const where: any = { merchantHunterId: hunterId };
  if (status) {
    where.onboardingStatus = status;
  }

  const [merchants, total] = await Promise.all([
    prisma.merchantHunterMerchant.findMany({
      where,
      include: {
        merchant: true,
        documents: true,
      },
      skip,
      take: limit,
      orderBy: { onboardedAt: 'desc' },
    }),
    prisma.merchantHunterMerchant.count({ where }),
  ]);

  return {
    merchants,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}
```

---

## Example API Route Implementation

### `/api/v1/merchants/onboard` (POST)

```typescript
// app/api/v1/merchants/onboard/route.ts

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { merchantOnboardingSchema } from '@/lib/validators/merchant';
import { getTokenFromRequest } from '@/middleware';
import { successResponse, validationErrorResponse, errorResponse } from '@/lib/utils/response';
import { ConflictError, UnauthorizedError, ValidationError } from '@/lib/errors/api-error';
import { findMerchantByPhone, findMerchantByEmail, createMerchantWithHunter } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = getTokenFromRequest(request);
    if (!token || token.role !== 'merchant_hunter') {
      throw new UnauthorizedError('Only merchant hunters can onboard merchants');
    }

    const hunterId = token.hunter_id;

    // 2. Validate input
    const body = await request.json();
    const validation = merchantOnboardingSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return validationErrorResponse(errors as Record<string, string[]>, request.nextUrl.pathname);
    }

    const data = validation.data;

    // 3. Check for duplicates
    const [existingPhone, existingEmail] = await Promise.all([
      findMerchantByPhone(data.phone),
      findMerchantByEmail(data.email),
    ]);

    if (existingPhone) {
      throw new ConflictError('Merchant with this phone already exists', {
        existing_merchant_id: existingPhone.id,
        existing_merchant_name: existingPhone.businessName,
      });
    }

    if (existingEmail) {
      throw new ConflictError('Merchant with this email already exists', {
        existing_merchant_id: existingEmail.id,
      });
    }

    // 4. Create merchant and link to hunter
    const { merchant, hunterMerchant } = await createMerchantWithHunter(data, hunterId);

    // 5. Return success
    return successResponse({
      merchant: {
        id: merchant.id,
        name: merchant.businessName,
        phone: merchant.phone,
        status: merchant.status,
        onboarded_at: hunterMerchant.onboardedAt,
      },
      merchant_hunter_id: hunterId,
      onboarding_id: hunterMerchant.id,
      message: 'Merchant registered successfully',
    }, undefined, 201, request.nextUrl.pathname);
  } catch (error: any) {
    console.error('Onboarding error:', error);

    if (error instanceof ConflictError) {
      return errorResponse(error.message, error.statusCode, error.errorCode, undefined, request.nextUrl.pathname);
    }

    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode, error.errorCode, undefined, request.nextUrl.pathname);
    }

    return errorResponse(
      error.message || 'Internal server error',
      500,
      'INTERNAL_ERROR',
      undefined,
      request.nextUrl.pathname
    );
  }
}
```

---

## Testing Example

```typescript
// __tests__/api/merchants/onboard.test.ts

import { POST } from '@/app/api/v1/merchants/onboard/route';
import { NextRequest } from 'next/server';

describe('POST /api/v1/merchants/onboard', () => {
  it('should successfully onboard a merchant', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/merchants/onboard', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Retail',
        owner_name: 'Test Owner',
        email: 'test@retail.com',
        phone: '+263712345678',
        business_registration_number: 'BRN123456',
        business_category_id: 1,
        physical_address: 'Main Street',
        gps_latitude: -17.8252,
        gps_longitude: 31.0335,
      }),
      headers: {
        'Authorization': `Bearer <valid_hunter_token>`,
        'x-user-token': JSON.stringify({
          hunter_id: 123,
          role: 'merchant_hunter',
        }),
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] S3 bucket created
- [ ] Email service configured
- [ ] Rate limiting middleware added
- [ ] CORS configured
- [ ] Error logging set up
- [ ] API documentation generated
- [ ] Security headers added
- [ ] Tests passing (unit + integration)
- [ ] Load testing completed
- [ ] Staging deployment verified
- [ ] Production deployment

---

## Key Points

1. **Transactions:** All operations that modify multiple tables use `prisma.$transaction()` for consistency
2. **Middleware:** JWT verification happens before route handlers
3. **Error Handling:** Custom error classes for different scenarios
4. **Validation:** Zod schemas for strict input validation
5. **Logging:** All operations logged to database for audit trail
6. **Security:** Passwords hashed, tokens expire, rate limiting
7. **Isolation:** Hunters can only access their own merchant data

Next step: Implement specific routes following this pattern.

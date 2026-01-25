# FieldPro Harare - Security & Deployment Guide

## Security Architecture

### 1. Authentication Layers

#### Layer 1: Request Validation
```
Input → Schema Validation (Zod) → Type Coercion → Business Logic
         ↓ Invalid
      HTTP 422 (Unprocessable Entity)
```

#### Layer 2: Token Verification
```
Header → Extract Token → Verify JWT → Decode Claims → Attach to Request
                         ↓ Invalid/Expired
                      HTTP 401 (Unauthorized)
```

#### Layer 3: Authorization
```
Token Claims → Role Check → Resource Ownership Verification
                            ↓ Unauthorized
                         HTTP 403 (Forbidden)
```

### 2. Password Security

**Hashing:**
```typescript
// bcryptjs with 12 salt rounds
hash = await bcrypt.hash(password, 12);
// Time: ~250ms per hash (intentional slowdown against brute force)

// Verification
isValid = await bcrypt.compare(providedPassword, storedHash);
```

**Password Requirements:**
- Minimum 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character (!@#$%^&*)

**Password Storage Never:**
```typescript
// ❌ NEVER store plain text
passwordHash: password

// ❌ NEVER use weak algorithms
passwordHash: md5(password)
passwordHash: sha1(password)

// ✅ DO use strong algorithms
passwordHash: bcrypt.hash(password, 12)
passwordHash: scrypt(password, salt, N=16384, r=8, p=1)
```

### 3. JWT Token Security

**Token Structure:**
```json
{
  "sub": "hunter_123",
  "hunter_id": 123,
  "email": "hunter@fieldpro.com",
  "role": "merchant_hunter",
  "status": "active",
  "iat": 1705424000,
  "exp": 1705427600,
  "iss": "fieldpro-api"
}
```

**Token Lifecycle:**
```
1. User Login
   ↓ Generate Tokens
2. Access Token (1 hour) + Refresh Token (7 days)
   ↓ User stores in secure storage
3. Access Token expires
   ↓ User calls Refresh endpoint with Refresh Token
4. New Access Token issued
   ↓ Old tokens invalidated
5. Refresh Token expires
   ↓ User must log in again
```

**Token Storage (Frontend):**

```typescript
// ✅ BEST: HttpOnly Cookie (JavaScript cannot access)
Set-Cookie: auth_token=jwt_here; HttpOnly; Secure; SameSite=Strict; Max-Age=3600

// ✅ GOOD: SessionStorage (cleared on tab close)
sessionStorage.setItem('auth_token', token);

// ⚠️ CAUTION: LocalStorage (persists, susceptible to XSS)
localStorage.setItem('auth_token', token);
// Mitigations: CSP headers, validate origin, HTTPS only
```

### 4. Refresh Token Rotation

```typescript
// OLD: No rotation (tokens valid until expiry)
refresh_token_1 → expires at T+7days

// NEW: Rotation (tokens valid only once)
refresh_token_1 (used) → issues → refresh_token_2
                                  ↓
                        refresh_token_1 invalidated
                        refresh_token_2 (valid until used or expires)
```

**Benefits:**
- Compromised token can only be used once
- Server can track token chain
- Detect suspicious patterns (multiple refresh requests)

### 5. Rate Limiting

```typescript
// Implement using express-rate-limit or similar

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

const documentUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,                    // 50 uploads
});

const merchantRegistrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 100,                        // 100 registrations per hunter per day
  keyGenerator: (req) => req.user.hunter_id, // By hunter ID
});

app.post('/api/v1/auth/hunters/login', loginLimiter, loginHandler);
app.post('/api/v1/merchants/onboard', merchantRegistrationLimiter, onboardHandler);
```

### 6. SQL Injection Prevention

**The Problem:**
```typescript
// ❌ VULNERABLE
const merchant = await db.query(`
  SELECT * FROM merchants WHERE phone = '${req.body.phone}'
`);

// Attack:
// phone = "'; DROP TABLE merchants; --"
// Query becomes:
// SELECT * FROM merchants WHERE phone = ''; DROP TABLE merchants; --'
```

**Solutions:**

```typescript
// ✅ SOLUTION 1: Prisma ORM (Parameterized queries)
const merchant = await prisma.merchant.findUnique({
  where: { phone: req.body.phone }
});

// ✅ SOLUTION 2: Raw parameterized queries
const merchant = await prisma.$queryRaw`
  SELECT * FROM merchants WHERE phone = ${req.body.phone}
`;

// ✅ SOLUTION 3: Input validation + parameterized
const validPhone = phoneSchema.parse(req.body.phone);
const merchant = await prisma.merchant.findUnique({
  where: { phone: validPhone }
});
```

### 7. File Upload Security

```typescript
// 1. File Type Validation
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// 2. File Size Validation
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File size exceeds limit');
}

// 3. Filename Sanitization
const sanitizedFilename = file.originalname
  .replace(/[^a-zA-Z0-9._-]/g, '')
  .substring(0, 255);

// 4. Generate unique S3 key to prevent enumeration
const s3Key = `merchants/${merchantId}/${crypto.randomUUID()}_${sanitizedFilename}`;

// 5. Scan for malware (if using AWS)
// AWS ClamAV scan before storage
const scanResult = await scanFileForMalware(fileBuffer);
if (!scanResult.clean) {
  throw new Error('File contains malware');
}

// 6. Store with encryption
// S3 SSE-S3 or SSE-KMS
const uploadParams = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: s3Key,
  Body: fileBuffer,
  ServerSideEncryption: 'AES256',
  ContentType: file.mimetype,
  Metadata: {
    'merchant-id': merchantId,
    'uploaded-by': hunterId,
    'upload-timestamp': new Date().toISOString(),
  },
};

// 7. Return pre-signed URLs with expiration
const downloadUrl = await s3.getSignedUrlPromise('getObject', {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: s3Key,
  Expires: 3600, // 1 hour
});
```

### 8. CORS Configuration

```typescript
// middleware.ts or app configuration

const corsOptions = {
  origin: [
    'https://fieldpro-harare.com',
    'https://merchant.fieldpro-harare.com',
    'https://admin.fieldpro-harare.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Preflight requests are automatically handled by Next.js
```

### 9. CSRF Protection

```typescript
import { csrf } from 'next-csrf';

// For state-changing operations (POST, PATCH, DELETE)
export async function POST(request: NextRequest) {
  // Verify CSRF token
  const csrfToken = request.headers.get('x-csrf-token');
  const isValid = await verifyCsrfToken(csrfToken);

  if (!isValid) {
    return errorResponse('Invalid CSRF token', 403, 'CSRF_VALIDATION_FAILED');
  }

  // Continue with handler
}

// Client-side
const response = await fetch('/api/v1/merchants/onboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // From meta tag or previous GET
  },
  body: JSON.stringify(data),
});
```

### 10. Security Headers

```typescript
// next.config.mjs or middleware

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

export async function headers() {
  return [{ source: '/api/:path*', headers: securityHeaders }];
}
```

### 11. Data Encryption at Rest & in Transit

```typescript
// At Rest (Database)
// PostgreSQL with encrypted columns for sensitive data
import crypto from 'crypto';

function encryptField(plaintext: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decryptField(ciphertext: string, encryptionKey: string): string {
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// In Transit
// HTTPS/TLS 1.2+
// Next.js automatically upgrades to HTTPS in production
```

---

## Deployment Guide

### Phase 1: Pre-Deployment

#### 1.1 Environment Setup

```bash
# Create .env.production
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/fieldpro_prod
JWT_SECRET=<generate-32-char-random-string>
JWT_REFRESH_SECRET=<generate-32-char-random-string>
NODE_ENV=production
API_URL=https://api.fieldpro-harare.com
FRONTEND_URL=https://fieldpro-harare.com
MERCHANT_PORTAL_URL=https://merchant.fieldpro-harare.com

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=fieldpro-documents-prod

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@fieldpro.com
SMTP_PASS=xxx

# Analytics
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
```

#### 1.2 Database Migration

```bash
# 1. Backup existing database
pg_dump -U postgres fieldpro > fieldpro_backup_$(date +%Y%m%d).sql

# 2. Create migration
npx prisma migrate dev --name fieldpro_init

# 3. Test migration on staging
npx prisma migrate deploy --skip-generate

# 4. Verify schema
npx prisma studio
```

#### 1.3 Security Audit

```bash
# Check for common vulnerabilities
npm audit

# Run security linter
npm run lint

# Check TypeScript
npx tsc --noEmit

# Run tests
npm test
```

### Phase 2: Staging Deployment

```bash
# 1. Deploy to staging environment
vercel deploy --prod (staging alias)

# 2. Run integration tests
npm run test:integration

# 3. Load testing
npx artillery quick --count 100 --num 10 https://staging-api.fieldpro-harare.com

# 4. Smoke tests (all endpoints)
npm run test:smoke

# 5. Security testing
npm run test:security

# 6. Performance testing
npm run test:performance
```

### Phase 3: Production Deployment

```bash
# 1. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 2. Trigger production deployment
vercel deploy --prod

# 3. Verify deployment
curl -H "Authorization: Bearer <test-token>" https://api.fieldpro-harare.com/api/v1/health

# 4. Monitor logs
tail -f logs/production.log

# 5. Set up alerting
- Alert on 5xx errors > 1%
- Alert on response time > 500ms (p95)
- Alert on database connection pool exhaustion
- Alert on OOM (Out of Memory)
```

### Phase 4: Post-Deployment

```bash
# 1. Verify all endpoints
npm run test:smoke -- --url https://api.fieldpro-harare.com

# 2. Check database health
SELECT * FROM merchant_hunters LIMIT 1;
SELECT COUNT(*) FROM merchants;

# 3. Monitor metrics
- Transaction rate
- Error rate
- Response times
- Database query performance

# 4. Set up continuous monitoring
- Sentry for error tracking
- Datadog/New Relic for APM
- CloudWatch for AWS resources

# 5. Backup strategy
- Daily automated backups
- Monthly full backups
- Test restore procedures
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'fieldpro-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;

// Usage
logger.info('Merchant registered', {
  merchant_id: merchant.id,
  hunter_id: hunterId,
  timestamp: new Date().toISOString(),
});

logger.error('Document upload failed', {
  error: error.message,
  merchant_id: merchantId,
  file_size: fileSize,
  stack: error.stack,
});
```

### Metrics to Track

```
Business Metrics:
- Merchants onboarded per day
- Merchants by status (pending, verified, rejected)
- Conversion rate (leads → onboarded)
- Hunter performance ranking
- Documents uploaded per day
- Average time to verification

Technical Metrics:
- API response time (p50, p95, p99)
- Database query execution time
- Error rate by endpoint
- Authentication success/failure rate
- File upload success rate
- S3 storage usage

Infrastructure Metrics:
- CPU usage
- Memory usage
- Database connection pool
- Request throughput
- Cache hit rate
```

### Alerting Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| API Response Time (p95) | > 500ms | Page on-call |
| Error Rate | > 1% | Page on-call |
| Database Connection Pool | > 80% | Investigate |
| Disk Space | < 10% | Immediate alert |
| Memory Usage | > 90% | Investigate |
| CPU Usage | > 85% | Investigate |

---

## Disaster Recovery

### Database Backup Strategy

```bash
# Automated daily backup to S3
0 2 * * * pg_dump -U postgres fieldpro | gzip > /backups/fieldpro_$(date +%Y%m%d).sql.gz && aws s3 cp /backups/fieldpro_$(date +%Y%m%d).sql.gz s3://fieldpro-backups/

# Weekly full backup retention: 52 weeks
# Daily backup retention: 30 days
# Transaction log retention: 7 days
```

### Restore Procedure

```bash
# 1. Download backup from S3
aws s3 cp s3://fieldpro-backups/fieldpro_20260117.sql.gz ./

# 2. Stop application
systemctl stop fieldpro-api

# 3. Create new database (or drop old one)
dropdb fieldpro_recovery
createdb fieldpro_recovery

# 4. Restore from backup
gunzip -c fieldpro_20260117.sql.gz | psql -U postgres fieldpro_recovery

# 5. Run verification
psql -U postgres fieldpro_recovery -c "SELECT COUNT(*) FROM merchants;"

# 6. Switch application to restored database
# Update DATABASE_URL
# Restart application

# 7. Verify application health
curl https://api.fieldpro-harare.com/api/v1/health
```

---

## Incident Response

### Critical Issues

**Issue: Database Connection Pool Exhausted**

```
Symptom: HTTP 503 "Service Unavailable"
Action:
1. Check active connections: SELECT COUNT(*) FROM pg_stat_activity;
2. Terminate idle connections: SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
3. Increase connection pool size (scale up)
4. Identify slow queries causing stale connections
5. Add connection pooling middleware (PgBouncer)
```

**Issue: Malicious User Brute-Forcing Logins**

```
Symptom: High 401 error rate, logs show repeated failed logins from same IP
Action:
1. Enable IP-based rate limiting (iptables)
2. Blacklist IP temporarily
3. Check for compromised accounts: SELECT * FROM merchant_hunters WHERE status = 'active' AND updated_at < NOW() - INTERVAL '1 day';
4. Force password reset for affected accounts
5. Review audit logs for unauthorized access
6. Implement CAPTCHA on login
```

**Issue: Document Upload Service Down**

```
Symptom: S3 upload requests timeout
Action:
1. Check S3 service status
2. Verify AWS credentials are valid
3. Check S3 bucket permissions
4. Fallback to local temporary storage
5. Implement retry with exponential backoff
6. Notify users of temporary suspension
```

---

## Compliance & Auditing

### Data Retention Policy

```
Merchant Data:
- Active merchants: Indefinite
- Inactive merchants (no activity > 1 year): Retain 5 years
- Rejected merchants: Retain 2 years

Activity Logs:
- Retain: 3 years
- Archive to cold storage after 1 year

Documents:
- Retain until merchant status = 'verified' + 2 years
- Earlier if requested by merchant

Personal Data (GDPR/POPIA):
- Right to erasure: 30 days to fulfill
- Data portability: Provide in CSV/JSON format
```

### Audit Requirements

```sql
-- Verify audit trail is complete
SELECT activity_type, COUNT(*) as count 
FROM merchant_activity_logs 
GROUP BY activity_type 
ORDER BY count DESC;

-- Check for unauthorized access attempts
SELECT * FROM merchant_activity_logs 
WHERE activity_type = 'auth_failed' 
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Verify hunter accountability
SELECT 
  h.first_name,
  h.last_name,
  COUNT(m.id) as merchants_onboarded,
  MAX(al.created_at) as last_activity
FROM merchant_hunters h
LEFT JOIN merchant_hunter_merchants m ON h.id = m.merchant_hunter_id
LEFT JOIN merchant_activity_logs al ON h.id = al.merchant_hunter_id
GROUP BY h.id
ORDER BY merchants_onboarded DESC;
```

---

## Summary Checklist

### Security
- [ ] All passwords hashed with bcrypt (12 rounds)
- [ ] JWT tokens with 1-hour expiration
- [ ] Refresh token rotation implemented
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevention via Prisma
- [ ] File upload validation & scanning
- [ ] CORS configured
- [ ] CSRF protection enabled
- [ ] Security headers set
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Secrets rotation scheduled

### Infrastructure
- [ ] Database backups automated daily
- [ ] Disaster recovery plan tested
- [ ] Load balancer configured
- [ ] Auto-scaling enabled
- [ ] CDN for static assets
- [ ] Monitoring & alerting active
- [ ] Log aggregation set up
- [ ] Error tracking (Sentry)
- [ ] APM monitoring active

### Compliance
- [ ] Data retention policy documented
- [ ] Audit trails enabled
- [ ] GDPR/POPIA compliance verified
- [ ] Terms of Service updated
- [ ] Privacy Policy published
- [ ] Incident response plan ready
- [ ] Data breach procedure documented

---

**Last Updated:** January 17, 2026  
**Maintained By:** FieldPro Engineering Team

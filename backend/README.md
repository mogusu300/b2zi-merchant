# FieldPro Backend - Setup & Development Guide

## 📋 Quick Start

### 1. Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- VS Code with TypeScript support

### 2. Database Setup

#### Option A: PostgreSQL Locally

```bash
# Install PostgreSQL from https://www.postgresql.org/download/

# Create database
createdb fieldpro_dev

# Update DATABASE_URL in .env if different
DATABASE_URL="postgresql://postgres:password@localhost:5432/fieldpro_dev"

# Run migrations
npm run prisma:migrate
```

#### Option B: PostgreSQL Docker

```bash
docker run --name fieldpro-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fieldpro_dev \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Install & Run

```bash
# Install dependencies
pnpm install

# Generate Prisma types
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Seed with test data
pnpm prisma:seed

# Start development server
pnpm dev
```

Server runs on: `http://localhost:5000`

---

## 🚀 API Endpoints (Phase 2)

### Authentication Endpoints

#### Hunter Registration
```bash
POST /api/v1/auth/hunter/register
Content-Type: application/json

{
  "email": "hunter@example.com",
  "phone": "+263771234567",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123",
  "region": "Harare CBD"
}

Response 201:
{
  "success": true,
  "data": {
    "hunter": { ... },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600
  }
}
```

#### Hunter Login
```bash
POST /api/v1/auth/hunter/login
Content-Type: application/json

{
  "email": "hunter@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

#### Merchant Login (Phone + Password)
```bash
POST /api/v1/auth/merchant/login
Content-Type: application/json

{
  "phone": "+263771234567",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

#### Refresh Token
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "...",
    "expiresIn": 3600
  }
}
```

---

## 🛣️ Merchant Routes (Protected)

### Get Current Merchant Profile
```bash
GET /api/v1/merchants/me
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "status": "PENDING",
    ...
  }
}
```

### Get Merchant Documents
```bash
GET /api/v1/merchants/{merchantId}/documents
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": [...],
  "count": 3
}
```

### Get Merchant Activity Log
```bash
GET /api/v1/merchants/{merchantId}/activity-log
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": [...],
  "count": 15
}
```

---

## 🎯 Hunter Routes (Protected)

### Get Current Hunter Profile
```bash
GET /api/v1/hunters/me
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "onboardedCount": 5,
    ...
  }
}
```

### Get Hunter's Merchants
```bash
GET /api/v1/hunters/me/merchants
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### Get Hunter Performance
```bash
GET /api/v1/hunters/me/performance
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "current": { ... },
    "summary": { ... }
  }
}
```

---

## 📚 Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main Express app
│   ├── middleware/
│   │   ├── index.ts           # Error handler, request logger
│   │   └── auth.ts            # JWT verification, role checks
│   ├── routes/
│   │   ├── auth.routes.ts     # Authentication endpoints
│   │   ├── merchants.routes.ts
│   │   └── hunters.routes.ts
│   ├── services/
│   │   └── auth.service.ts    # Authentication logic
│   ├── validators/
│   │   └── index.ts           # Zod schemas for validation
│   └── types/
│       └── index.ts           # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/
├── package.json
├── tsconfig.json
├── .env                       # Development environment
└── .env.example               # Template
```

---

## 🔍 Database Schema

### Core Tables

- **merchants** - Marketplace merchants (existing)
- **merchant_hunters** - Field agents onboarding merchants
- **merchant_hunter_merchants** - Links hunters to merchants
- **merchant_logins** - Merchant authentication
- **merchant_onboarding_documents** - Submitted documents
- **merchant_activity_logs** - Audit trail

### Relationships

```
MerchantHunter ─── (many) ──── MerchantHunterMerchant ──── (one) ──── Merchant
                                                                           │
                                                                      Documents
                                                                      Logins
                                                                      Activity Logs
```

---

## 🧪 Testing

### Test Merchant Creation (via Prisma)
```bash
# Open Prisma Studio
npm run prisma:studio

# Then create test data manually through the UI
```

### Test Authentication Endpoint
```bash
# Register a new hunter
curl -X POST http://localhost:5000/api/v1/auth/hunter/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+263771234567",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/hunter/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| PORT | Server port | 5000 |
| JWT_SECRET | Signing secret for access tokens | secret-key |
| JWT_EXPIRES_IN | Token expiration time | 1h |
| JWT_REFRESH_SECRET | Signing secret for refresh tokens | refresh-key |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |
| CORS_ORIGIN | Allowed frontend URLs | http://localhost:3000 |
| NODE_ENV | Environment | development \| production |

---

## 📖 Next Steps (Phase 3)

After authentication is working:

1. **Merchant Management**
   - Create merchant endpoint (admin)
   - Update merchant endpoint (admin)
   - List merchants endpoint

2. **Onboarding Flow**
   - Start onboarding endpoint
   - Submit documents endpoint
   - Complete onboarding endpoint

3. **Admin Dashboard**
   - Merchant approval endpoints
   - Document verification endpoints
   - Performance reporting

---

## 🆘 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Ensure PostgreSQL is running
- Windows: Services → PostgreSQL
- Mac: brew services start postgresql
- Docker: docker ps | grep postgres
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution: Kill process or change PORT in .env
```

### Prisma Migration Error
```
npm run prisma:migrate

# Or reset database (dev only!)
npx prisma migrate reset
```

---

## 📚 References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Zod Validation](https://zod.dev/)
- [OWASP Authentication](https://owasp.org/www-project-authentication-cheat-sheet/)

---

**Backend is ready for Phase 2 implementation! 🚀**

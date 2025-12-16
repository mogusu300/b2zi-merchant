# ⚡ Quick Start - 2 Minute Setup

## 🚀 Get It Running Now

### Step 1: Start the Server
```bash
pnpm dev
```

### Step 2: Open Dashboard
```
http://localhost:3000/admin
```

**Done!** You're viewing the admin dashboard with 14 mock merchants.

---

## 🎯 Try These Right Away

1. **Search** - Type "Tech" to filter merchants
2. **Filter** - Click "Pending" to see only pending merchants
3. **Approve** - Click a merchant, then click the green "Approve" button
4. **Watch** - Stats update in real-time
5. **Responsive** - Press F12, toggle device toolbar to see mobile layout

---

## 🎨 What You'll See

| Element | Description |
|---------|-------------|
| Stat Cards | Total: 14, Pending: 5, Approved: 6, Rejected: 3 |
| Search Box | Filter by name, email, or owner |
| Status Buttons | All / Pending / Approved / Rejected |
| Merchant Cards | Shows all information with color-coded badges |
| Detail Modal | Full info with documents and approve/reject buttons |
| Action Menu | Dropdown with approve/reject options |

---

## 🎓 Files Guide

| File | Purpose |
|------|---------|
| `app/register/page.tsx` | Added API integration, new fields, error handling |

## 5-Minute Setup

### 1. Create `.env.local`
```bash
cp .env.local.example .env.local
```

### 2. Add Database URL
Edit `.env.local` and add your database:

**For Vercel Postgres:**
```
DATABASE_URL="postgresql://user:password@host.postgres.vercel-storage.com/dbname?sslmode=require"
```

**For Local PostgreSQL:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/merchant_onboarding"
```

### 3. Create Tables
```bash
pnpm prisma migrate dev --name init
```

### 4. Test It
```bash
# Start dev server
pnpm dev

# Visit registration form
http://localhost:3000/register

# View admin dashboard
http://localhost:3000/admin

# Open Prisma Studio
pnpm prisma studio
```

## Common Commands

```bash
# View database UI
pnpm prisma studio

# Create migration after schema changes
pnpm prisma migrate dev --name <description>

# Reset database (dev only)
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma generate

# Check database status
pnpm prisma migrate status
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module '@prisma/client'" | Run `pnpm prisma generate` |
| "Connection refused" | Check DATABASE_URL is correct |
| "Unsupported field type" | Ensure PostgreSQL provider in schema |
| "SSL error" | Add `?sslmode=require` to DATABASE_URL |

## Database Schema

### Merchant Table

```
id              - Unique identifier (CUID)
businessName    - Store name
ownerName       - Owner full name
email           - Email (unique)
phone           - Contact number
businessType    - Type of business
businessAddress - Location
password        - User password
idType          - "nrc" or "passport"
idFrontUrl      - URL to ID front
idBackUrl       - URL to ID back
status          - pending/approved/rejected
createdAt       - Registration timestamp
updatedAt       - Last update timestamp
```

## API Endpoints

### Register Merchant
```
POST /api/register
Content-Type: application/json

{
  "businessName": "My Store",
  "ownerName": "John Doe",
  "email": "john@example.com",
  "phone": "+263771234567",
  "businessType": "Retail",
  "businessAddress": "123 Main St",
  "password": "SecurePass123!",
  "idType": "nrc",
  "idFrontUrl": "https://...",
  "idBackUrl": "https://..."
}
```

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

- file: <image file>
```

## Form Fields (Updated)

**Step 1 - Business Information:**
- Business Name ✓
- Owner Name ✓ (NEW)
- Business Email ✓
- Contact Number ✓
- Business Type ✓ (NEW)
- Business Address ✓ (NEW)
- Password ✓

**Step 2 - Identity Verification:**
- ID Type (NRC/Passport)
- ID Front (upload)
- ID Back (upload)

## Admin Dashboard

Access: `http://localhost:3000/admin`

Shows:
- All registered merchants
- Business details
- Owner information
- Registration status
- ID document links
- Timestamps

## Next Steps

1. ✅ Database setup complete
2. 📋 Test registration form
3. 📋 Add password hashing (bcrypt)
4. 📋 Implement file storage (Vercel Blob/S3)
5. 📋 Add email verification

## File Storage (TODO)

Currently uses temporary URLs. Choose one:

**Vercel Blob** (Recommended):
```bash
pnpm add @vercel/blob
```

**AWS S3**:
```bash
pnpm add @aws-sdk/client-s3
```

**Cloudinary**:
```bash
pnpm add next-cloudinary
```

## Security TODOs

- [ ] Hash passwords with bcrypt
- [ ] Add email verification
- [ ] Implement file storage
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Set up CORS
- [ ] Add logging
- [ ] Monitor errors

## Resources

- 📖 [Prisma Docs](https://www.prisma.io/docs/)
- 📖 [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- 📖 [PostgreSQL](https://www.postgresql.org/docs/)
- 📖 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## Support

For detailed setup, see `DATABASE_SETUP.md`
For architecture details, see `ARCHITECTURE.md`

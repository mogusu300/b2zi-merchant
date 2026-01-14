# Customer Registration & Order Placement Issue - Diagnosis & Solution

## Problem Summary

**Symptom**: App shows a customer name but there's no customer in the database, and orders cannot be placed.

**Root Cause**: The customer registration endpoint (`/api/customers/register`) is **not actually saving customers to the database**.

---

## Current Database State

| Entity | Count | Status |
|--------|-------|--------|
| Customers | 1 (test only) | ❌ Registration broken |
| Orders | 0 | Cannot create without valid customer |
| Merchants | 1 | ✅ Working |
| Products | 1 | ✅ Working |

**The test customer was manually created for testing purposes.**

---

## Why This Happens

### 1. **Registration Flow is Broken**
```
User fills registration form
    ↓
Frontend POST to /api/customers/register
    ↓
API validates & hashes password
    ↓
API SHOULD: await prisma.customer.create({...})
    ↓
❌ Customer is NOT appearing in database
    ↓
But localStorage gets populated anyway
    ↓
User thinks they're registered, but they're not!
```

### 2. **Order Creation Fails**
```
User tries to place order with localStorage customer ID
    ↓
API receives customerId from request
    ↓
API tries: await prisma.order.create({customerId, ...})
    ↓
❌ Database constraint violation or silent failure
    (customerId doesn't exist in Customer table)
    ↓
Order creation fails or is orphaned
```

---

## Testing the Current Issue

### What You Should See

1. **Register a new customer** at `/customers/register`
   - Fill form with valid email/password
   - Click "Sign Up"

2. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check network tab → `register` request response

3. **Run diagnostic script** to check database:
   ```bash
   node debug-database.js
   ```
   - If customer count stays at 0, registration is failing
   - If customer count increases, registration works

4. **Try placing order** with test customer
   - Email: `test@example.com`
   - Password: `Password123`
   - This customer DOES exist in the database
   - Order should succeed with this account

---

## Immediate Solution: Using Test Customer

### Step 1: Log in with test customer
```
Email: test@example.com
Password: Password123
```

### Step 2: Browse products
- Go to `/marketplace`
- Add items to cart

### Step 3: Checkout
- Click "Proceed to Checkout"
- Fill in shipping info
- Place order

### Step 4: Verify order was created
```bash
node debug-database.js
```
- Should show: `ORDERS: 1`

---

## Long-Term Fix: Customer Registration

### Issue Location
**File**: `/app/api/customers/register/route.ts`

### Current Code (Lines 60-70)
```typescript
// Create customer
const customer = await prisma.customer.create({
  data: {
    email,
    name,
    password: hashedPassword,
    phone: phone || null,
  },
})
```

### Possible Problems

**Problem 1: Database Connection Issue**
- Prisma might not be connected to the database
- Check `.env.local` has valid `DATABASE_URL`

**Problem 2: Missing bcryptjs**
- Password hashing might be failing
- Verify: `npm ls bcryptjs`

**Problem 3: Constraint Violations**
- Email already exists (should return 409 error)
- Missing required fields in schema

**Problem 4: Transaction Isolation**
- Session creation might be rolling back the customer creation
- Check `createSession()` function in `/lib/auth-utils.ts`

### Diagnostic Steps

1. **Check environment variables**:
   ```bash
   type .env.local | findstr DATABASE_URL
   ```

2. **Check Prisma client**:
   ```bash
   npx prisma validate
   npx prisma db push
   ```

3. **Review Prisma schema**:
   - Check `/prisma/schema.prisma`
   - Verify Customer model has all required fields

4. **Test registration manually**:
   ```bash
   node -e "
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   (async () => {
     const customer = await prisma.customer.create({
       data: {
         email: 'direct-test@example.com',
         name: 'Direct Test',
         password: 'hashed-password',
       },
     });
     console.log('✅ Direct creation works:', customer.id);
     await prisma.\$disconnect();
   })();
   "
   ```

---

## Workaround: Create Test Customers Manually

### Create another test customer:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const hashed = await bcryptjs.hash('TestPassword123', 10);
  const customer = await prisma.customer.create({
    data: {
      email: 'customer2@example.com',
      name: 'Test Customer 2',
      password: hashed,
      phone: '555-1234',
    },
  });
  console.log('Created:', customer.email, customer.id);
  await prisma.\$disconnect();
})();
"
```

---

## Order API Verification

### Current API Endpoint
**File**: `/app/api/orders/route.ts`

### Issue with Order Creation
```typescript
const order = await prisma.order.create({
  data: {
    customerId,  // ❌ This ID must exist in Customer table
    total,
    items: { create: [...] },
    // ...
  },
})
```

### Problem
- No verification that `customerId` exists in database
- Should either:
  1. **Verify customer exists** before creating order
  2. **Add foreign key constraint** in database schema

### Suggested Fix
Add validation before order creation:
```typescript
// Verify customer exists
const customer = await prisma.customer.findUnique({
  where: { id: customerId }
});

if (!customer) {
  return NextResponse.json(
    { error: 'Customer not found. Please log in.' },
    { status: 404 }
  );
}
```

---

## Next Steps

1. **Immediate**: Use test customer for testing
   - Email: `test@example.com`
   - Password: `Password123`

2. **Short-term**: Investigate customer registration
   - Run diagnostic script: `node debug-database.js`
   - Check browser console for errors
   - Review `/api/customers/register` response

3. **Medium-term**: Add order validation
   - Verify customer exists before accepting order
   - Add better error messages
   - Log failures for debugging

4. **Long-term**: Set up testing
   - Automated tests for registration flow
   - Integration tests for checkout flow
   - Database validation checks

---

## Files for Reference

- [debug-database.js](./debug-database.js) - Check what's in the database
- [diagnose-issue.js](./diagnose-issue.js) - Full diagnosis with auto-fix
- `/app/api/customers/register/route.ts` - Registration endpoint
- `/app/api/orders/route.ts` - Order creation endpoint
- `/lib/auth-utils.ts` - Authentication utilities

---

## Support Information

**Test Customer (Already In Database)**:
- Email: `test@example.com`
- Password: `Password123`
- ID: `cmkduoejq0000qivz109wvkr7`

This customer can be used to test:
- ✅ Login flow
- ✅ Marketplace browsing
- ✅ Order placement
- ✅ Order history viewing

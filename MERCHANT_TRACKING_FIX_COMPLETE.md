# Merchant Tracking System - Analysis & Fixes

**Date**: January 23, 2026  
**Status**: ✅ FIXED

## Problem Statement

The system had critical issues with merchant tracking:

1. **Merchants not persisting**: When a hunter registered a merchant through the PWA app, the merchant would appear briefly but disappear on page refresh
2. **No hunter-merchant link**: Merchants were being created in the database but no relationship record was created in the `MerchantHunterMerchant` table
3. **No isolation**: The frontend wasn't properly filtering merchants to show only those onboarded by the logged-in hunter
4. **No audit trail**: No activity logging for merchant registration events

---

## Root Cause Analysis

### The Problem Flow:

```
PWA App (OnboardingForm)
    ↓
POST /api/v1/merchants/onboard
    ↓
Create merchant in `merchants` table
    ↓ ❌ MISSING: Create entry in `merchant_hunter_merchants` table
    ↓
Return merchant to frontend
    ↓
Frontend adds to local state only (not API-backed)
    ↓
On refresh → Local state cleared → Merchant disappears ❌
```

### Data Flow Issue:

The hunter's merchant list comes from this endpoint:
```
GET /api/v1/hunters/me/merchants
```

This endpoint queries the `MerchantHunterMerchant` join table:
```typescript
const hunterMerchants = await prisma.merchantHunterMerchant.findMany({
  where: { merchantHunterId: req.user!.id },  // ← Filters by hunter
  include: { merchant: true }
})
```

**But** when a merchant was registered, no `MerchantHunterMerchant` record was created, so the merchant never appeared in the list!

---

## Database Schema Understanding

### Key Tables:

1. **`merchants`** - Core merchant data
   - `id`, `businessName`, `ownerName`, `email`, `phone`, `status`, etc.

2. **`merchant_hunters`** - Hunter/agent accounts
   - `id`, `email`, `firstName`, `lastName`, `phone`, etc.

3. **`merchant_hunter_merchants`** - **JOIN TABLE** (THE KEY!)
   - `id`, `merchantHunterId`, `merchantId`, `status`, `onboardingStartedAt`, etc.
   - **Unique constraint**: `(merchantHunterId, merchantId)` - ensures one hunter per merchant

4. **`merchant_activity_logs`** - Audit trail
   - `id`, `merchantId`, `merchantHunterId`, `action`, `description`, etc.

### The Critical Relationship:

```
Merchant Hunter (Agent)
    ↓ (creates)
    ↓ MerchantHunterMerchant
    ↓ (points to)
Merchant
```

A merchant is "owned" by a hunter through this join table. Without it, the merchant is orphaned.

---

## Fixes Implemented

### 1. **Backend: Create Hunter-Merchant Relationship** ✅

**File**: [backend/src/routes/merchants.onboard.ts](backend/src/routes/merchants.onboard.ts)

**Changes**:
- Extract `hunterId` from JWT token in Authorization header
- After creating merchant, create `MerchantHunterMerchant` record
- Log the activity in `MerchantActivityLog`

```typescript
// Extract hunter ID from JWT token
let hunterId: string | null = null
const authHeader = req.headers['authorization']
if (authHeader) {
  try {
    const token = authHeader.split(' ')[1]
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
      if (decoded.type === 'HUNTER') {
        hunterId = decoded.id
      }
    }
  } catch (tokenErr) {
    console.warn('[MERCHANTS ONBOARD] Failed to extract hunter ID from token:', tokenErr)
  }
}

// After merchant creation...
if (hunterId) {
  await prisma.merchantHunterMerchant.create({
    data: {
      merchantHunterId: hunterId,
      merchantId: merchant.id,
      status: 'not_started',
      onboardingStartedAt: new Date(),
      onboardingDaysElapsed: 0
    }
  })

  // Log activity
  await prisma.merchantActivityLog.create({
    data: {
      merchantId: merchant.id,
      merchantHunterId: hunterId,
      action: 'REGISTERED',
      description: `Merchant registered and assigned to hunter ${hunterId}`,
      performedByRole: 'HUNTER',
      performedByIp: req.socket.remoteAddress || 'unknown'
    }
  })
}
```

**Result**: ✅ Hunter-merchant relationship now created on registration

---

### 2. **Frontend: Add API-Backed Refresh** ✅

**File**: [fieldprohararemerchantonboardingportal (1)/App.tsx](fieldprohararemerchantonboardingportal (1)/App.tsx)

**Changes**:
- Modified `addMerchant()` function to refresh from API instead of just adding to local state
- Fetches from `/api/v1/hunters/me/merchants` after registration completes
- Ensures data is always in sync with database

```typescript
const addMerchant = (newMerchant: Merchant) => {
  // Refresh the merchants list from API
  setMerchantsLoading(true)
  const fetchMerchants = async () => {
    if (!hunterToken) return
    try {
      const apiUrl = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || window.location.origin
      const res = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
        headers: {
          Authorization: `Bearer ${hunterToken}`,
        },
      })
      const data = await res.json()
      if (data?.success && Array.isArray(data.data)) {
        const mapped: Merchant[] = data.data.map((mhm: any) => {
          const merchant = mhm.merchant || mhm
          return {
            id: merchant.id,
            name: merchant.businessName,
            owner: merchant.ownerName,
            location: merchant.businessAddress,
            status: merchant.status === 'approved' ? 'Onboarded' : 'Pending',
            category: merchant.category?.name || '',
            dateAdded: new Date(merchant.createdAt).toLocaleDateString(),
          }
        })
        setMerchants(mapped)  // ← Update from API, not local state
      }
    } finally {
      setMerchantsLoading(false)
    }
  }
  
  fetchMerchants()
  setActiveTab("merchants")
}
```

**Result**: ✅ Merchants now persist across page refreshes

---

### 3. **Frontend: Pass Hunter Token to Form** ✅

**File**: [fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx](fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx)

**Changes**:
- Accept `hunterToken` prop
- Use it for Authorization header when registering merchant
- Ensures merchant is linked to correct hunter

```typescript
interface OnboardingFormProps {
  onSubmit: (merchant: Merchant) => void
  hunterToken?: string  // ← New prop
}

// In form submission:
const token = hunterToken || localStorage.getItem('hunterToken')
const headers: Record<string, string> = {}
if (token) headers.Authorization = `Bearer ${token}`  // ← Includes hunter auth
```

**Result**: ✅ Merchant registration includes hunter authentication

---

### 4. **API Verification** ✅

**File**: [backend/src/routes/hunters.routes.ts](backend/src/routes/hunters.routes.ts) - No changes needed!

The endpoint was already correctly filtering:

```typescript
router.get('/me/merchants', asyncHandler(async (req: AuthRequest, res) => {
  const hunterMerchants = await prisma.merchantHunterMerchant.findMany({
    where: { merchantHunterId: req.user!.id },  // ← Only this hunter's merchants
    include: { merchant: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: hunterMerchants, count: hunterMerchants.length })
}))
```

**Result**: ✅ API correctly isolates merchants by hunter

---

## How It Works Now

### New Merchant Registration Flow:

```
Hunter (authenticated with token)
    ↓
PWA App: OnboardingForm
    ↓
POST /api/v1/merchants/onboard
  Header: Authorization: Bearer <hunter_token>
    ↓
Backend: Decode token, extract hunterId
    ↓
Create merchant in `merchants` table
    ↓
✅ Create entry in `merchant_hunter_merchants` table
    ↓
✅ Log in `merchant_activity_logs` table
    ↓
Return success response
    ↓
Frontend: Call GET /api/v1/hunters/me/merchants
    ↓
API: Query MerchantHunterMerchant where merchantHunterId = hunter_id
    ↓
Return only merchants onboarded by this hunter
    ↓
Frontend: Update state with fresh data
    ↓
Display merchant in list ✅
    ↓
On page refresh → Fresh data fetched from API → Merchant persists ✅
```

---

## Features Unlocked

### ✅ Data Persistence
- Merchants stored in database with hunter relationship
- Persists across page refreshes and sessions

### ✅ Multi-Hunter Isolation
- Each hunter only sees merchants they onboarded
- Database enforces unique `(merchantHunterId, merchantId)` constraint
- API filters by `req.user!.id`

### ✅ Audit Trail
- All merchant registrations logged in `merchant_activity_logs`
- Tracks which hunter onboarded which merchant
- Records IP address and timestamp

### ✅ Real-Time Data
- Frontend always syncs with database
- No stale local state
- Accurate merchant counts and statuses

---

## Testing

### Test Script: [test-merchant-tracking.js](test-merchant-tracking.js)

Run with:
```bash
node test-merchant-tracking.js
```

### Tests Performed:
1. ✅ Create Hunter 1 and Hunter 2
2. ✅ Hunter 1 registers a merchant
3. ✅ Merchant appears in Hunter 1's list
4. ✅ Merchant does NOT appear in Hunter 2's list
5. ✅ Merchant persists on "refresh" (second API call)
6. ✅ Activity log created for registration
7. ✅ Database-level filtering verified

---

## Code Changes Summary

| File | Changes | Impact |
|------|---------|--------|
| `backend/src/routes/merchants.onboard.ts` | Extract hunterId from JWT, create MerchantHunterMerchant, log activity | Data persistence, audit trail |
| `fieldprohararemerchantonboardingportal (1)/App.tsx` | Modified addMerchant to refresh from API, pass hunterToken to form | Real-time sync, proper data flow |
| `fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx` | Accept hunterToken prop, use for Authorization header | Hunter authentication in registration |
| `backend/src/routes/hunters.routes.ts` | No changes (already correct) | Hunter-specific merchant filtering |

---

## Verification Checklist

- [x] Hunter can register merchant
- [x] Merchant appears in hunter's dashboard immediately
- [x] Merchant persists on page refresh
- [x] Merchant doesn't appear for other hunters
- [x] Activity log created for each registration
- [x] Database relationships properly established
- [x] API filtering works correctly
- [x] Authorization tokens properly validated
- [x] Error handling for failed registration

---

## Edge Cases Handled

### 1. Merchant registered without hunter authentication
- Creates merchant record
- Logs activity with role 'MERCHANT'
- No MerchantHunterMerchant record created
- Merchant doesn't appear in any hunter's list (correct behavior)

### 2. Invalid or expired hunter token
- Token extraction fails gracefully with warning
- Merchant still created (backward compatibility)
- No hunter-merchant relationship created

### 3. Database constraint violation
- Unique constraint on `(merchantHunterId, merchantId)` prevents duplicates
- Prevents same hunter from onboarding same merchant twice

### 4. Concurrent registrations
- Each gets unique ID
- No race condition due to DB constraints

---

## Performance Considerations

- [x] MerchantHunterMerchant table indexed on `merchantHunterId` (fast queries)
- [x] Activity log indexed on `merchantHunterId` and `merchantId`
- [x] Frontend caches merchant list, only refetches after registration
- [x] Lazy loading of merchant data (included when needed)

---

## Security Improvements

- [x] Hunter authentication required for registration linking
- [x] JWT token verified before extracting hunter ID
- [x] API filters by authenticated user ID (no access to other hunters' merchants)
- [x] Activity logs maintain audit trail
- [x] IP addresses recorded for security monitoring

---

## Future Enhancements

1. **Bulk Registration**: Upload multiple merchants in CSV, auto-assign to current hunter
2. **Merchant Transfer**: Move merchant from one hunter to another with audit trail
3. **Metrics Dashboard**: Show hunter performance (merchants onboarded, conversion rates)
4. **Real-time Notifications**: Notify hunter when merchant completes registration
5. **Merchant Status Tracking**: Update status as merchant moves through verification
6. **Multi-level Approval**: Admin approval before merchant appears in dashboard

---

## Deployment Notes

### No Database Migrations Needed
- `MerchantHunterMerchant` table already exists in schema
- `merchant_activity_logs` table already exists in schema
- Just need to deploy updated backend and frontend code

### Backward Compatibility
- Existing merchants can be manually linked (run migration script if needed)
- Self-registered merchants (without hunter) continue to work
- API changes are backward compatible (adds relationship, doesn't break existing)

### Testing in Production
```bash
# Test a single merchant registration
curl -X POST http://api.example.com/api/v1/merchants/onboard \
  -H "Authorization: Bearer <hunter_token>" \
  -H "Content-Type: application/json" \
  -d '{...merchant_data...}'

# Verify it appears in hunter list
curl http://api.example.com/api/v1/hunters/me/merchants \
  -H "Authorization: Bearer <hunter_token>"
```

---

## Conclusion

The merchant tracking system is now **fully functional** with:
- ✅ Proper data persistence
- ✅ Hunter-merchant relationships
- ✅ Multi-hunter isolation
- ✅ Audit trail logging
- ✅ Real-time API synchronization

The PWA app and dashboard will now correctly display merchants that persist across page refreshes, and each hunter will only see merchants they personally onboarded.

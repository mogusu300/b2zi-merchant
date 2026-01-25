# Merchant Tracking System - Visual Architecture & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PWA MERCHANT APP                          │
│                   (Mobile/Web Progressive App)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐     ┌──────────────────────────┐  │
│  │   Hunter Login/Signup    │     │  Merchant Registration   │  │
│  │  (HunterLogin.tsx)       │     │  (OnboardingForm.tsx)    │  │
│  │                          │     │                          │  │
│  │ • Email + Password       │     │ • Business Details       │  │
│  │ • Create Account         │     │ • Owner Info             │  │
│  │ • Get hunterToken        │     │ • ID Documents           │  │
│  └────────┬─────────────────┘     │ • Uses hunterToken ✅    │  │
│           │                       │                          │  │
│           └──────────┬────────────┴────────────┬─────────────┘  │
│                      │                         │                │
│              (hunterToken stored in localStorage)               │
│                      │                         │                │
│  ┌──────────────────┴──────────────────────────┴────────────┐  │
│  │              App.tsx (Main Container)                     │  │
│  │                                                            │  │
│  │  • Manages hunterToken state                             │  │
│  │  • Routes between views                                  │  │
│  │  • Handles addMerchant() function ✨                     │  │
│  │  • Passes hunterToken to OnboardingForm                  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │         MerchantList.tsx (Dashboard View)               │  │
│  │                                                            │  │
│  │  • Display merchants from App state ✅                   │  │
│  │  • Search, filter, sort                                  │  │
│  │  • Shows only current hunter's merchants                 │  │
│  │  • Persists on refresh (API-backed state)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ API Calls (with Authorization: Bearer <hunterToken>)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND NODE.JS SERVER                       │
│                    (Express + Prisma + JWT)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/v1/merchants/onboard (✨ THE FIX)                    │
│  ├─ Validate request                                            │
│  ├─ Extract hunterId from JWT token ✅                         │
│  ├─ Create merchants record ✅                                  │
│  ├─ Create merchant_hunter_merchants record ✅ KEY FIX         │
│  ├─ Create merchant_activity_logs record ✅                     │
│  └─ Return success                                              │
│                                                                   │
│  GET /api/v1/hunters/me/merchants (✨ FILTERING)               │
│  ├─ Extract hunterID from token                                │
│  ├─ Query WHERE merchantHunterId = extracted_id ✅            │
│  └─ Return only THIS hunter's merchants                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Prisma ORM
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                            │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ merchant_hunters │  │    merchants     │  │merchant_hunter│ │
│  └──────────────────┘  └──────────────────┘  │_merchants    │  │
│                                               └──────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  merchant_activity_logs (Audit Trail)                    │  │
│  │  ├─ Who: merchantHunterId                               │  │
│  │  ├─ What: action, description                           │  │
│  │  ├─ When: createdAt timestamp                           │  │
│  │  └─ Where: performedByIp                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow - New Merchant Registration

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 1: Hunter fills form and clicks submit                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Frontend (App.tsx)          Backend              Database         │
│       │                        │                     │            │
│       ├─ hunterToken          │                     │            │
│       ├─ businessName         │                     │            │
│       ├─ ownerName            │                     │            │
│       ├─ email                │                     │            │
│       ├─ phone                │                     │            │
│       ├─ idDocuments (files)  │                     │            │
│       │                        │                     │            │
│       └─→ POST /merchants/onboard                  │            │
│           Headers:             │                     │            │
│           - Authorization: Bearer <token> ✅       │            │
│           Body:               │                     │            │
│           - All form data     │                     │            │
│                               │                     │            │
│                       ┌───────┴────────┐           │            │
│                       │                 │           │            │
│                       ▼                 │           │            │
│              Backend receives:          │           │            │
│              1. Validate fields        │           │            │
│              2. Extract hunterToken    │           │            │
│              3. Decode JWT             │           │            │
│              4. Get hunterId ✨       │           │            │
│              5. Hash password          │           │            │
│              6. Upload files           │           │            │
│                                        │           │            │
│                                        ├──────────→ Create merchants
│                                        │           record ✅
│                                        │           │            │
│                                        ├──────────→ Create merchant_
│                                        │           hunter_merchants
│                                        │           ✅ (THE KEY FIX!)
│                                        │           │            │
│                                        ├──────────→ Create activity
│                                        │           log ✅
│                                        │           │            │
│                                        │←──────────┘            │
│                                        │                        │
│       Return {success: true}          │                        │
│←───────merchant: {...}}──────────────┘                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  STEP 2: Frontend calls addMerchant()                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Frontend (App.tsx)          Backend              Database         │
│       │                        │                     │            │
│       │ addMerchant(merchant)  │                     │            │
│       │ └──→ setLoading(true)  │                     │            │
│       │                        │                     │            │
│       └─→ GET /hunters/me/merchants               │            │
│           Headers:             │                     │            │
│           - Authorization: Bearer <token> ✅       │            │
│                               │                     │            │
│                       ┌───────┴────────┐           │            │
│                       │                 │           │            │
│                       ▼                 │           │            │
│              Backend:                   │           │            │
│              1. Extract hunterID ✨    │           │            │
│              2. Query merchant_hunter_ │           │            │
│                 merchants WHERE         │           │            │
│                 merchantHunterId =      │           │            │
│                 <extracted_id> ✨      │           │            │
│              3. Include merchant data   │           │            │
│              4. Sort by createdAt       │           │            │
│                                        │           │            │
│                                        ├──────────→ Query with filter
│                                        │           WHERE clause
│                                        │           │            │
│                                        │←──────────┘            │
│                                        │                        │
│       Return [{merchant_obj, ...}]    │                        │
│←──────data: merchants_array────────────┘                        │
│                                                                  │
│  Frontend:                                                       │
│  setMerchants(mapped_data) ← Update from API! ✅              │
│  setLoading(false)                                              │
│  setActiveTab("merchants")                                      │
│                                                                  │
│  Component re-renders with FRESH data ✅                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  STEP 3: User refreshes page                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Browser refresh → state cleared ✅                              │
│       │                                                            │
│       ▼                                                            │
│  App.tsx useEffect triggers                                      │
│       │                                                            │
│       └─→ GET /hunters/me/merchants ← Same query as Step 2!  │
│           │                                                       │
│           └─→ Backend fetches fresh data from database ✅       │
│               │                                                   │
│               └─→ Returns same merchant because it's in DB! ✅  │
│                   │                                               │
│                   └─→ setMerchants(data) updates state ✅       │
│                       │                                           │
│                       ▼                                           │
│                   Merchant still visible! ✅                     │
│                   DATA PERSISTS! 🎉                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Key Tables)

```
TABLE: merchant_hunters
┌─────────────────────────────────┐
│  id: STRING (PRIMARY KEY)       │
│  email: STRING (UNIQUE)         │
│  firstName: STRING              │
│  lastName: STRING              │
│  phone: STRING                 │
│  password: STRING (hashed)     │
│  region: STRING                │
│  createdAt: DATETIME           │
│  updatedAt: DATETIME           │
└─────────────────────────────────┘
         ▲
         │ (is linked to merchants via)
         │
     ┌───┴────────────────────────────┐
     │                                │
TABLE: merchant_hunter_merchants       │
┌───────────────────────────────────┐ │
│  id: STRING (PRIMARY KEY)         │ │
│  merchantHunterId: STRING (FK) ───┼─┘
│  merchantId: STRING (FK) ─────┐   │
│  status: STRING               │   │
│  onboardingStartedAt: DATETIME│   │
│  onboardingDaysElapsed: INT   │   │
│  createdAt: DATETIME          │   │
│  updatedAt: DATETIME          │   │
│                               │   │
│  UNIQUE(merchantHunterId,     │   │
│         merchantId)          │   │
│  INDEX(merchantHunterId) ✅  │   │
└───────────────────────────────────┘│
                                 │
         ┌───────────────────────┘
         │ (points to)
         │
         ▼
TABLE: merchants
┌──────────────────────────────┐
│  id: STRING (PRIMARY KEY)    │
│  businessName: STRING        │
│  ownerName: STRING          │
│  email: STRING (UNIQUE)     │
│  phone: STRING              │
│  businessType: STRING       │
│  businessAddress: STRING    │
│  password: STRING (hashed)  │
│  status: STRING             │
│  createdAt: DATETIME        │
│  updatedAt: DATETIME        │
└──────────────────────────────┘

TABLE: merchant_activity_logs
┌──────────────────────────────────┐
│  id: STRING (PRIMARY KEY)        │
│  merchantId: STRING (FK) ───┐    │
│  merchantHunterId: STRING ──┼──┐ │ (Who did it)
│  action: STRING             │  │ │ (REGISTERED, APPROVED, etc)
│  description: STRING        │  │ │
│  performedByRole: STRING    │  │ │
│  performedByIp: STRING      │  │ │
│  createdAt: DATETIME        │  │ │
│  updatedAt: DATETIME        │  │ │
│                             │  │ │
│  INDEX(merchantId) ✅       │  │ │
│  INDEX(merchantHunterId) ✅ │  │ │
└──────────────────────────────────┘
         ▲                      ▲
         │                      │
         └──────┬───────────────┘
                │
      (audit trail for each merchant)
```

---

## API Query Comparison

### BEFORE (Broken)
```typescript
// Frontend state
const [merchants, setMerchants] = useState<Merchant[]>([])

// On registration
const addMerchant = (newMerchant) => {
  setMerchants([newMerchant, ...merchants])  // ❌ Local state only
}

// On refresh: state cleared, merchant gone ❌
```

### AFTER (Fixed)
```typescript
// GET /api/v1/hunters/me/merchants endpoint
router.get('/me/merchants', async (req) => {
  const currentHunterId = req.user.id  // From token
  
  // ✅ Query database, not local state
  const merchants = await db.merchantHunterMerchant.findMany({
    where: { merchantHunterId: currentHunterId },  // ✅ FILTERING!
    include: { merchant: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return { success: true, data: merchants }
})

// Frontend always syncs with this endpoint
const addMerchant = () => {
  const data = await fetch('/api/v1/hunters/me/merchants', {
    headers: { Authorization: `Bearer ${token}` }
  })
  setMerchants(data.merchants)  // ✅ From database
}

// On refresh: fetches again, merchant still there ✅
```

---

## Data Isolation Guarantee

```
Three Hunters, Five Merchants

    Hunter A              Hunter B              Hunter C
   (token_a)            (token_b)            (token_c)
       │                    │                    │
       ├── calls API ──┐    │                    │
       │               │    │                    │
       │               ▼    │                    │
       │         Extract hunterID = A             │
       │               │    │                    │
       │               ▼    │                    │
       │         Query WHERE merchantHunterId = A │
       │               │    │                    │
       │               ▼    │                    │
       │         Result: [merchant_1, merchant_2]│
       │               │    │                    │
       │◄──────────────┘    │                    │
       │                    │                    │
       │                    ├── calls API ──┐    │
       │                    │               │    │
       │                    │               ▼    │
       │                    │         Extract hunterID = B
       │                    │               │    │
       │                    │               ▼    │
       │                    │         Query WHERE merchantHunterId = B
       │                    │               │    │
       │                    │               ▼    │
       │                    │         Result: [merchant_3, merchant_4]
       │                    │               │    │
       │                    │◄──────────────┘    │
       │                    │                    │
       │                    │                    ├── calls API ──┐
       │                    │                    │               │
       │                    │                    │               ▼
       │                    │                    │         Extract hunterID = C
       │                    │                    │               │
       │                    │                    │               ▼
       │                    │                    │         Query WHERE merchantHunterId = C
       │                    │                    │               │
       │                    │                    │               ▼
       │                    │                    │         Result: [merchant_5]
       │                    │                    │               │
       │                    │                    │◄──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
    Shows:               Shows:               Shows:
    • merchant_1 ✅     • merchant_3 ✅     • merchant_5 ✅
    • merchant_2 ✅     • merchant_4 ✅

PERFECT ISOLATION! Each hunter sees ONLY their merchants!
```

---

## Summary: Problem → Solution

```
❌ PROBLEM (Before)
├─ Merchant created, but no relationship record
├─ Frontend used local state (not database)
├─ On refresh, local state cleared → merchant gone
├─ No filtering → merchants visible to all hunters
└─ No audit trail


✅ SOLUTION (After)
├─ Merchant created + relationship record + activity log
├─ Frontend syncs with API (database-backed)
├─ On refresh, API fetch gets fresh data → merchant persists
├─ Database query filtered by hunterID → proper isolation
└─ Activity logs record all registrations

KEY CHANGES:
1. Backend: Extract hunterID from token
2. Backend: Create merchant_hunter_merchants record
3. Backend: Filter API by hunterID
4. Frontend: Fetch from API instead of local state
5. Frontend: Pass hunterToken to registration form

RESULT: 🎉 Persistent, isolated, audited merchant tracking!
```

---

This visual architecture makes it clear why the fix works:
- **Database is source of truth** (not frontend memory)
- **Relationships enforce data ownership** (each hunter owns their merchants)
- **API filtering ensures isolation** (only return YOUR merchants)
- **Activity logs provide accountability** (who did what when)

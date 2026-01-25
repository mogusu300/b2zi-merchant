# 🎯 EXPECTED VS ACTUAL - Know If It's Working

## ✅ SUCCESSFUL FLOW - What You Should See

### Registration Complete Scenario

**Browser Console Output:**
```
[PWA] Submitting merchant registration
[PWA] Token available: true
[PWA] Token (first 20 chars): eyJhbGciOiJIUzI1NiI...
[PWA] Sending request to: http://localhost:5000/api/v1/merchants/onboard
[PWA] Request headers: {Authorization: "Bearer eyJ...", Content-Type: "application/json"}
[PWA] Response status: 201
[PWA] Response data: {"success":true,"data":{"id":"<uuid>","businessName":"Test Store",...}}
[PWA] Merchant created successfully: <merchant-id>
[PWA] Calling onSubmit with merchant
[APP] addMerchant called with: {id: "<uuid>", businessName: "Test Store", ...}
[APP] Set loading to true, starting API fetch...
[APP] hunterToken exists and is: eyJ...
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Response status: 200
[APP] Response data: {"success":true,"data":[{"merchantHunterMerchantId":"<uuid>","merchant":{"id":"<uuid>","businessName":"Test Store",...}}]}
[APP] Got merchants array with 1 items
[APP] Mapped 1 merchants from response
[APP] State updated with 1 merchants
```

**What You See in UI:**
- ✅ Merchant appears in list immediately
- ✅ Name, email, status visible
- ✅ Can refresh - merchant still there

**Database State:**
```
merchants table:
  id: <uuid>
  businessName: "Test Store"
  email: "john@test.com"
  status: "active"
  ✅ Record exists

merchant_hunter_merchants table:
  merchantHunterId: <hunter-id>
  merchantId: <uuid>
  status: "active"
  ✅ Relationship exists - THIS IS CRITICAL!

merchant_activity_logs table:
  action: "REGISTERED"
  description: "Merchant registered by hunter"
  merchantHunterId: <hunter-id>
  ✅ Log entry exists
```

---

## ❌ SCENARIO 1: Token Not Available

**Browser Console Output:**
```
[PWA] Submitting merchant registration
[PWA] Token available: false  ← ❌ PROBLEM HERE
[PWA] ERROR: No token available!
```

**What Happens:**
- Registration form fails silently
- Merchant NOT created in database
- No error message shown to user

**Fix:**
1. Check if hunter is logged in
2. Check if `hunterToken` exists in localStorage
3. Verify App.tsx is passing `hunterToken={hunterToken}` to OnboardingForm

**Code Check:**
```typescript
// In App.tsx
<OnboardingForm 
  onSubmit={addMerchant} 
  hunterToken={hunterToken}  // ← Should be here!
/>
```

---

## ❌ SCENARIO 2: Backend Returns 500 Error

**Browser Console Output:**
```
[PWA] Submitting merchant registration
[PWA] Token available: true
[PWA] Sending request to: http://localhost:5000/api/v1/merchants/onboard
[PWA] Response status: 500  ← ❌ ERROR
[PWA] ERROR: Response not ok: 500
[PWA] ERROR details: {"message":"Internal server error","error":"..."}
```

**What Happens:**
- Form shows error message
- Merchant NOT created
- Data NOT in database

**Check:**
1. Is backend running? `curl http://localhost:5000/api/v1/status`
2. Check backend logs for error
3. Is JWT_SECRET set? `echo $JWT_SECRET`

**Database State:**
```
merchants table: Empty ❌
merchant_hunter_merchants: Empty ❌
merchant_activity_logs: Empty ❌
```

---

## ❌ SCENARIO 3: Merchant Created But Relationship Missing

**Browser Console Output:**
```
[PWA] Submitting merchant registration
[PWA] Token available: true
[PWA] Response status: 201
[PWA] Merchant created successfully: <id>  ← Looks good...
[PWA] Calling onSubmit with merchant

[APP] addMerchant called with...
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Response status: 200
[APP] Response data: {"success":true,"data":[]}  ← ❌ EMPTY!
[APP] Got merchants array with 0 items  ← Should be 1!
[APP] Mapped 0 merchants from response
[APP] State updated with 0 merchants
```

**What Happens:**
- User sees "Merchant created" message
- But merchant DOESN'T appear in list
- Refresh confirms merchant is gone

**Database State:**
```
merchants table:
  ✅ Record EXISTS - merchant was created

merchant_hunter_merchants table:
  ❌ EMPTY! - Relationship NOT created!
  
merchant_activity_logs table:
  ❌ EMPTY! - No log entry
```

**Diagnosis:**
Backend code changes NOT deployed! The backend is still running OLD code that doesn't create the relationship.

**Solution:**
1. Check backend code has this in merchants.onboard.ts:
```typescript
// Extract hunter from token
const token = authHeader.split(' ')[1]
const decoded = jwt.decode(token) as any
const hunterId = decoded?.userId

// Create relationship ← THIS MUST BE HERE!
const merchantHunterMerchant = await prisma.merchantHunterMerchant.create({
  data: {
    merchantHunterId: hunterId,
    merchantId: merchant.id,
    status: 'active',
  }
})
```

2. Restart backend: `npm run dev`

---

## ❌ SCENARIO 4: Merchant Appears But Disappears on Refresh

**Browser Console Output (Before Refresh):**
```
[PWA] Merchant created successfully: <id>
[APP] State updated with 1 merchants
```

**User sees:** Merchant in list ✅

**After F5 Refresh:**
```
[APP useEffect] Fetching merchants for hunter...
[APP useEffect] Response status: 200
[APP useEffect] Response data: {"success":true,"data":[]}  ← ❌ EMPTY!
[APP useEffect] Got 0 merchants from API
[APP useEffect] Setting merchants to empty array
```

**User sees:** Merchant GONE ❌

**Database State:**
```
merchants table: ✅ Record exists
merchant_hunter_merchants: ❌ Missing
merchant_activity_logs: ❌ Missing
```

**Diagnosis:**
Relationship wasn't created when merchant was registered.

**Root Cause:**
Backend changes not applied/deployed.

---

## ❌ SCENARIO 5: API Returns Wrong Format

**Browser Console Output:**
```
[APP] Response data: {"merchants":[...]}  ← Wrong key!
[APP] ERROR: Mapping merchants: TypeError: Cannot read 'data' of undefined
[APP] State updated with 0 merchants  ← Falls back to empty
```

**Database State:**
```
Database has everything ✅ but frontend can't read it ❌
```

**Fix:**
Check API response format. Expected:
```json
{
  "success": true,
  "data": [  ← KEY IS "data"
    {
      "merchantHunterMerchantId": "...",
      "merchant": { ... }
    }
  ]
}
```

---

## 🔍 How to Know Which Scenario You're In

### Test 1: Check Backend Running
```bash
curl http://localhost:5000/api/v1/status
```

**Expected:** `{"status":"ok"}` or similar

**If fails:** Backend not running → Start it!

---

### Test 2: Check Merchant Created
```sql
SELECT COUNT(*) FROM merchants;
```

**Expected:** > 0 after registering

**If 0:** Backend didn't save → Scenario 2 (500 error)

---

### Test 3: Check Relationship Created
```sql
SELECT COUNT(*) FROM merchant_hunter_merchants;
```

**Expected:** > 0 after registering

**If 0:** Backend created merchant but not relationship → Scenario 3
**Solution:** Deploy backend code changes

---

### Test 4: Check API Response
```javascript
// In browser console
const token = localStorage.getItem('hunterToken')
fetch('/api/v1/hunters/me/merchants', {
  headers: {Authorization: `Bearer ${token}`}
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
```

**Expected:**
```json
{
  "success": true,
  "data": [
    {
      "merchantHunterMerchantId": "...",
      "merchant": {...}
    }
  ]
}
```

**If returns `[]`:** Relationship not created → Backend issue

---

## 📊 Decision Tree

```
Start: Register a merchant

Does merchant appear in list?
├─ NO
│  ├─ Check console for errors
│  ├─ Check Response status
│  │  ├─ 500 → Backend error (Scenario 2)
│  │  ├─ 401 → Token issue (Scenario 1)
│  │  └─ Other → Network issue
│  └─ Check database
│     └─ No merchant record → Request failed
│
└─ YES (merchant appears)
   └─ Refresh page
      ├─ Merchant still there?
      │  └─ YES → ✅ FIXED! Problem solved
      │
      └─ Merchant gone?
         ├─ Check database
         │  ├─ merchant_hunter_merchants empty? → Scenario 3
         │  └─ merchant_hunter_merchants has record? → API filtering issue
         │
         └─ Check API response
            └─ Returns 0 merchants? → Scenario 3 or 4
```

---

## ✅ Success Criteria

Your merchant tracking is **FIXED** when:

1. ✅ Register merchant → appears in list immediately
2. ✅ Refresh page → merchant STILL appears
3. ✅ Database has: merchants + merchant_hunter_merchants + activity_log
4. ✅ No console errors
5. ✅ API returns merchants: `"data":[{...}]` not `"data":[]`

---

## 🚀 Next Steps

1. **Run diagnostic:**
   ```bash
   node diagnose-merchant-tracking.js
   ```

2. **If all ✅:** Register a test merchant
3. **Check console:** Do you see all expected [APP] logs?
4. **Check database:** Do records exist?
5. **Refresh page:** Does merchant persist?

**Send me the answers and I'll know exactly how to fix it!** 🎯

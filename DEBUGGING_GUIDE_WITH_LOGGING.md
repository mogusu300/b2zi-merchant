# Merchant Tracking - Debugging Guide with Enhanced Logging

## 🔍 Comprehensive Logging Added

I've added **detailed console logging** to trace the entire merchant lifecycle. Here's how to use it:

---

## Step 1: Open Browser DevTools

**Chrome/Edge/Firefox:**
- Press `F12` or Right-click → Inspect
- Go to **Console** tab
- You should see logs starting with `[APP]`, `[PWA]`, `[MERCHANTS ONBOARD]`

---

## Step 2: Register a Merchant and Watch the Logs

### Expected Log Sequence:

**When form submits:**
```
[PWA] Submitting merchant registration
[PWA] API URL: http://localhost:5000
[PWA] Token available: true
[PWA] Token value: eyJhbGciOiJIUzI1NiIsIn...
[PWA] Authorization header set
[PWA] Sending request to: http://localhost:5000/api/v1/merchants/onboard
[PWA] Response status: 201
[PWA] Response data: {"success":true,"data":{"merchant":{"id":"...","businessName":"..."}}}
[PWA] Merchant created successfully: <merchant-id>
[PWA] Created merchant object: {id, name, owner, location, category, status, dateAdded}
[PWA] Calling onSubmit with merchant: ...
```

**When onSubmit triggers addMerchant():**
```
[APP] addMerchant called with: {id, name, owner, ...}
[APP] Set loading to true, starting API fetch...
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Using token: eyJhbGciOiJIUzI1NiIsIn...
[APP] Response status: 200
[APP] Response data: {"success":true,"data":[...]}
[APP] API returned X merchants
[APP] Mapped merchant: {id, name, owner, ...}
[APP] Final mapped merchants: [...]
[APP] State updated with X merchants
[APP] Fetch complete, loading set to false
[APP] Active tab set to merchants
```

---

## Step 3: Identify the Issue

### If merchants appear then disappear:

**Check:**
1. **Registration succeeds?** Look for `[PWA] Merchant created successfully`
2. **API fetch succeeds?** Look for `[APP] Response status: 200`
3. **Data returned?** Look for `[APP] API returned X merchants`
4. **State updated?** Look for `[APP] State updated with X merchants`

### Common Problems:

#### Problem 1: "Token available: false"
```
[PWA] Token available: false
```
**Solution**: Hunter token not being passed. Check that `hunterToken` prop is passed to OnboardingForm.

#### Problem 2: "Response status: 401"
```
[APP] Response status: 401
```
**Solution**: Token expired or invalid. Try re-logging in.

#### Problem 3: "API returned 0 merchants"
```
[APP] API returned 0 merchants
```
**Solution**: Backend didn't create the relationship. Check backend logs for errors.

#### Problem 4: "Unexpected response format"
```
[APP] Unexpected response format: {"error":"..."}
```
**Solution**: API returned error. Check backend logs for what went wrong.

---

## Step 4: Check Backend Logs

The backend also has logging in `merchants.onboard.ts`. Check for:

```
[MERCHANTS ONBOARD] Headers Content-Type: multipart/form-data
[MERCHANTS ONBOARD] Request received: {businessName, email, phone, ...}
[MERCHANTS ONBOARD] Hunter ID extracted from token: <hunter-id>
[MERCHANTS ONBOARD] Creating merchant in database
[MERCHANTS ONBOARD] Merchant created successfully: <merchant-id>
[MERCHANTS ONBOARD] MerchantHunterMerchant relationship created: <relationship-id>
[MERCHANTS ONBOARD] Activity log created for merchant registration
```

### Missing logs indicate:
- **No "[MERCHANTS ONBOARD]" logs** → Request not reaching backend
- **No "Hunter ID extracted"** → Token not being sent or invalid
- **No "relationship created"** → Backend code update not deployed
- **No "Activity log created"** → Activity log creation failing

---

## Step 5: Database Verification

After registration, verify in PostgreSQL:

```sql
-- Check merchant was created
SELECT id, businessName, email, status 
FROM merchants 
WHERE businessName = '<what-you-registered>';

-- Check hunter-merchant relationship was created
SELECT id, merchantHunterId, merchantId, status 
FROM merchant_hunter_merchants 
WHERE merchantId = '<merchant-id>';

-- Check activity log was created
SELECT id, merchantId, merchantHunterId, action 
FROM merchant_activity_logs 
WHERE merchantId = '<merchant-id>' AND action = 'REGISTERED';
```

**If you see results**: Data was saved ✅  
**If empty**: Data wasn't saved ❌

---

## Possible Issues & Solutions

### Issue 1: API Response Says Empty

```
[APP] API returned 0 merchants
[APP] Final mapped merchants: []
```

**Diagnosis**: Either:
1. Merchant wasn't created on backend
2. Relationship wasn't created
3. API is filtering correctly but hunter has no merchants

**Fix**:
1. Check database for merchant record
2. Check database for merchant_hunter_merchants record
3. Verify hunter ID matches

### Issue 2: API Response Shows Error

```
[APP] Response status: 500
```

**Diagnosis**: Backend error

**Fix**:
1. Check backend logs for error message
2. Check if database is accessible
3. Check if JWT_SECRET env var is set
4. Check if code changes were deployed

### Issue 3: Token Missing

```
[PWA] Token available: false
```

**Diagnosis**: hunterToken not passed to form or not in localStorage

**Fix**:
1. Verify hunterToken is passed as prop to OnboardingForm
2. Check localStorage: Open DevTools → Application → Local Storage
3. Look for key: `hunterToken`

### Issue 4: Wrong API URL

```
[APP] Fetching from: undefined/api/v1/hunters/me/merchants
```

**Diagnosis**: VITE_API_URL not set

**Fix**:
1. Create `.env.local` in frontend directory
2. Add: `VITE_API_URL=http://localhost:5000`
3. Restart frontend

---

## Complete Log Example (Success)

Here's what a SUCCESSFUL registration looks like:

```
[PWA] Submitting merchant registration
[PWA] API URL: http://localhost:5000
[PWA] Token available: true
[PWA] Token value: eyJhbGciOiJIUzI1NiIsI...
[PWA] Authorization header set
[PWA] Sending request to: http://localhost:5000/api/v1/merchants/onboard

[MERCHANTS ONBOARD] Headers Content-Type: multipart/form-data
[MERCHANTS ONBOARD] Request received: {businessName: "Test Store", ownerName: "John", email: "john@test.com", phone: "+263..."}
[MERCHANTS ONBOARD] Hunter ID extracted from token: abc-123-def-456
[MERCHANTS ONBOARD] Creating merchant in database
[MERCHANTS ONBOARD] Merchant created successfully: merchant-789
[MERCHANTS ONBOARD] MerchantHunterMerchant relationship created: rel-456
[MERCHANTS ONBOARD] Activity log created for merchant registration

[PWA] Response status: 201
[PWA] Response data: {"success":true,"data":{"merchant":{"id":"merchant-789",...}}}
[PWA] Merchant created successfully: merchant-789
[PWA] Created merchant object: {id: "merchant-789", name: "Test Store", ...}
[PWA] Calling onSubmit with merchant: {id: "merchant-789", ...}

[APP] addMerchant called with: {id: "merchant-789", name: "Test Store", ...}
[APP] Set loading to true, starting API fetch...
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Using token: eyJhbGciOiJIUzI1NiIsI...
[APP] Response status: 200
[APP] Response data: {"success":true,"data":[{"merchantId":"merchant-789",...}]}
[APP] API returned 1 merchants
[APP] Mapped merchant: {id: "merchant-789", name: "Test Store", status: "Pending", ...}
[APP] Final mapped merchants: [{id: "merchant-789", name: "Test Store", ...}]
[APP] State updated with 1 merchants
[APP] Fetch complete, loading set to false
[APP] Active tab set to merchants

>>> MERCHANT NOW VISIBLE IN LIST ✅
```

---

## Debugging Checklist

- [ ] Open browser DevTools (F12)
- [ ] Clear console (or filter for `[APP]`, `[PWA]`)
- [ ] Register a test merchant
- [ ] Watch console for logs
- [ ] **Check for errors** (red text)
- [ ] Verify log sequence matches expected
- [ ] Check response status is 200/201
- [ ] Check data returned from API is not empty
- [ ] Verify merchant appears in list
- [ ] Refresh page
- [ ] Check if merchant still there

---

## Testing Commands

### Check Backend is Running
```bash
curl http://localhost:5000/api/v1/hunters/me \
  -H "Authorization: Bearer <your-token>"
```

### Check Merchant List Endpoint
```bash
curl http://localhost:5000/api/v1/hunters/me/merchants \
  -H "Authorization: Bearer <your-token>"
```

### Check Database Directly
```sql
SELECT COUNT(*) as merchant_count 
FROM merchant_hunter_merchants 
WHERE merchantHunterId = '<hunter-id>';
```

---

## What to Tell Me When Issues Occur

When sharing logs, include:
1. **The full console output** from [PWA] through [APP]
2. **Any red error messages**
3. **Response status codes**
4. **What the API returned**
5. **Whether merchant appears or not**
6. **Whether it disappears on refresh**

---

## Summary

The logging will show you **exactly** where merchants are disappearing:
- ✅ If they appear → API is working
- ✅ If they disappear on refresh → Frontend not fetching from API
- ✅ If empty response → Backend relationship not created
- ✅ If error response → Check backend logs

**All issues are now visible in the console!** 🔍

# 🎯 MERCHANT TRACKING - FINAL DEBUGGING GUIDE

**Your Problem:** Merchants disappear on page refresh

**Why It's Happening:** Most likely because the backend code changes haven't been deployed yet, OR one of the components isn't set up correctly.

**How to Fix It:** Follow this step-by-step process to identify and fix the exact issue.

---

## 🚀 PHASE 1: Quick Setup Test (5 minutes)

### Step 1: Run the setup test
```bash
node test-setup.js
```

This will show you:
- ✅ Backend code changes are in place
- ✅ Frontend code changes are in place
- ✅ Backend is actually running

**If all show ✅:** Continue to Phase 2

**If any show ❌:** That's your problem! Fix it first:
- Code changes not in place? → Apply changes from provided code
- Backend not running? → `cd backend && npm run dev`

---

## 🔍 PHASE 2: Test the Flow (10 minutes)

### Step 1: Open DevTools Console
1. Open your PWA app
2. Press **F12**
3. Click **Console** tab
4. **Leave this open** during testing

### Step 2: Look for these messages already:

If you just loaded the page, you should see:
```
[APP useEffect] Fetching merchants for hunter...
[APP useEffect] Response status: 200
```

If you see errors → Look for RED text in console

### Step 3: Register a test merchant

Fill in the form:
- Business Name: `Test Store 123`
- Owner Name: `John Doe`
- Email: `john123@test.com`
- Phone: `+263700000000`
- Type: `Retail`
- Address: `123 Main St`
- Password: `TestPass123!`
- Upload ID/Document images

Click **Submit**

### Step 4: Watch the Console

**EXPECTED sequence:**
```
[PWA] Submitting merchant registration
[PWA] Token available: true
[PWA] Response status: 201
[PWA] Merchant created successfully: <id>
[APP] addMerchant called with: {name: "Test Store 123"...}
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Response status: 200
[APP] API returned 1 merchants
[APP] State updated with 1 merchants
```

---

## ✅ SCENARIO A: Success!

**If you see the sequence above AND merchant appears in list:**

Continue to Step 5: **Verify Persistence**

### Step 5: Refresh the page

1. Press **F5** or **Cmd+R**
2. Wait for page to load
3. Check if **merchant is STILL there** ✅

**If merchant persists after refresh:** 🎉 **PROBLEM FIXED!**

Proceed to [Final Verification](#final-verification)

---

## ❌ SCENARIO B: Merchant Appears But Disappears on Refresh

**Console shows all logs OK but merchant gone after refresh:**

**Root Cause:** The `useEffect` on page load is not fetching from API

**Check these things:**

### Check 1: Is useEffect running?

Look for on page load:
```
[APP useEffect] Fetching merchants...
```

**If YES** → Go to Check 2

**If NO** → useEffect not running
- Check App.tsx has `useEffect` on login
- Check dependencies include `[hunterToken]`

### Check 2: What's the API returning?

In console, run:
```javascript
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
      "merchant": {
        "id": "...",
        "businessName": "Test Store 123"
      }
    }
  ]
}
```

**If `"data": []` (empty):**
- Merchant created but **relationship wasn't created**
- Backend code changes NOT deployed
- **Fix**: Deploy backend code from `merchants.onboard.ts`

**If error like `Cannot read property`:**
- API response format is wrong
- Check expected response format above

---

## ❌ SCENARIO C: "Token available: false"

**Console shows:**
```
[PWA] Token available: false
```

**Root Cause:** Hunter authentication not passed to form

**Fix:**
Check App.tsx is passing token:
```typescript
<OnboardingForm 
  onSubmit={addMerchant}
  hunterToken={hunterToken}  // ← Must be here!
/>
```

If not there, add it.

---

## ❌ SCENARIO D: "Response status: 500"

**Console shows:**
```
[PWA] Response status: 500
```

**Root Cause:** Backend error

**Check backend logs:**
```bash
# In backend terminal, you should see the error
npm run dev
```

**Common causes:**
- `JWT_SECRET` not set → Add to `backend/.env`
- Database connection error → Check DATABASE_URL in .env
- File upload error → Check upload directory exists

---

## ❌ SCENARIO E: No Console Logs At All

**Console is completely empty, no [APP] or [PWA] logs:**

**Root Cause:** Code changes weren't applied

**What to check:**
1. Are all 3 files actually modified?
   - `backend/src/routes/merchants.onboard.ts`
   - `fieldprohararemerchantonboardingportal (1)/App.tsx`
   - `fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx`

2. Are changes actually deployed?
   - Backend: Did you restart after changes?
   - Frontend: Did you refresh browser?

3. Try opening console before registering:
   - Should see `[APP useEffect] Fetching merchants...`
   - If not → useEffect not running or logging not there

---

## 📊 Database Verification

After registering a merchant, verify data is actually in database:

```bash
# Connect to database
psql $DATABASE_URL

# Check merchant exists
SELECT id, businessName, email FROM merchants 
WHERE businessName = 'Test Store 123';

# Check relationship exists (CRITICAL!)
SELECT * FROM merchant_hunter_merchants 
WHERE merchantId = '<merchant-id-from-above>';

# Check activity log
SELECT action, description FROM merchant_activity_logs 
WHERE action = 'REGISTERED';
```

**Expected results:**
- ✅ 1 merchant row
- ✅ 1 relationship row (THIS IS THE KEY!)
- ✅ 1 activity log row

**If relationship is missing:** Backend code changes not working
- Verify merchants.onboard.ts has the relationship creation code
- Restart backend
- Retry registration

---

## 🎯 Complete Debugging Checklist

Complete each step to systematically identify the problem:

### Backend Setup
- [ ] `node test-setup.js` shows all ✅
- [ ] Backend running at localhost:5000
- [ ] `backend/.env` has DATABASE_URL
- [ ] `backend/.env` has JWT_SECRET
- [ ] Database is accessible

### Frontend Setup  
- [ ] App.tsx has proper imports
- [ ] App.tsx passes hunterToken to OnboardingForm
- [ ] OnboardingForm uses hunterToken in request
- [ ] Browser console shows logs when testing

### Merchant Registration
- [ ] Form submission triggers [PWA] logs
- [ ] Response status shows 201
- [ ] Merchant appears in list
- [ ] Console shows [APP] logs with API fetch

### Database Persistence
- [ ] Database has merchant record
- [ ] Database has merchant_hunter_merchants record
- [ ] API returns merchant in GET request
- [ ] Refresh shows merchant still there

### Final Verification
- [ ] Register merchant → appears ✅
- [ ] Refresh page → merchant persists ✅
- [ ] No console errors ✅
- [ ] All database records exist ✅

---

## 📞 What to Tell Me If Still Broken

If you're still stuck, tell me:

1. **Console output** when registering merchant:
   ```
   Copy exact text from console logs here
   ```

2. **What disappears:**
   - Does it never appear at all? OR
   - Does it appear then disappear on refresh?

3. **Database status:**
   ```sql
   SELECT COUNT(*) FROM merchants;
   SELECT COUNT(*) FROM merchant_hunter_merchants;
   ```

4. **Backend status:**
   - Is backend running?
   - Any errors in backend terminal?

5. **File confirmation:**
   - Did you apply ALL code changes to all 3 files?
   - Did you restart backend after changes?

With this info, I can pinpoint the exact issue! 🎯

---

## 🚨 Critical Points

**Remember these:**

1. **Database is source of truth**
   - Don't trust frontend state for persistence
   - Frontend MUST fetch from API

2. **Relationship is CRITICAL**
   - `merchant_hunter_merchants` record MUST be created
   - Without it, filtering returns empty array

3. **Code deployment matters**
   - Backend changes must be applied to source file
   - Backend must be restarted
   - Frontend must be refreshed/reloaded

4. **Logging is your friend**
   - Console logs show EXACTLY where it's breaking
   - Read the logs carefully!
   - Each [APP] and [PWA] message tells a story

---

## ✨ Success Definition

You've fixed it when:
1. ✅ Register merchant → appears in list
2. ✅ Refresh page → merchant STILL visible
3. ✅ No console errors
4. ✅ Database has all records
5. ✅ Can refresh multiple times → merchant persists

**That's it! System is working!** 🎉

---

## 📚 Additional Resources

- `DEBUG_STEP_BY_STEP.md` - Detailed step-by-step guide
- `EXPECTED_VS_ACTUAL.md` - Expected vs actual output
- `DEBUGGING_GUIDE_WITH_LOGGING.md` - Understanding logs

Run one of these for more details!

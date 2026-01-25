# 🔧 MERCHANT DISAPPEARING - STEP-BY-STEP DEBUG

You're saying merchants still disappear. Here's how to find **exactly** where the problem is.

---

## ✅ Step 1: Run the Diagnostic

```bash
node diagnose-merchant-tracking.js
```

This will tell you:
- ✅ Is backend running?
- ✅ Is database configured?
- ✅ Are code changes in place?

**If any show ❌, that's your problem!**

---

## 🔍 Step 2: Enable Console Logging

1. **Open your PWA app in browser**
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Leave it open while testing**

---

## 📝 Step 3: Register a Test Merchant

1. **Click "Onboard Merchant"**
2. **Fill in all fields:**
   - Business Name: `Test Store`
   - Owner Name: `John Doe`
   - Email: `john@test.com`
   - Phone: `+263700000000`
   - Type: `Retail`
   - Address: `123 Main St`
   - Password: `TestPass123!`
   - Upload any image files for ID

3. **Click Submit**

---

## 👀 Step 4: Check Console Logs

### You should see logs like:

```
[PWA] Submitting merchant registration
[PWA] Token available: true
[PWA] Response status: 201
[PWA] Merchant created successfully: <id>
[PWA] Calling onSubmit with merchant
[APP] addMerchant called with
[APP] Fetching from: http://localhost:5000/api/v1/hunters/me/merchants
[APP] Response status: 200
[APP] API returned 1 merchants
[APP] State updated with 1 merchants
```

### 🚨 If you see errors:

**Look for RED text in console!** These are errors.

Common ones:
- `"Failed to fetch"` → Backend not running
- `"401 Unauthorized"` → Token issue  
- `"500 Internal Server Error"` → Backend error
- `"Cannot read property 'data' of undefined"` → Bad response format

---

## 💾 Step 5: Verify Merchant Appears

1. **Check if merchant appears in list** ✅ or ❌?

- **If YES** → Proceed to Step 6
- **If NO** → Check console for errors (Step 4)

---

## 🔄 Step 6: Refresh the Page

1. **Press F5 or Cmd+R**
2. **Wait for page to load**
3. **Check if merchant is STILL THERE** ✅ or ❌?

### If STILL THERE ✅
**PROBLEM IS FIXED!** Merchants are persisting!

### If DISAPPEARED ❌
Check console again for:
1. `[APP useEffect] Fetching merchants` - Should show on page load
2. `[APP] Response status: 200` - Should return data
3. `[APP] API returned X merchants` - Should have your merchant

---

## 🗄️ Step 7: Check Database Directly

Run this SQL to verify data was saved:

```sql
-- Merchants table
SELECT id, businessName, email, status 
FROM merchants 
WHERE businessName = 'Test Store';

-- Relationship table
SELECT merchantHunterId, merchantId, status 
FROM merchant_hunter_merchants 
WHERE merchantId = '<merchant-id-from-above>';

-- Activity logs
SELECT action, description, merchantHunterId 
FROM merchant_activity_logs 
WHERE merchantId = '<merchant-id>';
```

**Expected results:**
- ✅ 1 row in merchants
- ✅ 1 row in merchant_hunter_merchants (THE KEY!)
- ✅ 1 row in merchant_activity_logs with action='REGISTERED'

**If any are missing** → Backend code changes not deployed or not working

---

## 🚨 Troubleshooting Based on What You See

### Issue 1: "Token available: false"

```
[PWA] Token available: false
```

**Problem**: Hunter token not being passed

**Solution**:
1. Open DevTools → Application → Local Storage
2. Check for key: `hunterToken`
3. If missing → Hunter didn't log in properly
4. If present → Check App.tsx is passing to OnboardingForm

---

### Issue 2: "Response status: 500"

```
[PWA] Response status: 500
```

**Problem**: Backend error during merchant creation

**Check backend logs** for error message. Common causes:
- JWT_SECRET not set
- Database error
- File upload issue

**Solution**:
```bash
# In backend directory
echo "JWT_SECRET=your-secret-here" >> .env
npm run dev
```

---

### Issue 3: "API returned 0 merchants"

```
[APP] API returned 0 merchants
```

**Problem**: Merchant was created but relationship wasn't

**Solution**:
1. Check database - is merchant_hunter_merchant record created?
2. If NO → Backend code update not deployed
3. If YES → Check filtering logic

---

### Issue 4: "Cannot read property 'merchant' of undefined"

```
Uncaught TypeError: Cannot read property 'merchant' of undefined
```

**Problem**: API response format unexpected

**Solution**:
1. Check what the API is actually returning
2. In console, add temporary code:
```javascript
fetch('/api/v1/hunters/me/merchants', 
  {headers: {Authorization: 'Bearer YOUR_TOKEN'}})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

---

### Issue 5: Merchant disappears on refresh

**Check sequence:**
1. Register merchant → appears ✅
2. Refresh page → *Check console*
3. Should see `[APP useEffect] Fetching merchants`
4. Should see `[APP] Response status: 200`
5. Should see `[APP] API returned 1 merchants`

**If step 3-5 don't appear:**
- useEffect not running on page load
- API call not being made
- Check App.tsx useEffect dependency

---

## 📋 Complete Debugging Checklist

- [ ] Diagnostic script passes all checks
- [ ] Backend running at localhost:5000
- [ ] Database configured and accessible
- [ ] Code changes deployed (all 3 files)
- [ ] Console open while testing
- [ ] Register merchant and check logs
- [ ] Merchant appears in list
- [ ] Refresh page
- [ ] Merchant still visible
- [ ] Check database for records
- [ ] Check merchant_hunter_merchants exists
- [ ] Check activity log created

---

## 🎯 What to Send Me

If you're still having issues, send me:

1. **Console output** - Copy all [APP] and [PWA] logs
2. **Error message** - Any red text in console
3. **API response** - What did /hunters/me/merchants return?
4. **Database query results** - Do records exist?
5. **File status** - Are code changes deployed?

---

## 🔐 Quick Commands to Test

**Check backend:**
```bash
curl http://localhost:5000/api/v1/status
```

**Check specific endpoint:**
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://localhost:5000/api/v1/hunters/me/merchants
```

**Check database:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM merchant_hunter_merchants;"
```

---

## ✨ Summary

The logging will show you **exactly** where it's breaking:

1. **If [PWA] logs show success but [APP] logs show 0 merchants** → Backend not creating relationship
2. **If [APP] logs show error** → API endpoint not working
3. **If merchant appears but disappears on refresh** → useEffect not fetching
4. **If database is empty** → Backend code changes not deployed

**Run the diagnostic, check the logs, and you'll find the issue!** 🔍

---

**Next Step**: Run `node diagnose-merchant-tracking.js` and tell me what it shows!

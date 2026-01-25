# Token Expiration Fix - Testing Checklist

## 🎯 Quick Summary
Your JWT token was **EXPIRED** during merchant registration. The backend rejected it, so merchants were created without a hunter relationship → **DISAPPEARED ON REFRESH**.

**Fix**: Added automatic token refresh before API calls ✅

## ✅ Frontend Compilation Status
```
✅ NO ERRORS - Frontend compiled successfully!
✅ Server running on http://localhost:3001/
```

## 📋 Testing Steps

### Phase 1: Verify Login Works
**Current Status**: ⏳ NOT YET TESTED

1. Open http://localhost:3001/ in browser
2. Should see LOGIN page (not dashboard) ✅
3. Click "Hunter Login"
4. Enter your hunter credentials
5. After login:
   - Should see dashboard
   - Profile should show your name
   - Should see "Welcome, [Your Name]"
6. **Check browser console** (F12 → Console tab):
   ```
   [APP] Hunter token restored from localStorage
   ```

**Expected Result**: ✅ You're logged in and can see the dashboard

---

### Phase 2: Test Merchant Registration
**Current Status**: ⏳ NOT YET TESTED

1. Click "Onboard Merchant" tab
2. Fill in merchant details:
   - Business Name: `Test Merchant`
   - Owner Name: `Test Owner`
   - Email: `test@example.com`
   - Phone: `+260123456789`
   - Business Type: `Retail`
   - Address: `Test Address`
3. Click "Next Step"
4. Upload ID documents (front and back)
5. Click "Submit"

**Check Browser Console** (F12 → Console):
```
[PWA] Token available: true
[PWA] ✅ Token is valid
[PWA] Submitting merchant registration
[PWA] Authorization header set
[PWA] Sending request to: http://localhost:5000/api/v1/merchants/onboard
```

**Check Backend Console** (terminal with backend server):
```
[MERCHANTS ONBOARD] Authorization header: YES
[MERCHANTS ONBOARD] Token found: true
[MERCHANTS ONBOARD] Token decoded, type: HUNTER, id: <hunter-id>
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <hunter-id>
[MERCHANTS ONBOARD] Creating merchant in database
[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created
[MERCHANTS ONBOARD] ℹ️  Activity log created
```

**Expected Result**: ✅ Merchant appears in merchant list with "Pending" status

---

### Phase 3: Test Merchant Persistence
**Current Status**: ⏳ NOT YET TESTED

1. After merchant is created, you should see it in the merchants list
2. **Press F5** (refresh page)
3. Should see login page, then automatically logged back in
4. Merchant should **STILL BE VISIBLE** in the list

**Check Browser Console**:
```
[APP] Hunter token restored from localStorage
[APP useEffect] Fetching merchants for hunter
[APP useEffect] ✅ Token is valid
[APP useEffect] Response status: 200
[APP useEffect] Got 1 merchants from API
```

**Expected Result**: ✅ Merchant persists after page refresh (NO LONGER DISAPPEARS!)

---

### Phase 4: Test Token Expiration Handling (Optional)
**Current Status**: ⏳ OPTIONAL TEST

To test what happens when token expires:

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find `hunterToken` entry
4. **Delete** the `hunterToken` (keep `hunterRefreshToken`)
5. Try to onboard another merchant

**Expected Behavior**:
```
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[TOKEN MANAGER] Attempting to refresh hunter token...
[TOKEN MANAGER] ✅ Token refreshed successfully
[PWA] ✅ Token refreshed successfully
[PWA] ✅ Token is valid
```

Then merchant registration proceeds normally.

---

## 🔧 What Changed

### 1. New File: `lib/tokenManager.ts`
- Decodes JWT and checks expiration
- Automatically refreshes token using refresh token
- Returns valid token or forces logout

### 2. Updated: `components/OnboardingForm.tsx`
- Before submitting form, checks if token is expired
- If expired, automatically refreshes
- Only sends request if valid token available

### 3. Updated: `App.tsx`
- Before fetching merchants, checks token expiration
- If expired, automatically refreshes
- If refresh fails, forces logout

---

## 📊 How Token Refresh Works

```
User tries to register merchant
    ↓
Check: Is token expired?
    ├─ YES → Refresh token using refresh token
    │         ├─ Refresh succeeds → Use new token ✅
    │         └─ Refresh fails → Show error, require login ❌
    └─ NO → Use current token ✅
    ↓
Send request with valid token to backend
    ↓
Backend extracts hunterId from token ✅
    ↓
Creates merchant-hunter relationship ✅
    ↓
Merchant persists on page refresh ✅
```

---

## 🔍 Important Console Logs to Watch For

### ✅ Success Indicators
```
[TOKEN MANAGER] ✅ Token is valid for ~59 more minutes
[PWA] ✅ Token is valid
[APP useEffect] ✅ Token is valid
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <id>
```

### ⚠️ Warning Indicators
```
[TOKEN MANAGER] ⚠️  Token will expire soon (within 5 minutes)
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[APP useEffect] ⚠️  Token expired or expiring soon, attempting refresh...
```

### ❌ Error Indicators
```
[TOKEN MANAGER] ❌ Token is EXPIRED
[TOKEN MANAGER] ❌ Token refresh failed: <error>
[PWA] ❌ Token refresh failed - cannot proceed
[APP useEffect] ❌ Token refresh failed - clearing session
[MERCHANTS ONBOARD] ❌ Failed to extract hunter ID from token: jwt expired
```

---

## 🚨 If Something Goes Wrong

### Problem: Still Seeing "jwt expired" Error
**Solution**:
1. Check if backend is running: `npm run dev` in `/backend` folder
2. Check if frontend is running: `npm run dev` in frontend folder
3. Clear localStorage: F12 → Application → Local Storage → delete all
4. Refresh page and login again

### Problem: Token Refresh Fails
**Solution**:
1. Check if `hunterRefreshToken` exists in localStorage
2. Check backend logs for error message
3. Try logging out and logging back in

### Problem: Merchant Still Disappears
**Solution**:
1. Check backend logs during registration for:
   - `✅ VALID HUNTER ID extracted` (if missing, token issue)
   - `✅ MerchantHunterMerchant relationship created` (if missing, DB issue)
2. Check frontend console for token-related errors
3. Verify merchant was actually created: check database

---

## ✨ The Main Fix in Plain English

**Before**: 
- Token expires → App doesn't notice → Sends expired token → Backend rejects it → Merchant has no hunter → Disappears on refresh

**After**:
- Token is about to expire → App checks before sending request → App automatically refreshes token → App sends valid token → Backend accepts it → Merchant has hunter → Persists on refresh ✅


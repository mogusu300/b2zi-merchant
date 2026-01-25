# 🎯 Token Expiration Fix - Action Plan

## ✅ Completed
- [x] Identified root cause: **Token was EXPIRED but frontend didn't check**
- [x] Created Token Manager utility (`lib/tokenManager.ts`)
- [x] Updated OnboardingForm to check token before submitting
- [x] Updated App.tsx to check token before fetching merchants
- [x] Frontend compiled successfully with NO ERRORS
- [x] Backend is running and ready
- [x] Created comprehensive documentation

## ⏳ Next: Your Testing (Critical)

### Test #1: Verify Login Works ✅
**Duration**: 2 minutes
**Importance**: HIGH

```
1. Go to http://localhost:3001/
2. Click "Hunter Login"
3. Enter your hunter credentials
4. Should see dashboard after login
```

**Success Indicators**:
- ✅ Dashboard loads
- ✅ Profile shows your name
- ✅ Merchant list is visible

**If fails**: Check if backend is running (`http://localhost:5000`)

---

### Test #2: Register Merchant ✅
**Duration**: 5 minutes
**Importance**: HIGH

```
1. Click "Onboard Merchant" tab
2. Fill form:
   - Business Name: "Test Business"
   - Owner: "Test Owner"
   - Email: "test@example.com"
   - Phone: "+260123456789"
   - Business Type: "Retail"
   - Address: "Test Address"
3. Click "Next Step"
4. Upload ID documents (front & back)
5. Click "Submit"
```

**Success Indicators in Browser Console** (F12):
```
[PWA] Token available: true
[PWA] ✅ Token is valid
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted
```

**Success Indicators in Backend Console**:
```
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <id>
[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created
```

**Expected Result**: Merchant appears in list with "Pending" status

**If fails with "jwt expired"**:
- Means your token expired DURING the 5 minutes
- New code should have auto-refreshed it
- Check browser console for refresh logs

---

### Test #3: Verify Persistence (THE KEY TEST!) ✅
**Duration**: 1 minute
**Importance**: CRITICAL - This proves the fix works!

```
1. Merchant is in list (from Test #2)
2. Press F5 to refresh page
3. Should auto-login
4. Merchant should STILL BE VISIBLE
```

**Success Indicators**:
- ✅ Page refreshes
- ✅ Auto-login happens (no manual login needed)
- ✅ **Merchant is still visible** (NOT gone)

**If merchant disappears**:
- Means relationship wasn't created
- Check backend logs for "❌ Failed to extract hunter ID"
- Likely caused by token expiration

---

## 📊 Status Dashboard

```
┌─────────────────────────────────────────┐
│ SYSTEM STATUS                           │
├─────────────────────────────────────────┤
│ ✅ Backend: RUNNING (port 5000)         │
│ ✅ Frontend: RUNNING (port 3001)        │
│ ✅ Code: COMPILED (no errors)           │
│ ✅ Token Manager: IMPLEMENTED           │
│ ⏳ Token Expiration: WAITING FOR TEST   │
│ ⏳ Merchant Persistence: WAITING FOR TEST│
└─────────────────────────────────────────┘
```

---

## 🔍 Debugging Guide

### If Test Fails: Check These Logs

#### Browser Console (F12 → Console tab)

**Good logs** (token valid):
```
[APP] Hunter token restored from localStorage
[TOKEN MANAGER] ✅ Token is valid for ~59 more minutes
[PWA] ✅ Token is valid
[APP useEffect] ✅ Token is valid
```

**Warning logs** (token needs refresh):
```
[TOKEN MANAGER] ⚠️  Token will expire soon (within 5 minutes)
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[APP useEffect] ⚠️  Token expired or expiring soon, attempting refresh...
```

**Error logs** (something wrong):
```
[TOKEN MANAGER] ❌ Token is EXPIRED
[PWA] ❌ Token refresh failed - cannot proceed
[APP useEffect] ❌ Token refresh failed - clearing session
```

#### Backend Console (terminal)

**Good logs** (merchant created with hunter):
```
[MERCHANTS ONBOARD] Authorization header: YES
[MERCHANTS ONBOARD] Token found: true
[MERCHANTS ONBOARD] Token decoded, type: HUNTER
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <id>
[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created
```

**Bad logs** (merchant created without hunter):
```
[MERCHANTS ONBOARD] ❌ Failed to extract hunter ID from token: jwt expired
[MERCHANTS ONBOARD] hunterId: 'unauthenticated'
[MERCHANTS ONBOARD] ⚠️  NO HUNTER - Cannot create relationship
```

---

## 🛠️ Troubleshooting

### Issue: "Login page doesn't load"
**Solution**:
1. Check frontend server: http://localhost:3001/ working?
2. Check backend server: `http://localhost:5000/api/v1/auth/hunter/login` responds?
3. Try clearing browser cache (Ctrl+Shift+Delete)

### Issue: "Login fails with error"
**Solution**:
1. Verify hunter credentials are correct
2. Check backend logs for error details
3. Check if database has hunter records

### Issue: "Merchant registration fails"
**Solution**:
1. Check browser console for token errors
2. Check backend logs for detailed error
3. Verify ID documents are uploaded
4. Verify all form fields are filled

### Issue: "Merchant disappears on refresh"
**Solution** (This is what we fixed!):
1. Check browser console for: `[TOKEN MANAGER] ❌ Token is EXPIRED`
2. If seen → token expiration not handled
3. Verify new code is deployed (refresh browser)
4. Check backend logs for: `❌ VALID HUNTER ID extracted`
5. If missing → relationship wasn't created

### Issue: "Token refresh fails"
**Solution**:
1. Check if `hunterRefreshToken` exists in localStorage
2. Check backend logs for `/auth/refresh` error
3. Try logout and login again
4. Check if backend is running

---

## 📝 Quick Reference

### Key Files
- Token Manager: `lib/tokenManager.ts`
- Form: `components/OnboardingForm.tsx`
- App: `App.tsx`

### Key Functions
- `isTokenExpired(token, 5)` - Check if expired
- `ensureHunterTokenValid()` - Get valid token (refresh if needed)
- `refreshHunterToken(refreshToken)` - Refresh from backend

### Key Endpoints
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3001`
- Refresh endpoint: `POST /api/v1/auth/refresh`
- Register merchant: `POST /api/v1/merchants/onboard`

---

## 🎓 What to Look For

### Success Pattern
```
User logs in → token stored → register merchant → 
token checked (valid) → sent to backend → 
merchant created with relationship → 
refresh page → merchant still visible ✅
```

### Failure Pattern (Before Fix)
```
User logs in → token stored → wait 1+ hour → register → 
token NOT checked (expired) → sent to backend → 
rejected → merchant has no hunter → refresh page → 
merchant disappears ❌
```

### New Success Pattern (After Fix)
```
User logs in → token stored → wait 1+ hour → register → 
token CHECKED (expired) → auto-refreshed → 
new token sent → merchant created with relationship → 
refresh page → merchant still visible ✅
```

---

## 📞 If You Need Help

1. **Check Console Logs First**
   - Browser: F12 → Console tab
   - Backend: Terminal where `npm run dev` is running

2. **Look for Specific Errors**
   - Search for "❌" in logs
   - Search for "ERROR" in logs
   - Search for "jwt expired" in logs

3. **Verify System State**
   - Is backend running? Check port 5000
   - Is frontend running? Check port 3001
   - Are tokens in localStorage? (F12 → Application → Local Storage)

4. **Test in Order**
   - Test 1: Login works
   - Test 2: Registration works
   - Test 3: Persistence works (critical!)

---

## 🎯 Expected Final Outcome

After successful testing:
- ✅ You login as hunter
- ✅ Register merchant (even after 1+ hour)
- ✅ Merchant appears in list
- ✅ Press F5 to refresh
- ✅ **Merchant is STILL visible** (doesn't disappear!)
- ✅ No more "merchants disappearing" issue! 🎉

---

## 📚 Documentation Created

For your reference:
- `TOKEN_EXPIRATION_FIX.md` - Complete technical explanation
- `TOKEN_EXPIRATION_QUICK_TEST.md` - Step-by-step testing guide
- `TOKEN_EXPIRATION_CODE_CHANGES.md` - Exact code changes made
- `TOKEN_EXPIRATION_VISUAL.md` - Visual diagrams and flows
- `TOKEN_EXPIRATION_SUMMARY.md` - Executive summary

---

## ⏰ Time Estimates

| Task | Time | Status |
|------|------|--------|
| Test Login | 2 min | ⏳ To Do |
| Test Registration | 5 min | ⏳ To Do |
| Test Persistence | 1 min | ⏳ To Do |
| **Total** | **8 min** | ⏳ |

---

## 🚀 Ready to Test?

1. ✅ Backend running on 5000?
2. ✅ Frontend running on 3001?
3. ✅ Have your hunter login credentials?
4. ✅ Browser opened to http://localhost:3001/?

**If yes to all → Go to Test #1 above! 🎯**


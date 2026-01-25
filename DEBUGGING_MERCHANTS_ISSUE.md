# Debugging Merchants Disappearing After Refresh

## Summary of Changes Made

I've added comprehensive debugging logs to help identify why merchants aren't showing after page refresh:

### 1. **Enhanced Logging in App.tsx**
- Added `[APP init-effect]` logs to track the initialization phase
- Added `[APP merchants-fetch-effect]` logs to track when the fetch effect runs
- More detailed logs showing token state and localStorage restoration

### 2. **Token Manager Verification**
- Token expiration checking is working
- Automatic token refresh is implemented
- All logs are shown in console

### 3. **Merchants Fetch Hook (useMerchantTracker)**
- Added token validation before API calls
- If token is expired, it automatically refreshes
- Comprehensive error logs if anything fails

## What to Do Next

### Step 1: Refresh the page and check the logs

1. Open the app in your browser
2. Press F12 to open DevTools
3. Click the **Console** tab
4. **Refresh the page** (F5)
5. Look for these log messages (in order):

```
[APP init-effect] Starting initialization...
[APP init-effect] Found hunterToken in localStorage? true
[APP] Hunter token restored from localStorage - token length: ...
[APP merchants-fetch-effect] Running...
[APP useEffect] Fetching merchants for hunter:
[APP useEffect] Response status: ...
[APP useEffect] Got X merchants from API
```

### Step 2: If you don't see the logs
- The browser might have lots of logs. Filter by typing in the search box: `[APP`
- Check if there are any error messages before those logs
- The issue might be that the initialization isn't happening

### Step 3: Run the diagnostic script

If the logs appear but merchants still don't show, copy the script below and paste it in the browser console:

**File location**: `/check-merchants-in-db.js`

This script will:
- Show your current token and hunter ID
- Decode your JWT token to check expiration
- Call the API directly
- Show exactly what merchants the API returns
- Tell you if merchants exist in the database

### Step 4: Check the Network tab

1. Open DevTools → Network tab
2. Refresh the page
3. Look for a request to: `/api/v1/hunters/me/merchants`
4. Click on it and check:
   - **Status**: Should be 200
   - **Response**: Should show merchants array
   - **Headers**: Check if Authorization header is present

## Possible Issues and Solutions

### Issue 1: No logs appear
- **Cause**: hunterToken not being restored from localStorage
- **Solution**: 
  - Check if you're actually logged in (look at localStorage in DevTools)
  - Check if browser has localStorage enabled
  - Try logging out and back in

### Issue 2: Logs appear but "Got 0 merchants"
- **Cause**: Merchants exist in database but not linked to your hunter
- **Solution**:
  - Register new merchants (should appear immediately)
  - Check if merchants were registered with your hunter ID
  - Run the diagnostic script to confirm

### Issue 3: API returns error status (not 200)
- **Cause**: Token is invalid or expired
- **Solution**:
  - Token refresh might be failing
  - Try logging out and back in
  - Check backend logs for auth errors

### Issue 4: Merchants appear during registration but disappear after refresh
- **Cause**: Merchants not being saved with correct hunter relationship
- **Solution**:
  - Check backend code - ensure merchant.hunterId is being set during registration
  - Run a database query to verify merchant.hunterId is populated
  - Check if token is expiring during registration

## Key Files Modified

1. **App.tsx** - Added detailed logging for initialization and fetch
2. **tokenManager.ts** - (Already had token validation)
3. **useMerchantTracker.ts** - (Already added token checks)

## Next Steps

1. ✅ Rebuild frontend (done)
2. **→ Refresh page and check console logs**
3. **→ Run diagnostic script if logs show but no merchants**
4. **→ Share console output or network tab info**

Then we can pinpoint exactly where the issue is!

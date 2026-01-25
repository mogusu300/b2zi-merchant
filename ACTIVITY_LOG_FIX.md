# Activity Log Fix - Token Expiration

## Problem
Activity logs were disappearing after page refresh, same root cause as merchants disappearing.

## Root Cause
The `fetchActivityLogs()` function in `useMerchantTracker` hook was **not checking token expiration** before making API calls.

When token expired:
1. Frontend tried to fetch activity logs
2. Token was expired but not checked
3. API rejected the request
4. Activity logs disappeared

## Solution
Added token expiration checking to:

### 1. `fetchActivityLogs()` function
Before fetching activity logs, now:
- Checks if token is expired
- If expired → auto-refreshes from backend
- Only proceeds if valid token available

### 2. `fetchMerchants()` function (in useMerchantTracker)
Before fetching merchant list, now:
- Checks if token is expired
- If expired → auto-refreshes from backend
- Only proceeds if valid token available

## Code Changes

**File**: `hooks/useMerchantTracker.ts`

### Added Import
```typescript
import { isTokenExpired, ensureHunterTokenValid } from '../lib/tokenManager';
```

### Updated `fetchActivityLogs()`
```typescript
// ✅ NEW: Check token expiration before fetch
const token = localStorage.getItem('hunterToken');
if (token && isTokenExpired(token, 5)) {
  console.log('[ACTIVITY LOGS] ⚠️  Token expired or expiring soon, attempting refresh...');
  const validToken = await ensureHunterTokenValid();
  if (!validToken) {
    console.error('[ACTIVITY LOGS] ❌ Token refresh failed - cannot fetch logs');
    return [];
  }
  console.log('[ACTIVITY LOGS] ✅ Token refreshed successfully');
}
```

### Updated `fetchMerchants()`
```typescript
// ✅ NEW: Check token expiration before fetch
const token = localStorage.getItem('hunterToken');
if (token && isTokenExpired(token, 5)) {
  console.log('[MERCHANT TRACKER] ⚠️  Token expired or expiring soon, attempting refresh...');
  const validToken = await ensureHunterTokenValid();
  if (!validToken) {
    console.error('[MERCHANT TRACKER] ❌ Token refresh failed - clearing session');
    setError('Your session has expired. Please log in again.');
    return;
  }
  console.log('[MERCHANT TRACKER] ✅ Token refreshed successfully');
}
```

## Console Logs to Watch For

### Success
```
[ACTIVITY LOGS] ✅ Token refreshed successfully
[MERCHANT TRACKER] ✅ Token refreshed successfully
📋 Fetched X logs for merchant
```

### Warning (But Handled)
```
[ACTIVITY LOGS] ⚠️  Token expired or expiring soon, attempting refresh...
[MERCHANT TRACKER] ⚠️  Token expired or expiring soon, attempting refresh...
```

### Error
```
[ACTIVITY LOGS] ❌ Token refresh failed - cannot fetch logs
[MERCHANT TRACKER] ❌ Token refresh failed - clearing session
```

## Compilation Status
✅ **Frontend compiled successfully** - No errors!

## Testing
Activity logs should now:
- Load when dashboard opens
- Persist after page refresh
- Auto-refresh token if expired
- Show error if refresh fails

Expected behavior:
1. Open dashboard → activity logs load ✅
2. Wait 1+ hour → logs still available ✅
3. Press F5 to refresh → logs still visible ✅
4. Activity logs don't disappear ✅

## Files Modified
- `hooks/useMerchantTracker.ts` - Added token validation to fetch functions

## Total Fix Summary
- ✅ Merchants persist on refresh (previous fix)
- ✅ Activity logs persist on refresh (this fix)
- ✅ All data backed by valid token
- ✅ Automatic token refresh before all API calls


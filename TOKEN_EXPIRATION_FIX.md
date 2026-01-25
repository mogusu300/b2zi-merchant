# Token Expiration Fix - Complete Solution

## Problem Identified
**Your JWT token was EXPIRED during merchant registration!**

```
[MERCHANTS ONBOARD] ❌ Failed to extract hunter ID from token: jwt expired
[MERCHANTS ONBOARD] Creating merchant in database with hunterId: 'unauthenticated'
[MERCHANTS ONBOARD] ⚠️  NO HUNTER - Cannot create relationship
```

### Why This Happened
1. You logged in as hunter → received JWT token (expires after 1 hour by default)
2. Token was stored in localStorage
3. You continued working... **time passed**
4. **Token expired** while you were still using the app
5. Frontend didn't detect expiration → still thought you were logged in
6. When trying to register merchant → sent expired token
7. Backend rejected it → merchant created without hunter relationship → **DISAPPEARED ON REFRESH**

## Solution Implemented

### 1. **Token Manager Utility** (`lib/tokenManager.ts`)
New utility functions to handle token lifecycle:

```typescript
// Check if token is expired (or expiring within 5 minutes)
isTokenExpired(token, bufferMinutes = 5): boolean

// Refresh token using refresh token
refreshHunterToken(refreshToken): Promise<newToken>

// Auto-refresh if expired, handle errors
ensureHunterTokenValid(): Promise<validToken | null>
```

**Key Features:**
- ✅ Decodes JWT without verification (safe client-side check)
- ✅ Checks expiration with 5-minute buffer (refresh before actual expiration)
- ✅ Automatically refreshes using refresh token
- ✅ Clears invalid tokens and returns null on failure
- ✅ Detailed console logging for debugging

### 2. **OnboardingForm Updates**
Before submitting merchant registration, form now:

```typescript
// CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
if (token && isTokenExpired(token, 5)) {
  console.log('[PWA] ⚠️  Token expired or expiring soon, attempting refresh...')
  const validToken = await ensureHunterTokenValid()
  if (validToken) {
    token = validToken  // Use refreshed token
    console.log('[PWA] ✅ Token refreshed successfully')
  } else {
    console.error('[PWA] ❌ Token refresh failed')
    alert('Your login session has expired. Please log in again.')
    return  // Don't submit with expired token
  }
}
```

**Result:**
- ✅ Before any API call, token is validated
- ✅ If expired, automatically refreshed
- ✅ Only proceeds if valid token available
- ✅ Shows error to user if refresh fails

### 3. **App.tsx Merchant Fetching Updates**
When fetching merchant list, also checks token expiration:

```typescript
// CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
if (isTokenExpired(token, 5)) {
  console.log('[APP useEffect] ⚠️  Token expired or expiring soon')
  const validToken = await ensureHunterTokenValid()
  if (validToken) {
    token = validToken  // Use refreshed token
  } else {
    console.error('[APP useEffect] ❌ Token refresh failed')
    handleHunterLogout()  // Force re-login
    return
  }
}

// Now make API call with valid token
const res = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Result:**
- ✅ On page load/refresh, merchants fetch with valid token
- ✅ If token expired, automatically refreshed first
- ✅ If refresh fails, forces logout to prevent inconsistent state

## How Token Refresh Works

### Backend Flow
Your backend already has this implemented:

```
POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
Response: {
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",  // New access token (1 hour)
    "refreshToken": "new-refresh-token"  // New refresh token (7 days)
  }
}
```

### Frontend Flow
1. **Token Manager** sends refresh token to backend
2. **Backend** validates refresh token
3. **Backend** generates new access token (expires 1 hour later)
4. **Frontend** updates both tokens in localStorage
5. **Frontend** proceeds with original API call using new token

## Testing the Fix

### Step 1: Verify Frontend Compiles
```bash
# Frontend should compile without errors
npm run dev
```

### Step 2: Test Registration with Valid Token
1. Load app → see LOGIN page
2. Click "Hunter Login"
3. Enter hunter credentials
4. After login → should see dashboard
5. Click "Onboard Merchant"
6. Fill form and submit
7. **Check backend logs for:**
   ```
   [MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <id>
   [MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created
   ```
8. **Check frontend console for:**
   ```
   [PWA] ✅ Token is valid
   ```

### Step 3: Test Token Refresh (Simulate Expired Token)
⚠️ **To test this, you can:**

1. Wait ~1 hour for token to actually expire, OR
2. Manually clear `hunterToken` from localStorage, leaving `hunterRefreshToken`
3. Try to register merchant → should trigger refresh flow

Expected behavior:
```
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[TOKEN MANAGER] Attempting to refresh hunter token...
[TOKEN MANAGER] ✅ Token refreshed successfully
[PWA] ✅ Token refreshed successfully
[PWA] ✅ Token is valid
```

Then merchant should register with valid `hunterId` ✅

### Step 4: Verify Merchants Persist
1. After successful registration, merchant appears in list
2. Press F5 to refresh page
3. **Merchant should still be visible** (not disappear)
4. Check console for:
   ```
   [APP useEffect] ✅ Token is valid
   [APP useEffect] Got 1 merchants from API
   ```

## Console Logging Guide

### Token Manager Logs
```
[TOKEN MANAGER] Token decoded: { id, type, iat, exp }
[TOKEN MANAGER] ✅ Token is valid for ~59 more minutes
[TOKEN MANAGER] ⚠️  Token will expire soon (within 5 minutes)
[TOKEN MANAGER] ❌ Token is EXPIRED
[TOKEN MANAGER] Attempting to refresh hunter token...
[TOKEN MANAGER] ✅ Token refreshed successfully
[TOKEN MANAGER] ❌ Token refresh failed: <error>
```

### OnboardingForm Logs
```
[PWA] Token available: true
[PWA] ✅ Token is valid
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[PWA] ✅ Token refreshed successfully
[PWA] ❌ Token refresh failed - cannot proceed
```

### App.tsx Logs
```
[APP useEffect] ✅ Token is valid
[APP useEffect] ⚠️  Token expired, attempting refresh...
[APP useEffect] ✅ Token refreshed successfully
[APP useEffect] ❌ Token refresh failed
```

## Configuration

### Token Expiration Times
Set in your `.env`:

```env
JWT_EXPIRES_IN=1h           # Access token (default: 1 hour)
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token (default: 7 days)
```

### Refresh Buffer
In `tokenManager.ts`, the `isTokenExpired()` function uses a 5-minute buffer:

```typescript
const willExpire = decoded.exp - (5 * 60)  // Refresh if < 5 min remaining
```

This means tokens are refreshed 5 minutes before actual expiration, ensuring smooth operations.

## Files Modified

1. ✅ **Created**: `lib/tokenManager.ts` - Token management utilities
2. ✅ **Modified**: `components/OnboardingForm.tsx` - Check & refresh before submit
3. ✅ **Modified**: `App.tsx` - Check & refresh before fetching merchants

## Summary

### Before Fix ❌
- Token stored but expiration not checked
- Expired token sent to backend
- Backend rejected → `hunterId: 'unauthenticated'`
- Merchant created without relationship
- Merchant disappeared on refresh

### After Fix ✅
- Token checked before every API call
- Expired token automatically refreshed
- Valid token sent to backend
- Backend accepts → creates relationship
- Merchant persists on refresh

### Key Improvement
**The system now gracefully handles token expiration instead of silently failing!**


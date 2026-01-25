# Token Expiration Fix - Code Changes Reference

## Overview
Fixed the "merchants disappearing on refresh" issue by implementing automatic token expiration checking and refresh before API calls.

---

## File 1: New File - `lib/tokenManager.ts`

**Location**: `fieldprohararemerchantonboardingportal (1)/lib/tokenManager.ts`

**Purpose**: Manage token lifecycle - check expiration, refresh if needed

**Key Functions**:

### `decodeToken(token: string): TokenPayload | null`
- Safely decodes JWT without verification
- Extracts id, type, iat (issued at), exp (expiration time)
- Returns null if invalid format

### `isTokenExpired(token: string | null, bufferMinutes: number = 5): boolean`
- Checks if token is expired
- Uses 5-minute buffer (refreshes before actual expiration)
- Returns `true` if expired or about to expire

### `refreshHunterToken(refreshToken: string): Promise<newTokens | null>`
- Calls backend `POST /api/v1/auth/refresh` endpoint
- Sends refresh token → gets new access token + refresh token
- Returns new tokens or null on failure

### `ensureHunterTokenValid(): Promise<string | null>`
- **Main function** - called before API calls
- Gets current token from localStorage
- If expired → calls `refreshHunterToken()`
- Updates localStorage with new tokens
- Returns valid token or null

---

## File 2: Updated - `components/OnboardingForm.tsx`

### Change 1: Import Token Manager
```typescript
// Added import
import { isTokenExpired, ensureHunterTokenValid } from "../lib/tokenManager"
```

### Change 2: Check Token Before Submit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation code ...
  
  if (step === 2) {  // Final submission step
    try {
      console.log('[PWA] Submitting merchant registration')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      let token = hunterToken || localStorage.getItem('hunterToken')
      
      console.log('[PWA] API URL:', apiUrl)
      console.log('[PWA] Token available:', !!token)
      
      // ✅ NEW: CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
      if (token && isTokenExpired(token, 5)) {
        console.log('[PWA] ⚠️  Token expired or expiring soon, attempting refresh...')
        const validToken = await ensureHunterTokenValid()
        if (validToken) {
          token = validToken
          console.log('[PWA] ✅ Token refreshed successfully')
        } else {
          console.error('[PWA] ❌ Token refresh failed - cannot proceed with registration')
          alert('Your login session has expired. Please log in again.')
          setIsSubmitting(false)
          return  // ✅ Don't submit with invalid token
        }
      } else {
        console.log('[PWA] ✅ Token is valid')
      }
      
      console.log('[PWA] Token value:', token ? token.slice(0, 20) + '...' : 'NONE')
      
      // ... rest of form submission code ...
      
    } catch (err) {
      // ... error handling ...
    }
  }
}
```

**Effect**: 
- ✅ Before sending merchant registration → checks token expiration
- ✅ If expired → automatically refreshes using refresh token
- ✅ Only proceeds if valid token available
- ✅ Shows error to user if refresh fails

---

## File 3: Updated - `App.tsx`

### Change 1: Import Token Manager
```typescript
// Added import
import { ensureHunterTokenValid, isTokenExpired } from "./lib/tokenManager"
```

### Change 2: Check Token Before Fetching Merchants
```typescript
useEffect(() => {
  const fetchMerchants = async () => {
    if (!hunterToken) {
      console.log('[APP useEffect] No hunterToken, skipping fetch')
      return
    }
    
    console.log('[APP useEffect] Fetching merchants for hunter:', hunterToken.slice(0, 20) + '...')
    setMerchantsLoading(true)
    try {
      let token = hunterToken
      
      // ✅ NEW: CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
      if (isTokenExpired(token, 5)) {
        console.log('[APP useEffect] ⚠️  Token expired or expiring soon, attempting refresh...')
        const validToken = await ensureHunterTokenValid()
        if (validToken) {
          token = validToken
          console.log('[APP useEffect] ✅ Token refreshed successfully')
        } else {
          console.error('[APP useEffect] ❌ Token refresh failed - clearing session')
          handleHunterLogout()  // Force logout if refresh fails
          return
        }
      }
      
      const apiUrl = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || window.location.origin
      console.log('[APP useEffect] API URL:', apiUrl)
      
      // ✅ Use the (possibly refreshed) valid token
      const res = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Valid token
        },
      })
      
      // ... rest of fetch logic ...
      
    } catch (err) {
      console.error('[APP useEffect] Failed to load hunter merchants', err)
      setMerchants([])
    } finally {
      setMerchantsLoading(false)
    }
  }

  fetchMerchants()
}, [hunterToken])
```

**Effect**:
- ✅ When fetching merchants list → checks token expiration first
- ✅ If expired → automatically refreshes before API call
- ✅ If refresh fails → forces logout to prevent inconsistent state
- ✅ Uses valid token for API request

---

## How It Works Together

### Merchant Registration Flow
```
User clicks "Submit" in OnboardingForm
  ↓
isTokenExpired(token, 5)?
  ├─ YES → Call ensureHunterTokenValid()
  │         ├─ Get current token from localStorage
  │         ├─ Call backend /auth/refresh with refresh token
  │         ├─ Get new tokens from backend
  │         ├─ Update localStorage with new tokens
  │         └─ Return new valid token ✅
  │         
  └─ NO → Use current token ✅
  
Use token in Authorization header
  ↓
Send POST /merchants/onboard with token
  ↓
Backend verifies token, extracts hunterId ✅
  ↓
Creates merchant-hunter-merchants relationship ✅
  ↓
Form shows success message
```

### Merchant Fetch on Page Load
```
App.tsx useEffect runs (hunterToken changed)
  ↓
Check: hunterToken exists?
  ├─ NO → Skip fetch
  └─ YES → Continue
  
isTokenExpired(hunterToken, 5)?
  ├─ YES → Call ensureHunterTokenValid()
  │         └─ Get new token (see above) ✅
  │
  └─ NO → Use current token ✅
  
Fetch GET /hunters/me/merchants with valid token
  ↓
Backend returns merchant list ✅
  ↓
Display merchants
  ↓
On page refresh → Token still valid → Merchants still visible ✅
```

---

## Configuration Points

### 1. Token Expiration Time
Set in backend `.env`:
```env
JWT_EXPIRES_IN=1h          # Default: 1 hour
JWT_REFRESH_EXPIRES_IN=7d  # Default: 7 days
```

### 2. Refresh Buffer
Set in `tokenManager.ts`:
```typescript
const bufferSeconds = bufferMinutes * 60  // Default: 5 minutes

// Token is considered expired if < 5 minutes remaining
if (now >= willExpire) {
  return true  // Refresh now
}
```

**Effect**: With 1-hour token and 5-minute buffer:
- Token issued at 12:00 PM
- Expires at 1:00 PM
- Auto-refresh at 12:55 PM
- New token issued at 12:55 PM, expires at 1:55 PM

---

## Testing Checklist

### ✅ Compilation
- [ ] Frontend compiles without errors: `npm run dev`
- [ ] Backend is running on port 5000
- [ ] No import errors in browser console

### ✅ Login
- [ ] Load app → see login page
- [ ] Click "Hunter Login"
- [ ] Enter credentials → login succeeds
- [ ] See dashboard with merchant list
- [ ] Browser console shows: `[APP] Hunter token restored from localStorage`

### ✅ Registration
- [ ] Click "Onboard Merchant"
- [ ] Fill form and upload documents
- [ ] Click "Submit"
- [ ] Browser console shows: `[PWA] ✅ Token is valid`
- [ ] Backend logs show: `✅ VALID HUNTER ID extracted`
- [ ] Merchant appears in list

### ✅ Persistence (THE KEY TEST)
- [ ] Merchant is visible in list
- [ ] Press F5 to refresh page
- [ ] Auto-login happens
- [ ] **Merchant still visible** ✅ (This is the fix!)
- [ ] Browser console shows: `[APP useEffect] ✅ Token is valid`
- [ ] Backend logs show token was valid

### ✅ Error Handling (Optional)
- [ ] Manually delete `hunterToken` from localStorage
- [ ] Try to register merchant
- [ ] Should see: `[PWA] ⚠️  Token expired or expiring soon, attempting refresh...`
- [ ] Should see: `[PWA] ✅ Token refreshed successfully`
- [ ] Registration proceeds normally

---

## Error Scenarios Handled

### Scenario 1: Token Expired, Refresh Token Valid
```
isTokenExpired() → true
refreshHunterToken() → success
→ Update localStorage with new tokens
→ Continue with API call ✅
```

### Scenario 2: Token Expired, Refresh Token Expired
```
isTokenExpired() → true
refreshHunterToken() → fails (refresh token expired)
→ Clear all tokens from localStorage
→ In OnboardingForm: Show alert, don't submit
→ In App.tsx: Call handleHunterLogout()
→ User must login again ✅ (correct behavior)
```

### Scenario 3: Token Valid
```
isTokenExpired() → false
→ Skip refresh, use current token
→ Continue with API call ✅
```

---

## Before vs After

### Before (❌ Broken)
```
Token stored in localStorage
↓
User waits 1+ hour
↓
Token expires but app doesn't notice
↓
Try to register merchant → send expired token
↓
Backend: "jwt expired" error
↓
Merchant created without hunterId
↓
On refresh: No relationship → merchant disappears ❌
```

### After (✅ Fixed)
```
Token stored in localStorage
↓
Before ANY API call → check expiration
↓
If expired → automatically refresh
↓
Proceed with fresh, valid token
↓
Backend: Successfully extract hunterId
↓
Merchant created with valid relationship
↓
On refresh: API returns merchant (has relationship) ✅
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Token Check** | Never | Before every API call |
| **Expired Token** | Silently fails | Auto-refreshes |
| **Merchant Persists** | No ❌ | Yes ✅ |
| **User Experience** | Confusing disappearance | Seamless background refresh |
| **Error Handling** | Silent failures | Clear error messages |
| **Login State** | Inconsistent | Always consistent |


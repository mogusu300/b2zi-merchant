# Token Expiration Fix - Visual Explanation

## 🔴 The Problem (Before Fix)

```
TIMELINE
├─ 12:00 PM: User logs in as hunter
│  └─ Receives JWT token (expires at 1:00 PM)
│  └─ Token stored in localStorage
│  └─ Frontend shows dashboard ✅
│
├─ 12:30 PM: User browsing dashboard
│  └─ Merchant list loads fine ✅
│
├─ 1:15 PM: User tries to register merchant
│  └─ Token EXPIRED at 1:00 PM ❌
│  └─ But app doesn't check! Still thinks logged in
│  └─ Sends registration with expired token
│  └─ Backend rejects: "jwt expired" ❌
│  └─ Merchant created with hunterId: 'unauthenticated'
│  └─ NO merchant-hunter relationship created ❌
│
└─ 1:16 PM: User refreshes page
   └─ Page reloads, calls /hunters/me/merchants
   └─ API looks for relationships with merchant-hunter-merchants
   └─ NO relationship found (was never created)
   └─ API returns empty list []
   └─ Merchant DISAPPEARS ❌❌❌
```

### Console Logs During Problem
```
[MERCHANTS ONBOARD] Authorization header: YES
[MERCHANTS ONBOARD] Token found: true
[MERCHANTS ONBOARD] ❌ Failed to extract hunter ID from token: jwt expired
[MERCHANTS ONBOARD] Creating merchant in database {
  hunterId: 'unauthenticated',  ← PROBLEM!
  authProvided: true
}
[MERCHANTS ONBOARD] ⚠️  NO HUNTER - Cannot create relationship
```

---

## 🟢 The Solution (After Fix)

```
TIMELINE
├─ 12:00 PM: User logs in as hunter
│  └─ Receives JWT token (expires at 1:00 PM)
│  └─ Receives refresh token (expires at 1/29/2026)
│  └─ Both stored in localStorage
│  └─ Frontend shows dashboard ✅
│
├─ 12:30 PM: User browsing dashboard
│  └─ Merchant list loads fine ✅
│
├─ 1:15 PM: User tries to register merchant
│  └─ Token EXPIRED at 1:00 PM
│  └─ ✅ NEW: Frontend checks expiration BEFORE submitting!
│  └─ isTokenExpired() returns TRUE
│  └─ ✅ NEW: Frontend automatically refreshes!
│  └─ Calls POST /auth/refresh with refresh token
│  └─ Backend gives new JWT token (expires at 2:15 PM)
│  └─ localStorage updated with new tokens
│  └─ Sends registration with NEW VALID TOKEN ✅
│  └─ Backend accepts and extracts hunterId ✅
│  └─ Merchant created with valid hunterId ✅
│  └─ ✅ merchant-hunter-merchants relationship created ✅
│
└─ 1:16 PM: User refreshes page
   └─ Page reloads, calls /hunters/me/merchants
   └─ ✅ NEW: Checks token expiration before fetch
   └─ Token is valid (expires at 2:15 PM)
   └─ API looks for relationships
   └─ ✅ FOUND: merchant-hunter-merchants relationship exists!
   └─ API returns merchant list [{ name: 'Home', status: 'Pending' }]
   └─ Merchant PERSISTS ✅✅✅
```

### Console Logs After Fix
```
[PWA] Token available: true
[TOKEN MANAGER] Token decoded: { id, type, iat, exp }
[PWA] ⚠️  Token expired or expiring soon, attempting refresh...
[TOKEN MANAGER] Attempting to refresh hunter token...
[TOKEN MANAGER] ✅ Token refreshed successfully
[PWA] ✅ Token refreshed successfully
[MERCHANTS ONBOARD] Authorization header: YES
[MERCHANTS ONBOARD] Token found: true
[MERCHANTS ONBOARD] Token decoded, type: HUNTER, id: <hunter-id>
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <hunter-id>
[MERCHANTS ONBOARD] Creating merchant in database {
  hunterId: '<actual-hunter-id>',  ← SUCCESS!
  authProvided: true
}
[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created
```

---

## 🔄 Token Refresh Flow

```
┌─────────────────────────────────────────────────────────┐
│ User tries to register merchant                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ Check token expired? │
          └────────┬──────────┬──┘
                   │          │
            YES ◀──┘          └──▶ NO
            │                      │
            ▼                      ▼
      ┌──────────────┐      ┌────────────────┐
      │ Get refresh  │      │ Use current    │
      │ token from   │      │ token for      │
      │ localStorage │      │ API request ✅ │
      └──────┬───────┘      └────────────────┘
             │
             ▼
      ┌──────────────────────────┐
      │ POST /auth/refresh       │
      │ Body: refresh token      │
      └────────────┬─────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
       SUCCESS            FAILED
         │                   │
         ▼                   ▼
    ┌─────────────┐   ┌────────────────┐
    │ Backend     │   │ Clear all      │
    │ returns new │   │ tokens from    │
    │ JWT token   │   │ localStorage   │
    └────┬────────┘   │                │
         │            │ Force user     │
         ▼            │ to login again │
    ┌─────────────┐   └────────────────┘
    │ Update      │
    │ localStorage│
    │ with new    │
    │ tokens ✅   │
    └────┬────────┘
         │
         ▼
    ┌─────────────┐
    │ Use new     │
    │ token for   │
    │ API request │
    │ ✅          │
    └─────────────┘
```

---

## 📊 Before vs After Comparison

### Before (❌ Without Token Check)
```
User Action                │ App Response
────────────────────────────┼──────────────────────
Token expires at 1:00 PM    │ (nothing happens)
User tries API call at 1:15 │ Sends expired token ❌
Backend rejects token       │ Returns error
Merchant created            │ Without hunterId ❌
Page refresh                │ Merchant disappears ❌
```

### After (✅ With Token Check)
```
User Action                │ App Response
────────────────────────────┼──────────────────────
Token expires at 1:00 PM    │ (no user action needed)
User tries API call at 1:15 │ Check: token expired? YES
                            │ Auto-refresh from server ✅
                            │ Use new token ✅
Backend accepts token       │ Returns success
Merchant created            │ With valid hunterId ✅
Page refresh                │ Merchant persists ✅
```

---

## 🔐 Security Flow

```
User at 12:00 PM
├─ Login with email/password
├─ Backend verifies credentials ✅
├─ Creates two tokens:
│  ├─ Access Token (JWT)
│  │  └─ Contains: userId, type='HUNTER', expires 1:00 PM
│  │  └─ Sent with every API request
│  │  └─ Short-lived (1 hour)
│  │
│  └─ Refresh Token (JWT)
│     └─ Contains: userId, expires 1/29/2026
│     └─ Only sent to /auth/refresh endpoint
│     └─ Long-lived (7 days)
│     └─ Used to get new access tokens
│
├─ Both tokens stored in localStorage
└─ User can use app ✅

If Access Token expires at 1:00 PM:
├─ Frontend detects expiration ✅
├─ Sends Refresh Token to /auth/refresh ✅
├─ Backend validates Refresh Token ✅
├─ Backend returns new Access Token ✅
├─ Frontend stores new Access Token ✅
├─ API call succeeds with new token ✅
└─ User never needs to re-login! ✅

If Refresh Token expires (7 days):
├─ Frontend tries to refresh
├─ Backend rejects (token too old)
├─ Frontend clears all tokens ✅
├─ User must login again ✅
└─ This is correct behavior ✅
```

---

## 💡 Key Insight

### The Root Cause
Frontend was **not checking if token was still valid** before using it.

### The Fix
**Always validate token expiration before any API call**.

```
BEFORE:
└─ Make API call with whatever token is in localStorage
   (might be expired!) ❌

AFTER:
├─ Check if token is expired
├─ If expired, refresh it first
└─ Make API call with guaranteed-valid token ✅
```

---

## ⏱️ Token Lifecycle

### Initial Login
```
12:00 PM
├─ User clicks "Hunter Login"
├─ Enters email/password
├─ Backend validates ✅
└─ Returns:
   ├─ accessToken (expires 1:00 PM)
   ├─ refreshToken (expires 1/29/2026)
   └─ hunter data (name, email, etc.)

localStorage now contains:
├─ hunterToken (the JWT)
├─ hunterRefreshToken (for refresh)
└─ hunterData (user info)
```

### During Use
```
12:30 PM - 12:55 PM:
├─ Token is valid
├─ Every API call: isTokenExpired() = false
└─ Use current token ✅

12:55 PM - 12:59:59 PM:
├─ Token still valid but expiring in < 5 minutes
├─ Next API call: isTokenExpired() = true
├─ Auto-refresh triggered ✅
├─ New token received (expires 1:55 PM)
└─ API call proceeds ✅

1:00 PM+:
├─ Original token would be expired
├─ But we already refreshed at 12:55 PM!
├─ Still using valid token (expires 1:55 PM)
└─ No interruption to user ✅
```

### On Page Refresh
```
1:20 PM - User presses F5

App reloads:
├─ Reads localStorage
├─ Finds hunterToken and hunterRefreshToken
├─ Checks if hunterToken expired
│  ├─ YES (original would be expired)
│  ├─ Call ensureHunterTokenValid()
│  └─ Refresh to get new token ✅
│
├─ Sets appMode = 'hunter'
├─ Makes API calls with valid token
├─ Fetches merchant list ✅
├─ Displays merchants ✅
└─ User sees uninterrupted dashboard ✅
```

---

## 🎯 The Key Change

### What Was Missing
The app was **trusting localStorage tokens without verification**.

### What We Added
**Verification and refresh before every API call**.

```typescript
// BEFORE: Just use it
const token = localStorage.getItem('hunterToken')
await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

// AFTER: Check & refresh first
let token = localStorage.getItem('hunterToken')
if (isTokenExpired(token)) {
  token = await refreshHunterToken()  // Get new one
}
await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
```

**Result**: Token is always valid when used! ✅

---

## 🚀 Outcome

| Aspect | Before | After |
|--------|--------|-------|
| **Token Check** | ❌ Never | ✅ Always |
| **Expired Token Detection** | ❌ Manual (user notices error) | ✅ Automatic |
| **Token Refresh** | ❌ Manual (logout/login) | ✅ Automatic |
| **Merchant Persistence** | ❌ No (disappears) | ✅ Yes |
| **User Interruption** | ❌ Yes (must login again) | ✅ None |
| **System Reliability** | ❌ Low | ✅ High |


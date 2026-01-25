# ⚡ QUICK FIX - TRY NOW!

## Right Now - Open Browser Console (F12)

Copy & paste this:

```javascript
console.log('=== MERCHANT TRACKING DEBUG ===');
console.log('Token:', localStorage.getItem('hunterToken') ? 'YES' : 'NO');
console.log('Hunter Data:', localStorage.getItem('hunterData') ? 'YES' : 'NO');

// If both are YES, you're logged in. Try registering a merchant.
// If either is NO, you need to login first!
```

---

## If NO Token

### Run this in console:

```javascript
localStorage.clear();
location.reload();
```

Then you should see LOGIN page.

---

## If YES Token

Good! Now:

1. Go to "Onboard Merchant"
2. Register a merchant
3. **Check backend logs** - do you see:
   ```
   ✅ VALID HUNTER ID extracted
   ```
   OR
   ```
   ❌ No Authorization header
   ```

---

## What the Messages Mean

| Message | Means | Fix |
|---------|-------|-----|
| ✅ VALID HUNTER ID | Token is good, relationship should be created | Should work! |
| ❌ No Authorization | No token sent | Login first |
| ❌ Token is not HUNTER | Token is wrong type | Logout & login |

---

## Expected Flow

```
1. You're logged in (token in localStorage)
           ↓
2. Click "Onboard Merchant"
           ↓
3. Fill form & submit
           ↓
4. [PWA] logs show success (201)
           ↓
5. [APP] logs show merchant appeared
           ↓
6. Merchant visible in list ✅
           ↓
7. Press F5 to refresh
           ↓
8. [APP useEffect] fetches from API
           ↓
9. API returns merchant (has relationship)
           ↓
10. Merchant still visible ✅ FIXED!
```

---

## If It Still Doesn't Work

Tell me:
1. Are you seeing LOGIN or DASHBOARD page?
2. What's in browser console for token check above?
3. What's in backend logs for merchant registration?
4. What does this return:
   ```javascript
   fetch('/api/v1/hunters/me/merchants')
     .then(r => r.json())
     .then(d => console.log('Merchants:', d.count || 0))
   ```

With those 4 answers, I can fix it! 🎯

---

**Do this now and let me know what you find!** ⏱️

# 🚨 MERCHANT DISAPPEARING - ROOT CAUSE & SOLUTION

## The Real Problem (Confirmed!)

**Merchants disappear on refresh because you're NOT logged in as a hunter when registering!**

### Evidence
From your logs:
```
hunterId: 'unauthenticated',
```

This means:
- ❌ No valid hunter token sent
- ❌ No relationship created
- ❌ Merchant invisible to API
- ❌ On refresh, returns empty

---

## The Solution (3 Options)

### Option A: Login Properly (Best)

**This is how it's supposed to work:**

1. **Go to Hunter Login**
   - App should show LOGIN page on first load
   - If not, clear localStorage:
     ```javascript
     localStorage.clear();
     location.reload();
     ```

2. **Login with hunter account**
   - Email: (check your database for valid hunter)
   - Password: (corresponding password)
   - Should redirect to dashboard

3. **Click "Onboard Merchant"**
   - Form appears
   - Register merchant
   - Merchant should appear in list

4. **Refresh (F5)**
   - Merchant should STILL be there ✅

---

### Option B: Use Test Token (For Debugging)

**If you don't have a hunter account:**

1. **Generate a test token:**
   ```bash
   node generate-test-token.js
   ```

2. **Copy the token output**

3. **Open browser console (F12)**

4. **Paste these commands:**
   ```javascript
   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // (from step 1)
   localStorage.setItem('hunterToken', token);
   localStorage.setItem('hunterData', JSON.stringify({
     id: 'test-hunter-' + Date.now(),
     name: 'Test Hunter'
   }));
   location.reload();
   ```

5. **Register merchant** - should work now!

---

### Option C: Use Direct Database Script (For Testing)

**If you want to verify the API works:**

1. **Create a test merchant directly in database:**
   ```bash
   node create-test-merchant-direct.js
   ```

2. **This creates:**
   - Test hunter
   - Test merchant
   - Proper relationship
   - Activity log

3. **Then test if you can fetch it:**
   ```javascript
   fetch('/api/v1/hunters/me/merchants')
     .then(r => r.json())
     .then(d => console.log(JSON.stringify(d, null, 2)))
   ```

   Should return your test merchant!

---

## How to Know Which Option to Use

| Situation | Option | Why |
|-----------|--------|-----|
| You have hunter account | A | Proper auth flow |
| You don't have account | B | Quick test |
| Just verifying API | C | Skip UI issues |

---

## Complete Step-by-Step (Option A)

### Step 1: Check Initial State
```javascript
console.log('hunterToken:', localStorage.getItem('hunterToken'));
```

**If you see `null`:** Go to Step 2
**If you see a token:** Already logged in, go to "Register Merchant"

### Step 2: Clear and Reload
```javascript
localStorage.clear();
location.reload();
```

**You should now see LOGIN page**

### Step 3: Get Hunter Credentials

**Find a valid hunter in the database:**

```bash
psql $DATABASE_URL -c "SELECT id, email FROM merchant_hunters LIMIT 5;"
```

Use one of these emails and its password.

### Step 4: Login

**On the LOGIN page:**
- Email: (from step 3)
- Password: (corresponding password)
- Click Login

**After success:**
- You're on dashboard
- "Onboard Merchant" button visible
- Console shows: `hunterToken: eyJ...`

### Step 5: Register Merchant

1. Click "Onboard Merchant"
2. Fill form:
   - Business Name: `Test Store`
   - Owner: `Test Owner`
   - Email: `test@store.com`
   - Phone: `+263700000000`
   - Type: `Retail`
   - Address: `Test Address`
   - Password: `TestPass123!`
   - Upload ID images
3. Click Submit

**Should see in console:**
```
[PWA] Token available: true ✅
[PWA] Response status: 201 ✅
[APP] API returned 1 merchants ✅
```

**Merchant appears in list** ✅

### Step 6: Test Persistence

1. Press **F5** to refresh
2. **Merchant still there?** ✅ FIXED!

---

## Backend Logs to Watch

### When Registering, Look For:

**Good signs:**
```
[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted: <hunter-id>
[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created: <id>
```

**Bad signs:**
```
[MERCHANTS ONBOARD] ❌ No Authorization header
[MERCHANTS ONBOARD] ❌ Token is not HUNTER type
```

---

## Troubleshooting

### "I don't see a LOGIN page"

**Solution:**
```javascript
localStorage.clear();
location.reload();
```

### "I can't find hunter credentials"

**Create a test hunter:**
```bash
node create-test-merchant-direct.js
```

Use these credentials:
- Email: `testhunter@example.com`
- Password: Whatever you set (or check database)

### "Token available shows false"

**Means:**
- Login didn't work
- Or localStorage not set
- Or page refreshed before login completed

**Solution:**
- Go back to login
- Wait for successful message
- Check localStorage has hunterToken

### "API returned 0 merchants"

**Means:**
- Merchant created but relationship missing
- Check backend logs for ❌ signs
- Token probably wasn't valid

---

## Quick Verification

Run this in console to verify everything:

```javascript
// Check 1: Token exists
const token = localStorage.getItem('hunterToken');
console.log('1. Token exists:', !!token);

// Check 2: Token is valid format
if (token) {
  const parts = token.split('.');
  console.log('2. Token format valid:', parts.length === 3);
}

// Check 3: API works
fetch('/api/v1/hunters/me/merchants')
  .then(r => r.json())
  .then(d => {
    console.log('3. API response status:', d.success ? 'OK' : 'ERROR');
    console.log('4. Merchants found:', d.data?.length || 0);
  })
  .catch(e => console.log('3. API error:', e.message));
```

---

## Final Checklist

- [ ] Cleared localStorage
- [ ] Reloaded page
- [ ] See LOGIN page
- [ ] Have valid hunter credentials
- [ ] Logged in successfully
- [ ] Dashboard appears
- [ ] "Onboard Merchant" button visible
- [ ] Registered test merchant
- [ ] Merchant appears in list
- [ ] Refreshed page (F5)
- [ ] Merchant still there ✅

**If all checked:** Problem FIXED! 🎉

---

## Summary

**The issue:** Not logged in as hunter
**The cause:** hunterToken is null/invalid
**The fix:** Login first, then register
**The result:** Merchants persist across refreshes ✅

---

**Next step:** Try Option A above and tell me what you see!

Good luck! 🚀

# Testing Merchants Display After Refresh

## Summary
All logging has been added to track the merchants display flow. When you login and refresh, check the browser console for these logs:

## Login Instructions
- Email: `Mogusu@gmail.com`
- Password: `Test@123456`
- URL: `http://localhost:3001`

## What to Check in Browser Console (F12)

### Step 1: Initial Login
After entering credentials and clicking "Login":

Look for logs starting with `[APP init-effect]` and `[APP]`:
```
[APP init-effect] Starting initialization...
[APP] Hunter token restored from localStorage - token length: XXX starts with: eyJhbGc...
[APP] Hunter token restored from localStorage
[APP init-effect] Initialization complete
```

### Step 2: After Login - Merchant Fetch
You should see `[APP merchants-fetch-effect]` logs:
```
[APP merchants-fetch-effect] Running... hunterToken= eyJhbGc... isInitialized= true
[APP useEffect] Fetching merchants for hunter: eyJhbGc...
[APP useEffect] API URL: http://localhost:5000
[APP useEffect] Response status: 200
[APP useEffect] Response: { success: true, data: [ ... ], count: 2 }
[APP useEffect] Got 2 merchants from API
[APP useEffect] Setting merchants to: [ { id: '...', name: 'Home', location: 'Foxdale', ... }, ... ]
[APP useEffect] Fetch complete
```

### Step 3: Rendering
When the page renders, you should see `[APP RENDER]` logs:
```
[APP RENDER] Rendering content for activeTab: dashboard
[APP RENDER] Merchants state: { count: 2, data: [ ... ] }
[APP RENDER] MerchantsLoading: false
```

And when clicking on "Merchants" tab, you should see:
```
[MERCHANT LIST] Component rendered
[MERCHANT LIST] Props received: { merchantsCount: 2, loading: false }
[MERCHANT LIST] Merchants data: [ { id: '...', name: 'Home', location: 'Foxdale', ... }, ... ]
```

### Step 4: After Refresh
After pressing F5 (refresh):
- Same logs should appear again
- Most importantly, `[APP RENDER] Merchants state:` should still show `count: 2`
- The merchants should still be visible in the UI

## Expected Merchants to Display
After logging in as `Mogusu@gmail.com`, you should see:
1. Merchant Name: "Home"
   - Location: Foxdale
   - Status: Pending
   - Onboarded Date: [date created]

2. Merchant Name: "Home"  
   - Location: Foxdale
   - Status: Pending
   - Onboarded Date: [date created]

## If Merchants Don't Show
Check these logs in order:

1. **No `[APP useEffect]` logs?** → Token not set or useEffect not running
   - Check: Is `hunterToken` state being set?
   - Check: Is `isInitialized` true?

2. **`Response status: 401` or `403`?** → Token is invalid or expired
   - Check: Is token being refreshed? Look for `⚠️  Token expired`
   - Check: Is the password correct? (Test@123456)

3. **`Response status: 500`?** → Backend error
   - Check backend terminal for error logs
   - Check if database connection is working

4. **`Got 0 merchants from API`?** → Merchants not linked to hunter in database
   - This shouldn't happen for Mogusu@gmail.com - should have 2 merchants
   - Check database: `select * from "MerchantHunterMerchant" where "merchantHunterId" = '...';`

5. **No `[MERCHANT LIST]` logs?** → MerchantList component not rendering
   - Check: Is activeTab being set to "merchants"?
   - Check: Are merchants being passed to component?

6. **Merchants show but disappear after refresh?**
   - Check: Are merchants being fetched again after refresh?
   - Check: Does `[APP RENDER] Merchants state:` show count: 0 after refresh?
   - If yes, the fetch is failing - check response logs

## How to Run

### Terminal 1: Backend
```bash
cd backend
pnpm dev
```
Should show: `Server listening on port 5000`

### Terminal 2: Frontend  
```bash
cd "fieldprohararemerchantonboardingportal (1)"
npm run dev
```
Should show: `➜  Local:   http://localhost:3001/`

### Browser
- Open http://localhost:3001
- Open DevTools (F12)
- Go to Console tab
- Login with Mogusu@gmail.com / Test@123456
- Look for the logs described above
- Click on "My Merchants" tab
- Refresh page (F5)
- Check logs again - merchants should still be loaded

## Test Data in Database
Hunter: Mogusu@gmail.com (password: Test@123456)
- Merchants Count: 2
- Merchant Names: Both "Home"
- Locations: Both "Foxdale"
- Status: Both "pending"

## Recent Changes Made
1. **lib/tokenManager.ts** - Token expiration detection and auto-refresh
2. **.env** - Set VITE_API_URL=http://localhost:5000
3. **App.tsx** - Added comprehensive logging to track token and merchant fetch
4. **components/MerchantList.tsx** - Added logging to track prop reception and rendering

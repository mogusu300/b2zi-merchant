# Quick Verification Checklist - Document Viewing Fix

## Step 1: Verify Uploaded Files Exist
```bash
# Check if uploads directory has files
ls -la public/uploads/

# Expected output: List of image files with timestamps
# Example:
# -rw-r--r--  1 user  group   245K  Jan 14 12:00 1767856646628-2v2wue.jpeg
# -rw-r--r--  1 user  group   198K  Jan 14 12:01 1767856676121-oaww99.png
```

## Step 2: Verify Database Records
```bash
# Connect to your database and check merchant records
# Using psql (PostgreSQL):

# Check if merchants have document URLs
SELECT id, businessName, idFrontUrl, idBackUrl FROM "Merchant" WHERE idFrontUrl IS NOT NULL LIMIT 3;

# Expected output:
#  id  | businessName | idFrontUrl | idBackUrl
# -----+--------------+--------------------+------------------
#  abc | Test Store   | /uploads/1767... | /uploads/1767...
```

## Step 3: Start the Dev Server
```bash
npm run dev
# Server should be running at http://localhost:3000
```

## Step 4: Test the Admin Dashboard

1. **Navigate to Admin Page**
   - URL: `http://localhost:3000/admin`
   - Should see merchant list loaded

2. **Click on a Merchant**
   - Click on any merchant card/row to open details modal
   - Should see merchant information

3. **Click "Show ID Documents"**
   - Button should toggle to "Hide ID Documents"
   - Should see two image areas start loading (with spinners)

4. **Wait for Images to Load**
   - If successful: Images display properly ✅
   - If failed: Error message appears with retry button ✅

## Step 5: Check Browser Console
```
Open DevTools: F12
Go to: Console tab
Expected to see: Either no errors OR helpful error messages
```

## Expected Behavior

### Success Path
```
1. Click "Show" → Spinners appear
2. Images load → Spinners disappear
3. Documents display properly
4. Click "Hide" → Documents hidden
5. Click "Show" again → Images reload quickly from cache
```

### Error Path (if images are missing)
```
1. Click "Show" → Spinners appear
2. Images fail to load (spinner replaced with error icon)
3. Error message: "Image Failed to Load"
4. URL shown for debugging
5. "Try Again" button available to retry
```

## Common Issues & Fixes

### Issue: "Failed to fetch images"
- Check: Are files in `public/uploads/`?
- Check: Are file paths correct in database?
- Fix: Run `npm run dev` to restart server

### Issue: "Images still showing error"
- Check: File permissions: `ls -la public/uploads/`
- Check: File format: Should be .jpeg, .jpg, .png, or .webp
- Fix: Re-upload documents through registration page

### Issue: "Can't see admin page"
- Check: Are you accessing `http://localhost:3000/admin`?
- Check: Is dev server running? `npm run dev`
- Fix: Restart dev server

## Success Indicators

✅ Admin dashboard loads  
✅ Merchant list displays  
✅ Click merchant opens details modal  
✅ "Show ID Documents" button works  
✅ Either images display OR error message shows  
✅ No blank white spaces (all feedback visible)  

## Files Modified

- ✅ `/app/admin/page.tsx` - Enhanced image display with error handling

## Rollback (if needed)

If something goes wrong, the original code is still in git. Rollback with:
```bash
git checkout app/admin/page.tsx
npm run dev
```

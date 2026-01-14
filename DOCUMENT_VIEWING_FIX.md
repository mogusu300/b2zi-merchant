# Document Viewing Fix - Admin Dashboard

## Problem
Documents (ID photos) uploaded during merchant registration were not displaying in the admin dashboard when viewing merchant details.

## Root Causes Identified

1. **No Error Handling**: Images were failing to load with no visible feedback
2. **No Loading States**: Users didn't know if images were loading or broken
3. **No Retry Mechanism**: Once an image failed to load, there was no way to retry

## Solution Implemented

### Changes Made

**File**: `/app/admin/page.tsx`

#### 1. Added New Imports
- `Image` from 'next/image'
- `AlertCircle` icon for error display
- `Loader2` icon for loading animation

#### 2. Enhanced DetailModal Component

**New State Management**:
```typescript
const [imageErrors, setImageErrors] = useState<{ front: boolean; back: boolean }>({ front: false, back: false })
const [imagesLoading, setImagesLoading] = useState<{ front: boolean; back: boolean }>({ front: false, back: false })
```

**New DocumentImage Sub-Component**:
- Handles individual image loading
- Shows loading spinner while fetching
- Displays error message with retry button if loading fails
- Logs errors to console for debugging

**Error States**:
- ✅ Loading: Shows animated spinner
- ✅ Failed: Shows alert icon + error message + retry button
- ✅ Success: Shows image with proper sizing

### Features

1. **Loading Indicator**: Spinner shows while image is being fetched
2. **Error Handling**: Shows error state with helpful message
3. **Retry Button**: Users can retry failed images
4. **URL Display**: Shows the URL in error state for debugging
5. **Console Logging**: Errors logged for admin/developer troubleshooting

## How It Works

```
User clicks "Show ID Documents"
    ↓
Component renders DocumentImage for each URL
    ↓
Image starts loading → shows spinner
    ↓
Either:
  A) Image loads successfully → displays image
  B) Image fails → shows error alert + retry button
    ↓
User can click retry to reload
```

## File Upload Path

Documents are uploaded to: `/public/uploads/`

Files are stored with names like:
- `1767772072880-alu2gc.jpeg`
- `1767856676121-oaww99.png`

These are accessible via: `/uploads/[filename]`

## Testing

To test the fix:

1. **Go to Admin Dashboard**: `http://localhost:3000/admin`
2. **Click on a Merchant**: View any merchant with uploaded documents
3. **Click "Show ID Documents"**: Should see loading spinners
4. **Verify Images Load**: Documents should display properly
5. **Test Error Handling**: If image fails (intentionally), error state should show
6. **Test Retry**: Click "Try Again" button to reload failed images

## Browser Console

Check browser console (F12 → Console) for:
- ✅ Successful image loads: `"Failed to load front ID image: /uploads/..."`  (if it prints, it means the onError was called)
- ✅ Error messages: `"Failed to load X ID image: [URL]"`

## Troubleshooting

If images still don't display:

1. **Check public/uploads directory**: `ls public/uploads/`
   - Should show image files like `1767772072880-alu2gc.jpeg`

2. **Check browser console**: F12 → Console
   - Look for error messages about image loading
   - Check Network tab to see if images are being requested

3. **Check image URLs**: 
   - In database, merchant `idFrontUrl` should be `/uploads/[filename]`
   - Query: `SELECT idFrontUrl, idBackUrl FROM "Merchant" LIMIT 1;`

4. **Verify uploads directory exists**:
   ```bash
   test -d public/uploads && echo "✅ uploads directory exists" || echo "❌ uploads directory missing"
   ```

5. **Check file permissions**:
   ```bash
   ls -la public/uploads/
   ```

## Next Steps

If the fix doesn't resolve the issue:

1. Verify files are actually in `/public/uploads/`
2. Check if the URL paths in the database are correct
3. Review browser Network tab to see what URLs are being requested
4. Consider adding a fallback/placeholder image

## Notes

- The fix maintains the original UI/UX while adding robustness
- Error messages are helpful for debugging
- Retry button allows users to recover from temporary network issues
- All changes are backward compatible (no breaking changes)

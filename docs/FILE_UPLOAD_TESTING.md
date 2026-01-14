# File Upload Testing Guide

## Quick Start Testing

### Step 1: Start the Development Server
```bash
pnpm dev
```

### Step 2: Test Product Creation Upload (Merchants)
1. Navigate to: `http://localhost:3000/sellers/dashboard/products/new`
2. Fill in product details:
   - Product Name: "Test Product"
   - Description: "Test description"
   - Price: "29.99"
   - Category: "Handicrafts"
3. Upload Images Section:
   - Click the dashed border upload area
   - Select 2-3 image files from your device
   - Verify images appear in the preview grid
   - Verify first image is marked "Primary"
   - Verify you can delete images by hovering and clicking X
4. Submit the form
5. Verify product was created with uploaded images

### Step 3: Test Product Edit
1. Navigate to: `http://localhost:3000/sellers/products/`
2. Click "Edit" on any product
3. Scroll to "Product Images" section
4. Should show existing images
5. Try uploading additional images
6. Delete and add new images
7. Save changes
8. Verify images were updated

### Step 4: Test File Validation

#### Test 1: Invalid File Type
1. Navigate to product creation page
2. Try uploading a PDF or text file
3. Should show error: "is not an image file"

#### Test 2: File Size Limit
1. Navigate to product creation page
2. Try uploading an image > 10MB
3. Should show error: "is larger than 10MB"

#### Test 3: Multiple Files
1. Navigate to product creation page
2. Select 5 image files at once
3. All should upload successfully
4. All should appear in preview grid

### Step 5: Verify Image Storage
1. Check directory: `public/uploads/`
2. Should contain uploaded image files
3. Files should be named: `[timestamp]-[random].ext`
4. Files should be accessible via browser at `/uploads/filename`

### Step 6: Test on Mobile (Optional)
1. Use Chrome DevTools device emulation
2. Navigate to product creation page
3. Tap file upload area
4. Should show mobile file picker
5. Select image from photo library
6. Should upload and display correctly

## Test Cases

### Valid Scenarios
- ✅ Single image upload
- ✅ Multiple images upload (5+ files)
- ✅ Different image formats (JPEG, PNG, WebP)
- ✅ Image deletion from preview
- ✅ Form submission with images
- ✅ Product creation with uploaded images
- ✅ Product edit with new images
- ✅ Image preview grid layout
- ✅ Primary image badge display

### Invalid Scenarios
- ❌ Non-image file upload (PDF, TXT, etc.)
- ❌ Image > 10MB
- ❌ No images uploaded (form validation)
- ❌ Empty file upload

## Expected Behaviors

### Upload Flow
1. User selects file(s)
2. Client validates immediately
3. "Uploading..." state shows
4. File posts to `/api/upload`
5. Server validates and saves
6. Public URL returned
7. Image added to preview grid
8. File input cleared

### Error Handling
- Invalid files show error message
- Error persists until valid files selected
- Multiple file uploads continue even if one fails
- User can retry without page refresh

### Image Display
- Thumbnails appear immediately after upload
- Primary image marked with badge
- Hover shows delete button
- Grid responsive: 2 cols mobile, 3 tablet, 4 desktop

## Database Verification

### Check Uploaded Images in Database

```sql
-- View products with images
SELECT id, name, images FROM products LIMIT 5;

-- Should show JSON array like:
-- ["/uploads/1704213456789-abc123.jpg", "/uploads/1704213456790-def456.jpg"]
```

## API Testing (Advanced)

### Manual Upload Test
```bash
# Using curl to test upload API
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg"

# Expected response:
# {
#   "url": "/uploads/1704213456789-abc123.jpg",
#   "filename": "1704213456789-abc123.jpg",
#   "message": "File uploaded successfully"
# }
```

## Common Issues & Solutions

### Issue: Images not appearing in preview
- **Solution:** Check browser console for errors
- **Solution:** Verify /api/upload endpoint is responding
- **Solution:** Check file size is < 10MB

### Issue: Upload fails with 400 error
- **Solution:** Ensure file is valid image format
- **Solution:** Check file size limit
- **Solution:** Verify Content-Type header

### Issue: Images accessible but not saving to database
- **Solution:** Check form submission includes images array
- **Solution:** Verify API endpoint processes images field
- **Solution:** Check database schema supports images field

### Issue: Uploaded files not persisting
- **Solution:** Verify /public/uploads directory exists
- **Solution:** Check file system permissions
- **Solution:** Verify writeFile promise completes

## Performance Considerations

### Optimization Tips
1. Images compressed before upload (future enhancement)
2. Large files take longer to upload
3. Simultaneous uploads: browser may queue
4. Network speed affects upload time

### Monitoring
- Check server logs for upload details: `[File Upload]` tags
- Monitor /public/uploads directory size
- Track average upload times in logs

## Success Criteria

✅ All tests passed if:
1. Images upload successfully
2. Preview grid displays all images
3. Primary image marked correctly
4. Images persist in database
5. Images accessible via URL
6. Form submission includes images
7. Product created with images
8. No console errors
9. Proper error messages for invalid files
10. Mobile file picker works

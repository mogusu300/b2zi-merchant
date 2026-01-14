# File Upload - Quick Reference

## ⚡ Quick Start

### For Users (Merchants)
1. Go to product creation or edit page
2. See upload area with dashed border
3. Click or drag-and-drop images
4. Wait for preview to appear
5. Remove unwanted images
6. Submit form

### For Developers
- **API:** `POST /api/upload`
- **Input:** FormData with `file` field
- **Output:** `{ url, filename, message }`
- **Storage:** `/public/uploads/`

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `/app/api/upload/route.ts` | Upload endpoint (saves files) |
| `/app/sellers/dashboard/products/new/page.tsx` | Dashboard product form |
| `/app/sellers/products/new/page.tsx` | Alternative product form |
| `/app/sellers/products/[id]/edit/page.tsx` | Product edit form |
| `/public/uploads/` | Uploaded files storage |
| `.gitignore` | Excludes uploads from git |

---

## ✅ What Works

- ✅ Upload JPEG, PNG, WebP images
- ✅ Single or multiple files at once
- ✅ Real-time preview grid
- ✅ Remove images before submitting
- ✅ Primary image marking
- ✅ Mobile file picker support
- ✅ File validation (type & size)
- ✅ Error messages
- ✅ Public URL access
- ✅ Database storage

---

## 🚫 Limitations

- 10MB max per file
- JPEG, PNG, WebP only
- No image cropping in UI (yet)
- No image compression (yet)
- Local storage only (can extend to cloud)

---

## 🐛 Troubleshooting

### Upload Fails
→ Check file is < 10MB and JPEG/PNG/WebP

### Images Don't Show
→ Verify `/api/upload` endpoint responds

### Mobile Issues
→ Use portrait mode, allow camera/photos permission

### URL Not Working
→ Check `/public/uploads/` directory exists

---

## 🔗 Endpoints

**Upload Image**
```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: <File> }
Response: { url, filename, message }
```

---

## 📝 Code Examples

### Upload via JavaScript
```javascript
const input = document.querySelector('input[type="file"]')
const file = input.files[0]
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
const data = await response.json()
console.log(data.url) // "/uploads/..."
```

### React Component
```tsx
const [images, setImages] = useState<string[]>([])

const handleUpload = async (e) => {
  const formData = new FormData()
  formData.append('file', e.target.files[0])
  
  const res = await fetch('/api/upload', {
    method: 'POST', body: formData
  })
  const data = await res.json()
  setImages([...images, data.url])
}

return (
  <>
    <input type="file" accept="image/*" onChange={handleUpload} />
    {images.map(img => <img key={img} src={img} />)}
  </>
)
```

---

## 📊 File Size Reference

| Image Type | Typical Size | Note |
|-----------|-------------|------|
| JPEG Photo | 500KB - 3MB | Recommended |
| PNG Graphic | 1MB - 5MB | Use for graphics |
| WebP Modern | 300KB - 2MB | Best compression |

---

## 🔐 Security

- ✅ File type whitelist (no executables)
- ✅ Size limit enforced
- ✅ Random filenames (no overwrites)
- ✅ Server-side validation
- ✅ No code execution possible

---

## 📈 Performance

| Operation | Time |
|-----------|------|
| Small image (500KB) | 1-2s |
| Medium image (2MB) | 3-5s |
| Large image (8MB) | 8-15s |
| Multiple files | Sequential |

---

## 🎯 Next Steps

1. **Test:** Visit `/sellers/dashboard/products/new`
2. **Upload:** Select image from device
3. **Verify:** See preview appear
4. **Submit:** Create product with image
5. **Confirm:** View product with uploaded image

---

## 📞 Support

- Docs: `/docs/FILE_UPLOAD_IMPLEMENTATION.md`
- Tests: `/docs/FILE_UPLOAD_TESTING.md`
- Complete: `/docs/LOCAL_FILE_UPLOAD_COMPLETE.md`

---

## 🎉 Success Indicators

✅ Images upload from device
✅ Preview shows before submitting
✅ Product saves with images
✅ Images display on product page
✅ No errors in console

**You're all set!**

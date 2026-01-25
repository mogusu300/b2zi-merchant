# PWA Deployment Instructions

## Overview
The PWA (Merchant Hunter Portal) is being deployed alongside the existing Next.js web app at the route `/merchanthunter`.

## Current Setup

### Folder Structure
```
deployment/
├── app/                    (Next.js app - existing)
├── public/
│   └── merchanthunter/    (PWA static files)
├── package.json           (Next.js dependencies)
└── ...
```

### Route Configuration
- **Main Web App**: `/` → Next.js app
- **PWA Hunter Portal**: `/merchanthunter` → Static Vite build

## Deployment Steps

### 1. Build the PWA Locally
```bash
cd "fieldprohararemerchantonboardingportal (1)"
npm run build
```

### 2. Copy Built Files
The built files from `dist/` should be copied to `deployment/public/merchanthunter/`

### 3. Create/Update Next.js Route Handler
A catch-all route handler at `app/merchanthunter/[[...slug]]/route.ts` serves the PWA files.

### 4. Update Next.js Configuration
The `next.config.js` is configured to:
- Serve static files from `/public/merchanthunter`
- Handle SPA routing for the PWA (all routes go to index.html)

### 5. Commit and Deploy
```bash
# In deployment folder
git add .
git commit -m "Add PWA app at /merchanthunter route"
git push
```

Then deploy via Vercel using the deployment folder.

## Accessing the PWA

### Development
```
http://localhost:3000/merchanthunter
```

### Production (Vercel)
```
https://your-vercel-domain.vercel.app/merchanthunter
```

## Important Notes

1. **Backend API URL**: The PWA automatically detects the API URL based on the current hostname
   - Dev: `http://localhost:5000`
   - Prod: Uses the same hostname as frontend at port 5000

2. **CORS**: Ensure backend is configured to accept requests from the Vercel domain

3. **Environment Variables**: Backend URL can be overridden with `VITE_API_URL` environment variable

## Troubleshooting

### PWA not loading
- Check that files are in `deployment/public/merchanthunter/`
- Verify Next.js catch-all route is configured
- Check browser console for 404 errors

### API requests failing
- Ensure backend is accessible from the frontend domain
- Check CORS configuration on backend
- Verify `VITE_API_URL` environment variable if needed


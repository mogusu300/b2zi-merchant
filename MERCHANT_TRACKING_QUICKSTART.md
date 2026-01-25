# 🚀 QUICK START - Merchant Tracking System

## ⚡ 5-Minute Setup

### Step 1: Create Test Data (Optional)
```bash
# Use Prisma Studio to add test data
npx prisma studio

# Or run a script:
node scripts/create-test-merchants.js
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test the API
```bash
# Replace {hunterId} with real ID
curl http://localhost:3000/api/merchant-hunters/{hunterId}/merchants

# Example response should show merchants with statuses
```

### Step 4: Access Dashboard
```
Navigate to: http://localhost:3000/dashboard/merchant-onboarding
Log in with your hunter account
```

### Step 5: Try Actions
- ✅ See merchant list load
- ✅ Click on a merchant
- ✅ View details in modal
- ✅ Click Approve to test status update
- ✅ See dashboard refresh automatically

---

## 📋 Features Checklist

- [ ] **Merchant List** - See all merchants
- [ ] **Real-time Updates** - Dashboard refreshes every 30s
- [ ] **Manual Refresh** - Click button to update now
- [ ] **Status Tracking** - See merchant onboarding progress
- [ ] **Detail Modal** - Click merchant to see full info
- [ ] **Documents** - View uploaded documents
- [ ] **Activity Logs** - See all changes with timestamps
- [ ] **Approve/Reject** - Update merchant status
- [ ] **Status Badges** - Color-coded status indicators
- [ ] **Stats Cards** - Summary of all merchants
- [ ] **Charts** - Visual performance trends

---

## 🔧 Configuration

### Change Auto-Refresh Interval
Edit `hooks/useMerchantTracker.ts`:
```typescript
// Line ~60 - Change 30000 to desired milliseconds
const interval = setInterval(() => {
  fetchMerchants();
}, 30000); // ← Change this
```

### Enable/Disable Live Updates
```typescript
// In DashboardLive.tsx
// Comment out or modify the useEffect for polling
```

---

## 🧪 Test Scenarios

### Scenario 1: View Merchants
1. Log in as hunter
2. Go to dashboard
3. Should see list of merchants
4. **Expected**: Merchants load with status badges

### Scenario 2: Update Status
1. Click on a merchant
2. Modal opens with details
3. Click "Approve" button
4. **Expected**: Status updates to "completed"
5. **Expected**: Activity logged
6. **Expected**: Dashboard refreshes

### Scenario 3: Real-time Update
1. Have dashboard open in browser
2. Update a merchant in another tool/browser
3. Wait 30 seconds
4. **Expected**: Dashboard shows new status automatically

### Scenario 4: Manual Refresh
1. Click "Refresh Data" button
2. **Expected**: Immediate update from server
3. **Expected**: Loading state shows briefly

---

## 📱 Components Overview

### DashboardLive.tsx
- Main dashboard component
- Shows all merchants
- Handles modal and interactions
- Displays stats and charts

### useMerchantTracker Hook
- Manages all data fetching
- Auto-refresh logic
- Status update logic
- Error handling

### API Endpoints
- `/api/merchant-hunters/[hunterId]/merchants` - List all
- `/api/merchant-hunters/[hunterId]/merchants/[merchantId]` - Update status
- `/api/merchants/[merchantId]/activity-logs` - View activity

---

## 🐛 Common Issues

### Issue: "Merchants not loading"
```
Check:
1. Is hunterId being passed?
2. Do merchant_hunter_merchants exist?
3. Is database connection working?
4. Check browser console for errors
```

### Issue: "API 404 error"
```
Check:
1. Is hunterId correct?
2. Do the API routes exist?
3. Is Next.js server running?
4. Check route file paths
```

### Issue: "Status not updating"
```
Check:
1. Is merchantId valid?
2. Check network tab for request
3. Look for API error response
4. Check database constraints
```

---

## 📊 Data Requirements

Before testing, make sure you have:
- ✅ At least 1 merchant hunter account
- ✅ At least 1 merchant record
- ✅ merchant_hunter_merchants linking them
- ✅ Some merchant_activity_logs (for history)
- ✅ Some merchant_onboarding_documents (for details)

---

## 🎯 API Quick Reference

### Get All Merchants
```bash
GET /api/merchant-hunters/hunter_123/merchants
```
Response: List of all merchants with summary

### Get Merchant Details
```bash
GET /api/merchant-hunters/hunter_123/merchants/merchant_456
```
Response: Full merchant info with documents & logs

### Update Status
```bash
PUT /api/merchant-hunters/hunter_123/merchants/merchant_456
{
  "status": "completed",
  "merchantStatus": "approved"
}
```
Response: Updated merchant object

### Get Activity Logs
```bash
GET /api/merchants/merchant_456/activity-logs?limit=10
```
Response: List of all activities

---

## 📚 Documentation Files

- **MERCHANT_TRACKING_API_GUIDE.md** - Full API reference
- **MERCHANT_TRACKING_ARCHITECTURE.md** - System design
- **MERCHANT_TRACKING_COMPLETE.md** - Feature details
- **MERCHANT_TRACKING_FINAL_SUMMARY.md** - Overview
- This file - Quick start

---

## ✅ Verification Checklist

Before deploying:
- [ ] All APIs working
- [ ] Dashboard loads without errors
- [ ] Status updates work
- [ ] Auto-refresh happens every 30 seconds
- [ ] Manual refresh works
- [ ] Detail modal opens/closes
- [ ] Approve button updates status
- [ ] Reject button works
- [ ] Activity logs visible
- [ ] No console errors

---

## 🚀 Ready to Go!

Everything is set up and ready to use. Start with:

```bash
1. npm run dev
2. Navigate to /dashboard/merchant-onboarding
3. Log in as a merchant hunter
4. Enjoy the live merchant tracking!
```

---

## 📞 Need Help?

1. Check the **MERCHANT_TRACKING_API_GUIDE.md** for API details
2. Check the **MERCHANT_TRACKING_ARCHITECTURE.md** for system design
3. Check the **MERCHANT_TRACKING_COMPLETE.md** for features
4. Check browser console for errors
5. Check network tab to see API responses

---

**Happy hunting! 🎯**

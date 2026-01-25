# 🎯 Merchant Tracking & Management API - Quick Reference

## 📋 API Endpoints Created

### 1. **Merchant Tracking for Hunter**
```bash
GET /api/merchant-hunters/{hunterId}/merchants
```
Returns all merchants onboarded by a specific hunter with status & documents.

**Response:**
```json
{
  "success": true,
  "hunterId": "hunter_123",
  "summary": {
    "totalMerchants": 12,
    "onboarded": 8,
    "inProgress": 3,
    "notStarted": 1,
    "rejected": 0
  },
  "merchants": [
    {
      "id": "mhm_123",
      "merchantId": "m_123",
      "businessName": "ABC Shop",
      "status": "completed",
      "merchantStatus": "approved",
      "isVerified": true,
      "onboardingDaysElapsed": 5,
      "documents": [...],
      "activityLog": [...]
    }
  ]
}
```

### 2. **Get Merchant Details**
```bash
GET /api/merchant-hunters/{hunterId}/merchants/{merchantId}
```
Get detailed information for a specific merchant including all documents and activity.

### 3. **Update Merchant Status**
```bash
PUT /api/merchant-hunters/{hunterId}/merchants/{merchantId}
```

**Request Body:**
```json
{
  "status": "completed",
  "merchantStatus": "approved"
}
```

**Status Values:**
- `status`: `"not_started"` | `"in_progress"` | `"completed"` | `"rejected"`
- `merchantStatus`: `"pending"` | `"approved"` | `"rejected"`

### 4. **Merchant Activity Log**
```bash
GET /api/merchants/{merchantId}/activity-logs?limit=50&hunterId={hunterId}
POST /api/merchants/{merchantId}/activity-logs
```

Get all activities for a merchant or log new activity.

---

## 🎨 Dashboard Component Usage

### Import the Hook
```typescript
import { useMerchantTracker } from "@/hooks/useMerchantTracker"
```

### Use in Component
```typescript
const { merchants, summary, loading, error, updateMerchantStatus, refreshData } = useMerchantTracker(hunterId)

// Update merchant status
const handleApprove = async (merchantId) => {
  await updateMerchantStatus(merchantId, 'completed', 'approved')
}

// Manual refresh
const handleRefresh = async () => {
  await refreshData()
}
```

### Features
✅ **Live Data Updates** - Auto-refreshes every 30 seconds
✅ **Merchant List** - View all merchants with status
✅ **Detail Modal** - Click merchant to see full details
✅ **Quick Actions** - Approve/Reject merchants in-place
✅ **Activity Tracking** - See all changes and history
✅ **Status Distribution** - Visual breakdown of statuses

---

## 📊 Merchant Statuses

### Onboarding Status (status)
| Status | Meaning |
|--------|---------|
| `not_started` | Hunter hasn't started onboarding |
| `in_progress` | Currently processing merchant |
| `completed` | Merchant onboarding finished |
| `rejected` | Merchant application rejected |

### Merchant Status (merchantStatus)
| Status | Meaning |
|--------|---------|
| `pending` | Awaiting approval |
| `approved` | Merchant approved ✓ |
| `rejected` | Merchant rejected ✗ |

---

## 🚀 Quick Integration Example

### In Page Component
```typescript
'use client'

import Dashboard from '@/components/DashboardLive'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()
  
  return (
    <Dashboard hunterId={session?.user?.id} />
  )
}
```

### Test URLs
```bash
# Get hunter's merchants (replace with real IDs)
curl http://localhost:3000/api/merchant-hunters/hunter_123/merchants

# Get merchant details
curl http://localhost:3000/api/merchant-hunters/hunter_123/merchants/merchant_456

# Update merchant status
curl -X PUT http://localhost:3000/api/merchant-hunters/hunter_123/merchants/merchant_456 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","merchantStatus":"approved"}'

# Get activity logs
curl http://localhost:3000/api/merchants/merchant_456/activity-logs?limit=10
```

---

## 📱 Features in DashboardLive Component

### Dashboard Sections
1. **Welcome** - Shows summary and refresh button
2. **Stats Cards** - Total, Onboarded, In Progress, Pending counts
3. **Performance Chart** - Visual trend of leads vs onboarded
4. **Status Distribution** - Progress bars for each status
5. **Merchant List** - Live list of all merchants
6. **Detail Modal** - Click any merchant to see full info

### Real-time Features
- ✅ Auto-refresh every 30 seconds
- ✅ Manual refresh button
- ✅ Live status updates
- ✅ Document verification tracking
- ✅ Activity history with timestamps
- ✅ Inline approve/reject actions

---

## 🔄 Data Flow

```
Hunter Login
    ↓
hunterId extracted
    ↓
useMerchantTracker(hunterId)
    ↓
GET /api/merchant-hunters/{hunterId}/merchants
    ↓
Display merchants in Dashboard
    ↓
Click merchant → Show detail modal
    ↓
Approve/Reject → PUT status
    ↓
Auto-refresh or manual refresh
```

---

## 🛠️ Troubleshooting

### Merchants Not Loading?
- Check hunterId is passed to component
- Verify merchant_hunter_merchants table has data
- Check browser console for errors

### Status Not Updating?
- Ensure merchantId matches database
- Verify hunterId-merchantId relationship exists
- Check activity logs table for error logs

### Live Data Not Updating?
- Component auto-refreshes every 30 seconds
- Click "Refresh Data" button for immediate update
- Check network tab for API calls

---

## 📝 Database Schema

### Related Tables
- `merchants` - Merchant information
- `merchant_hunter_merchants` - Relationship between hunters & merchants
- `merchant_activity_logs` - All merchant activities
- `merchant_onboarding_documents` - Document files
- `merchant_logins` - Login credentials

---

Created with ❤️ for Merchant Onboarding Redesign

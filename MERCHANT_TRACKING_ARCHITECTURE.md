# 🎨 Merchant Tracking System - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      MERCHANT HUNTER                             │
│                    (Logged In User)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │    DashboardLive Component     │
        │  - Real-time merchant list     │
        │  - Status tracking             │
        │  - Approve/Reject actions      │
        └────────────┬───────────────────┘
                     │
        ┌────────────▼────────────┐
        │  useMerchantTracker     │
        │  (React Hook)           │
        │  - Auto-refresh 30s     │
        │  - State management     │
        └────────────┬────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   GET       │ │    PUT      │ │    GET      │
│ merchants   │ │   update    │ │  activity   │
│ /merchants  │ │   status    │ │   logs      │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │                │               │
       └────────────────┼───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │       DATABASE (Neon)         │
        │                               │
        │  ┌──────────────────────────┐ │
        │  │  merchant_hunters        │ │
        │  │  merchant_merchant_rels  │ │
        │  │  merchants               │ │
        │  │  activity_logs           │ │
        │  │  documents               │ │
        │  └──────────────────────────┘ │
        └───────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MERCHANT TRACKING & MANAGEMENT FLOW                │
│                                                     │
└─────────────────────────────────────────────────────┘

Step 1: AUTHENTICATION
└─ Hunter logs in
   └─ Session created
      └─ hunterId extracted

Step 2: DASHBOARD LOAD
└─ Page mounts with hunterId
   └─ useMerchantTracker hook initializes
      └─ Makes API call to fetch merchants

Step 3: DATA FETCH
└─ GET /api/merchant-hunters/{hunterId}/merchants
   ├─ Query database
   ├─ Join with merchant data
   ├─ Include documents & activity logs
   └─ Return formatted response

Step 4: DISPLAY
└─ Parse API response
   ├─ Calculate summary stats
   ├─ Map merchants to UI components
   └─ Render dashboard

Step 5: USER INTERACTIONS
├─ View merchant list
├─ Click merchant → Show detail modal
├─ See merchant status (Completed, In Progress, etc.)
├─ View documents
├─ View activity history
└─ Click Approve/Reject

Step 6: STATUS UPDATE
└─ Hunter clicks Approve/Reject
   ├─ Show loading state
   ├─ Make PUT request
   │  └─ PUT /api/merchant-hunters/{hunterId}/merchants/{merchantId}
   │     └─ Update status in database
   │     └─ Create activity log entry
   ├─ Show success/error
   └─ Auto-refresh or manual refresh

Step 7: LIVE UPDATES
└─ Every 30 seconds:
   ├─ Auto-fetch latest data
   ├─ Check for status changes
   ├─ Update UI
   └─ Show real-time data

Or manual:
   └─ User clicks "Refresh Data" button
      └─ Immediately fetch latest
         └─ Update UI
```

---

## 📊 Component Hierarchy

```
App
├── Page (dashboard/merchant-onboarding)
│   ├── Session Check
│   └── DashboardLive
│       ├── useMerchantTracker (hook)
│       │   ├── useState(merchants)
│       │   ├── useState(summary)
│       │   ├── useEffect(fetch)
│       │   └── useEffect(poll 30s)
│       │
│       ├── Welcome Section
│       ├── Error Alert (conditional)
│       ├── Stats Cards (4x)
│       │   └── Card
│       │       ├── Icon
│       │       ├── Value
│       │       └── Trend
│       │
│       ├── Charts Section
│       │   ├── Area Chart (Performance)
│       │   └── Status Distribution
│       │
│       ├── Merchant List
│       │   └── Merchant Item (map)
│       │       ├── Avatar
│       │       ├── Name & Info
│       │       ├── Status Badge
│       │       └── Days Elapsed
│       │
│       └── Detail Modal (conditional)
│           ├── Merchant Info
│           ├── Documents List
│           ├── Activity History
│           └── Action Buttons (Approve/Reject)
```

---

## 🗄️ Database Schema (Simplified)

```
merchant_hunters
├─ id (PK)
├─ email
├─ firstName
├─ lastName
├─ isActive
├─ targetMonthly
├─ onboardedCount
└─ rejectedCount

merchant_hunter_merchants (Junction)
├─ id (PK)
├─ merchantHunterId (FK)
├─ merchantId (FK)
├─ status ("not_started", "in_progress", "completed", "rejected")
├─ onboardingStartedAt
├─ completedAt
└─ onboardingDaysElapsed

merchants
├─ id (PK)
├─ businessName
├─ ownerName
├─ email
├─ phone
├─ status ("pending", "approved", "rejected")
├─ isVerified
└─ createdAt

merchant_activity_logs
├─ id (PK)
├─ merchantId (FK)
├─ merchantHunterId (FK)
├─ action ("STATUS_UPDATE", etc.)
├─ description
├─ performedByRole
├─ createdAt
└─ metadata (JSON)

merchant_onboarding_documents
├─ id (PK)
├─ merchantId (FK)
├─ documentType
├─ fileName
├─ fileUrl
├─ isVerified
└─ uploadedAt
```

---

## 🎯 API Endpoint Map

```
                    API Endpoints
                         │
        ┌────────────────┬┴────────────────┐
        │                │                 │
        ▼                ▼                 ▼

┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│   Merchants      │ │   Hunter Data   │ │   Activity Logs  │
│   Resources      │ │   Resources     │ │   Resources      │
└──────────────────┘ └─────────────────┘ └──────────────────┘
        │                    │                     │
        │         ┌──────────┼──────────┐         │
        │         │          │          │         │
    GET /merchants│   GET /merchant-    │         │
        │         │   hunters/{id}/     │         │
    POST create   │   merchants         │         │
        │         │                     │         │
        │         │   PUT update        │         │
        │         │   status            │         │
        │         │                     │         │
        │         │   GET details       │         │
        │         │   {id}/merchants    │         │
        │         │   {merchantId}      │         │
        │         │                     │         │
        └─────────┴─────────────────────┘         │
                           │                      │
                           │        GET activity- │
                           │        logs/{id}     │
                           │                      │
                           │        POST log      │
                           │        activity      │
                           │                      │
                           └──────────┬───────────┘
                                      │
                              ┌───────▼───────┐
                              │   Database    │
                              │  (PostgreSQL) │
                              └───────────────┘
```

---

## 🎨 UI State Machine

```
┌─────────────────────────────────────────────────────┐
│              DASHBOARD UI STATES                    │
└─────────────────────────────────────────────────────┘

┌──────────────┐
│   LOADING    │ ← Initial page load
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   READY          │ ← Data loaded successfully
└──────┬───────────┘
       │
       ├─── User clicks merchant ──→ ┌────────────┐
       │                            │  MODAL     │
       │                            │  OPEN      │
       │                            └────────────┘
       │
       ├─── User clicks Approve ──→ ┌─────────────┐
       │                            │ UPDATING    │
       │                            │ STATUS      │
       │                            └──────┬──────┘
       │                                   │
       │                                   ▼
       │                            ┌──────────────┐
       │                            │ SUCCESS /    │
       │    ◄───────────────────────── ERROR       │
       │                            └──────────────┘
       │
       └─── Auto-refresh (30s) ──→ Data refreshes
            │                      │
            └──────────────────────┘

```

---

## 📱 Responsive Design Flow

```
Desktop (> 1024px)
├─ 4-column stats cards
├─ 2/3 + 1/3 split for charts
└─ Full merchant list

Tablet (768px - 1024px)
├─ 2-column stats cards
├─ Stacked charts
└─ Scrollable merchant list

Mobile (< 768px)
├─ 1-column stats cards
├─ Full-width charts
└─ Vertical merchant list
    └─ Click to expand

All have:
├─ Touch-friendly buttons
├─ Scrollable content
├─ Modal overlay
└─ Safe padding
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│  Session Created    │
│  (via NextAuth)     │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│ Extract hunterId from    │
│ session.user.id          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Pass to DashboardLive    │
│ hunterId={hunterId}      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ useMerchantTracker       │
│ Fetches hunter's data    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Display dashboard with   │
│ hunter's merchants       │
└──────────────────────────┘
```

---

## 🎯 Merchant Status Flow

```
Initial State
    ↓
NOT_STARTED
    ├─ Hunter starts working on merchant
    │
    ▼
IN_PROGRESS
    ├─ Hunter gathering documents
    ├─ Hunter verifying info
    │
    ├─ All documents ready?
    │
    ├─ YES ──→ Hunter marks complete
    │
    ▼
COMPLETED (onboarding done)
    │
    ├─ Admin reviews
    │
    ├─ APPROVED ──→ merchant_status = "approved"
    │              isVerified = true
    │
    └─ REJECTED ──→ status = "rejected"
                    merchant_status = "rejected"
                    isVerified = false

At any stage:
    └─ Hunter can mark REJECTED
       └─ status = "rejected"
          merchant_status = "rejected"
```

---

## ⏱️ Auto-Refresh Timeline

```
User Opens Dashboard
    │
    ├─ Initial load ──→ useMerchantTracker hook
    │                  └─ fetchMerchants()
    │
    ├─ Poll starts ──→ 30-second interval
    │
    ▼
While user viewing:
├─ 0s     → Data loaded
├─ 30s    → Auto-refresh #1
├─ 60s    → Auto-refresh #2
├─ 90s    → Auto-refresh #3
│
├─ User clicks refresh button (manual) → Immediate refresh
│
└─ User closes tab → cleanup + interval cleared
```

---

## 🎓 Key Design Patterns

### 1. Custom Hook Pattern
```
useMerchantTracker(hunterId)
  └─ Encapsulates all data logic
     ├─ Fetch merchants
     ├─ Update status
     ├─ Auto-poll
     └─ Error handling
```

### 2. Real-time Updates
```
useEffect with setInterval
  └─ Polls API every 30 seconds
     ├─ Always fresh data
     ├─ No user action needed
     └─ Configurable interval
```

### 3. Modal Pattern
```
showDetailModal state
  └─ Toggle with onClick
     ├─ Click merchant → modal opens
     ├─ Click X → modal closes
     ├─ Modal shows full details
     └─ Approve/Reject buttons trigger API
```

### 4. Status Management
```
Unified status fields
  ├─ status: Onboarding progress
  ├─ merchantStatus: Merchant approval
  └─ isVerified: Document verification
```

---

Created: January 21, 2026
System: Merchant Tracking & Management
Status: ✅ COMPLETE

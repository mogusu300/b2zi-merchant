# Admin Dashboard - Visual Guide

## 🎯 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                 Merchant Dashboard                   │
└─────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ TOTAL    │  │ PENDING  │  │APPROVED  │  │REJECTED  │
│   14     │  │    5     │  │    6     │  │    3     │
│ Merchants│  │  Review  │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search by name, email, or owner...                      │
│ [All] [Pending] [Approved] [Rejected]                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ TechHub Store                     │  │ Fashion Zone                     │
│ ████████████████ Pending          │  │ ████████████████ Approved        │
│ Owner: John Doe                   │  │ Owner: Jane Smith                │
│ john@techhub.com  +263771234567   │  │ jane@fashionzone.com  +2637...   │
│ Retail | 123 Main St              │  │ Retail | 456 Second Ave          │
│ Registered: 12/10/2024            │  │ Registered: 12/08/2024           │
│                                   │  │                                  │
│ [View Details]  [... Menu]        │  │ [View Details]  [... Menu]       │
└──────────────────────────────────┘  └──────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ Electronics Plus                  │  │ Next merchant...                 │
│ ████████████████ Rejected         │  │                                  │
│ Owner: Bob Wilson                 │  │                                  │
│ bob@electronicsplus.com  +2637... │  │                                  │
│ Wholesale | 789 Third Rd          │  │                                  │
│ Registered: 12/05/2024            │  │                                  │
│                                   │  │                                  │
│ [View Details]  [... Menu]        │  │ [View Details]  [... Menu]       │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 🔍 Search & Filter Showcase

### Default View (All Merchants)
```
Total: 14 | Pending: 5 | Approved: 6 | Rejected: 3

[All Merchants]
├── TechHub Store ............ Pending
├── Fashion Zone ............ Approved
├── Electronics Plus ....... Rejected
├── (11 more merchants)
```

### After Searching "Fashion"
```
[Search: "Fashion"]
[All Merchants]
├── Fashion Zone ............ Approved
```

### After Filtering "Pending"
```
[All Merchants] [Pending ✓] [Approved] [Rejected]
├── TechHub Store ............ Pending
├── (4 more pending merchants)
```

### After Approving a Pending Merchant
```
Total: 14 | Pending: 4 ↓ | Approved: 7 ↑ | Rejected: 3

Merchant card status changed from Pending → Approved
Badge color changed from Yellow → Green
```

---

## 📋 Detail Modal Layout

```
┌─────────────────────────────────────────────────────┐
│  TechHub Store                         🟡 Pending    │
│  Retail • 123 Main St, Harare                       │
└─────────────────────────────────────────────────────┘

┌────────────────────┐  ┌────────────────────────────┐
│ Owner Information  │  │ ID Documents               │
│                    │  │ ┌──────────────┐           │
│ Name               │  │ │   ID Front   │ [Hide ▼]  │
│ John Doe           │  │ │              │           │
│                    │  │ │  [Image]     │           │
│ Email              │  │ │              │           │
│ john@techhub.com   │  │ └──────────────┘           │
│                    │  │ ┌──────────────┐           │
│ Phone              │  │ │   ID Back    │           │
│ +263771234567      │  │ │              │           │
│                    │  │ │  [Image]     │           │
│ Business Type      │  │ │              │           │
│ Retail             │  │ └──────────────┘           │
│                    │  │                            │
│ Address            │  │                            │
│ 123 Main St, ...   │  │                            │
│                    │  │                            │
│ Registered         │  │                            │
│ 12/10/2024         │  │                            │
└────────────────────┘  └────────────────────────────┘

[Reject ✗] [Approve ✓] [Export] [Download]
```

---

## 🎨 Color Coding Guide

### Status Colors
```
🟡 PENDING       │ Yellow background, yellow text
   Under Review  │ Indicates action needed

🟢 APPROVED      │ Green background, green text
   Accepted      │ Indicates successful status

🔴 REJECTED      │ Red background, red text
   Declined      │ Indicates rejected status

🔵 STATISTICS    │ Blue background, blue text
   Dashboard     │ Shows overall counts
```

### Visual Elements on Cards
```
┌─────────────────────────────────────────┐
│ ████ Yellow Left Border = Pending        │
│ ████ Green Left Border = Approved        │
│ ████ Red Left Border = Rejected          │
│                                         │
│ 🟡 Yellow Badge = Pending Review       │
│ 🟢 Green Badge = Approved               │
│ 🔴 Red Badge = Rejected                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Button Actions

### On Merchant Card
```
┌─────────────────────────────────┐
│ Merchant Name                   │
│ Status Badge                    │
│ Contact Information             │
│                                 │
│ [View Details]  [⋯ Menu]       │
│  Opens modal      Dropdown      │
└─────────────────────────────────┘
```

### Dropdown Menu (For Pending Merchants)
```
┌─────────────────┐
│ 👁 View Details │ ← Opens detail modal
├─────────────────┤
│ ✓ Approve       │ ← Changes status to Approved
├─────────────────┤
│ ✗ Reject        │ ← Changes status to Rejected
├─────────────────┤
│ ⬇ Export        │ ← Ready to implement
└─────────────────┘
```

### In Detail Modal
```
┌──────────────────────────────────────────┐
│ Merchant Information                     │
│                                          │
│ [Reject ✗]  [Approve ✓]  [Export] [DL] │
│   Red btn      Green btn                 │
└──────────────────────────────────────────┘
```

---

## 📱 Responsive Layouts

### Mobile (< 640px)
```
┌────────────┐
│  Dashboard │ (Title only, no spacing)
└────────────┘

┌────────────┐
│ Total: 14  │
├────────────┤
│Pending: 5  │ (Stacked vertically)
├────────────┤
│Approved: 6 │
├────────────┤
│Rejected: 3 │
└────────────┘

┌────────────┐
│ 🔍 Search  │ (Full width)
└────────────┘

[All]
[Pending]
[Approved]
[Rejected]
(Buttons stacked)

┌────────────┐
│  Merchant  │ (Full width cards)
│   Card     │
│            │
│  [Details] │ (Buttons stacked)
│  [Menu]    │
└────────────┘
```

### Tablet (640px - 1024px)
```
┌──────────────────────┐
│  Dashboard (centered)│
└──────────────────────┘

┌─────┐  ┌─────┐
│Total│  │Pending│ (2x2 grid)
├─────┤  ├─────┤
│App  │  │Reject│
└─────┘  └─────┘

┌──────────────────────┐
│ 🔍 Search            │
│ [All] [Pending] ...  │
└──────────────────────┘

┌────────────┐  ┌────────────┐
│ Merchant   │  │ Merchant   │
│ Card       │  │ Card       │
└────────────┘  └────────────┘

┌────────────┐  ┌────────────┐
│ Merchant   │  │ Merchant   │
│ Card       │  │ Card       │
└────────────┘  └────────────┘
```

### Desktop (> 1024px)
```
┌─────────────────────────────────────────┐
│  ← Back          Merchant Dashboard       │
└─────────────────────────────────────────┘

┌─────┐  ┌────────┐  ┌─────────┐  ┌────────┐
│Total│  │ Pending│  │Approved │  │Rejected│
│ 14  │  │  5     │  │   6     │  │   3    │
└─────┘  └────────┘  └─────────┘  └────────┘

┌────────────────────────┐  ┌──────────────────────┐
│ 🔍 Search...           │  │ [All] [Pending] ... │
└────────────────────────┘  └──────────────────────┘

┌────────────────────────┐  ┌──────────────────────┐
│ Merchant Card          │  │ Merchant Card        │
│                        │  │                      │
│ [Details] [Menu]       │  │ [Details] [Menu]     │
└────────────────────────┘  └──────────────────────┘

┌────────────────────────┐  ┌──────────────────────┐
│ Merchant Card          │  │ Merchant Card        │
│                        │  │                      │
│ [Details] [Menu]       │  │ [Details] [Menu]     │
└────────────────────────┘  └──────────────────────┘
```

---

## 🔄 User Flow: Approve a Merchant

```
User navigates to /admin
         ↓
Dashboard loads with 14 mock merchants
         ↓
User sees pending merchants (yellow)
         ↓
User clicks "View Details" on a pending merchant
         ↓
Detail modal opens showing:
- Full merchant information
- ID documents
- Approve/Reject buttons
         ↓
User clicks green "Approve" button
         ↓
Button sends request to /api/merchant
         ↓
Status changes to "Approved"
         ↓
Merchant card background changes from yellow to green
         ↓
Stats update:
- Pending count decreases by 1
- Approved count increases by 1
         ↓
Modal closes automatically
         ↓
User sees updated dashboard
```

---

## 🎨 Component Hierarchy

```
AdminPage (Main Component)
│
├── Header
│   └── Back Link + Title
│
├── StatsGrid
│   ├── StatCard (Total)
│   ├── StatCard (Pending)
│   ├── StatCard (Approved)
│   └── StatCard (Rejected)
│
├── SearchSection
│   ├── Search Input
│   └── Filter Buttons
│
├── MerchantsList
│   ├── MerchantCard
│   │   ├── Merchant Info
│   │   ├── Status Badge
│   │   └── Action Buttons
│   │       ├── View Details Button
│   │       └── Dropdown Menu
│   │           ├── View Details
│   │           ├── Approve (if pending)
│   │           ├── Reject (if pending)
│   │           └── Export
│   │
│   ├── MerchantCard (repeated)
│   └── ... (more cards)
│
└── DetailModal
    ├── Merchant Details
    ├── Document Preview
    └── Action Buttons
        ├── Reject Button
        ├── Approve Button
        ├── Export Button
        └── Download Button
```

---

## 💬 Confirmation Messages

```
Status Update in Progress:
[Loading...] Approve button is disabled

Success:
✓ Status updated to Approved
  Modal closes
  Card updates
  Stats refresh

Error:
✗ Failed to update merchant status
  Button remains enabled
  User can retry
```

---

## 🎯 Key Interactions Summary

| Action | Trigger | Result |
|--------|---------|--------|
| Search | Type in search box | List filters in real-time |
| Filter | Click status button | List shows only that status |
| View Details | Click button or menu | Modal opens with full info |
| Document Preview | Click image toggle | Shows/hides ID documents |
| Approve | Click green button | Status → Approved, stats ↑ |
| Reject | Click red button | Status → Rejected, stats ↑ |
| Export | Click export button | Ready to implement |
| Download | Click download button | Ready to implement |

---

## 📊 Mock Data Reference

```
1. TechHub Store        → Pending   (Yellow)
2. Fashion Zone         → Approved  (Green)
3. Electronics Plus     → Rejected  (Red)
4-14. (More merchants with mixed statuses)

Search by:
- Name: "TechHub", "Fashion", "Electronics"
- Owner: "John", "Jane", "Bob"
- Email: "@techhub", "@fashion", "@electronics"
```

---

## 🔧 Implementation Details

### Data Flow
```
User Action
  ↓
Event Handler Called
  ↓
fetch() API Request
  ↓
Server Processes
  ↓
Response Received
  ↓
Local State Updated
  ↓
Component Re-renders
  ↓
UI Reflects Changes
```

### State Management
```
const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants)
const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('all')
const [selectedMerchant, setSelectedMerchant] = useState(null)
const [detailOpen, setDetailOpen] = useState(false)
```

---

## 🎓 What This Demonstrates

✅ React Hooks (useState)  
✅ TypeScript Type Safety  
✅ Component Composition  
✅ Event Handling  
✅ Conditional Rendering  
✅ Array Filtering  
✅ API Integration  
✅ State Updates  
✅ Modal Dialogs  
✅ Responsive Design  

---

**This visual guide shows exactly what your admin dashboard looks like and how it works!**

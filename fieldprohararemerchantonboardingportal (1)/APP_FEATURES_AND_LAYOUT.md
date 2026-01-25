# FieldPro Harare - Complete App Documentation

## Overview
FieldPro Harare is a B2B merchant onboarding and management portal designed for sales agents in Zimbabwe's CBD (Central Business District) to efficiently manage merchant acquisitions and track performance.

---

## App Architecture & Layout

### **Main Navigation Structure**

```
┌─────────────────────────────────────────────────────┐
│ FIELDPRO HARARE                                     │
├─────────────────────────────────────────────────────┤
│         │                                           │
│ SIDEBAR │            MAIN CONTENT AREA              │
│         │                                           │
│ • Home  │  ┌─────────────────────────────────────┐  │
│ • Merch │  │                                     │  │
│ • New   │  │  Dynamic Pages (Dashboard,          │  │
│ • Perf  │  │  Merchants, Onboarding)             │  │
│ • Target│  │                                     │  │
│         │  │                                     │  │
│         │  └─────────────────────────────────────┘  │
│         │                                           │
│ Settings│  ────────────────────────────────────     │
│ Logout  │                                           │
└─────────────────────────────────────────────────────┘

Mobile (Bottom Navigation):
┌─────────────────────────────────────────────────────┐
│            Content Area                             │
├─────────────────────────────────────────────────────┤
│  Home │ Merch │ + (FAB) │ Map │ Leads               │
└─────────────────────────────────────────────────────┘
```

---

## Core Features & Functionalities

### **1. Dashboard**
**Purpose:** Real-time performance overview and quick actions

**Key Components:**
- **Welcome Card**
  - Personalized greeting with current status
  - Weekly milestone progress indicator
  - Quick action buttons (View Map, Download Reports)
  - Animated decorative background elements

- **Stats Cards Grid** (4 columns)
  - Total Onboarded (Green indicator)
  - Pending Verification (Amber indicator)
  - Daily Field Visits (Blue indicator)
  - Conversion Rate % (Primary color)
  - Each shows trend indicators (+12% growth)

- **Acquisition Performance Chart**
  - Area chart tracking leads vs onboarded merchants
  - 7-day view with date filter
  - Dual-line graph: Sage green (leads) & Deep olive (onboarded)
  - Tooltip on hover for detailed values

- **Recent Activity Panel**
  - Merchant status updates
  - Scrollable list (5 visible items)
  - Color-coded status badges
  - View All History button

**Metrics Tracked:**
- Onboarded count
- Pending verification count
- Field visits
- Conversion rate

---

### **2. My CBD Merchants**
**Purpose:** Manage and track all acquired merchants

**Key Components:**
- **Search & Filter Bar**
  - Real-time search by merchant name or owner
  - Filter button for advanced filtering options
  - Responsive search input with icon

- **Merchant Table** (Responsive)
  - Merchant Name with avatar
  - Location with map pin icon
  - Status badge (Onboarded/Pending)
  - Onboarded date
  - Action buttons (Phone, External Link, More)
  - Hover effects for interactivity
  - Staggered animation on load

- **Pagination Footer**
  - Shows current results count
  - Previous/Next navigation buttons
  - Disabled state for boundary navigation

**Data Displayed:**
- Merchant ID, Name, Owner
- Location details
- Status (Onboarded/Pending)
- Category
- Date added

---

### **3. New Field Activation (Onboarding)**
**Purpose:** Register new merchants with multi-step form

**Step 1: Basic Information**
- Business Name (required)
  - Icon: Store
  - Placeholder: "e.g. Harare General Traders"
  
- Owner Full Name (required)
  - Icon: User
  - Placeholder: "Enter full name"
  
- CBD Location Details (required)
  - Icon: Map Pin
  - Placeholder: "Street name, Building, Shop number"
  
- Merchant Category (required dropdown)
  - Options: Retail, Electronics, Clothing, Food & Grocery, Hardware
  - Icon: Briefcase
  
- WhatsApp Contact (required)
  - Icon: Smartphone
  - Format: +263...
  
- Next Step Button → Proceeds to Step 2

**Step 2: Documentation**
- Educational banner: "Ensure merchant has downloaded app on their device"
- Document capture zones (drag & drop):
  - Trading License upload
  - Owner ID/Passport upload
- Back button (returns to Step 1)
- Complete Onboarding button with loading state

**Success State:**
- Animated checkmark icon
- Success message with merchant name
- 24-48 hour verification timeline
- Auto-redirect to Merchant List

**Form Features:**
- Step indicator (progress bar)
- Smooth slide animations between steps
- Input validation
- Loading spinner on submission
- Success feedback

---

### **4. Sidebar Navigation**
**Purpose:** Main app navigation and user context

**Navigation Items:**
1. Dashboard (LayoutDashboard icon)
2. My Merchants (Store icon)
3. New Activation (UserPlus icon - active tab FAB style)
4. Performance Analytics (BarChart3 icon)
5. Weekly Targets (Target icon)

**Sidebar Features:**
- Active tab highlighting with sage green background
- Icon + label for each menu item
- Weekly Progress indicator
  - Progress bar showing completion %
  - Animated fill

- Footer Section
  - Settings option
  - Logout button (red text)

**Responsive Behavior:**
- Desktop: Always visible
- Mobile: Slide-out drawer with overlay
- Close button (X) for mobile drawer

---

### **5. Header/Top Navigation**
**Purpose:** User context and quick access tools

**Components:**
- **Logo & Title**
  - Logo icon + "FieldPro Harare" text
  - Mobile: Shows abbreviated form
  - Desktop: Full text visible

- **Search Bar** (Desktop only)
  - Placeholder: "Search CBD Merchants..."
  - Full-width on tablet, 264px on desktop
  - Rounded pill shape

- **Notifications Bell**
  - Bell icon with red dot indicator
  - Shows unread notifications

- **User Profile**
  - Avatar with initials (JD)
  - Name: John Doe
  - Role: Sales Agent
  - Mobile: Avatar only

---

### **6. Mobile Bottom Navigation** (Mobile/Tablet)
**Purpose:** Easy thumb-friendly navigation on small screens

**Navigation Items:**
1. Home (Dashboard)
2. Merchants (My CBD Merchants)
3. + New Activation (Large centered FAB button)
4. Map View (Placeholder)
5. Leads (Placeholder)

**Features:**
- 5 navigation buttons in a row
- Center FAB button for primary action (+)
- Active state with background color and scale animation
- Persistent at bottom of screen

---

## Design System

### **Color Palette**
- **Primary (Deep Olive):** #2e3621 - Main brand color, buttons, accents
- **Secondary (Sage Green):** #b1c98d - Highlights, inactive states, accents
- **Success (Green):** #10b981 - Positive status, completed items
- **Warning (Amber):** #f59e0b - Pending status, caution
- **Information (Blue):** #3b82f6 - Additional info
- **Background:** White (#ffffff) & Light Gray (#f9fafb)
- **Text:** Dark Gray (#1f2937), Medium Gray (#6b7280)

### **Typography**
- **Headings:** Bold, 2xl-4xl sizes
- **Body Text:** Regular weight, 14px base
- **Labels:** Small, 10-12px, bold uppercase with letter-spacing
- **Font Family:** System fonts (SF Pro, Segoe UI, Roboto)

### **Spacing & Sizing**
- Grid: 4px base unit
- Gaps: 4px, 8px, 16px, 24px, 32px
- Border Radius: 8px (rounded-xl), 12px (rounded-2xl), 16px (rounded-3xl)
- Shadow: Subtle elevation shadows on cards

### **Icons**
- Lucide React icons (18px-24px)
- Consistent weight and style
- Color-coded by status

---

## Key Interactions & Animations

1. **Page Transitions**
  - Fade in/up animation on page load
  - Smooth opacity transitions

2. **Button States**
  - Hover: Opacity change or background color shift
  - Active: Scale down (95%) with spring effect
  - Disabled: Reduced opacity

3. **Card Interactions**
  - Hover: Shadow elevation increase
  - Staggered load animation with delays

4. **Form Submissions**
  - Loading spinner on submit button
  - Success state with animation
  - Auto-redirect after success

5. **Search/Filter**
  - Real-time filtering
  - Empty state with icon and message
  - Fade transitions

---

## Technical Stack

- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui + custom components
- **Icons:** Lucide React
- **Charts:** Recharts for data visualization
- **State Management:** React hooks (useState, useEffect)
- **Routing:** Tab-based navigation (not file-based)

---

## Responsive Breakpoints

- **Mobile:** < 640px (Single column, bottom nav)
- **Tablet:** 640px - 1024px (Hybrid layout)
- **Desktop:** > 1024px (Full sidebar + main content)

---

## Data Models

### **Merchant Object**
```typescript
{
  id: string
  name: string
  owner: string
  location: string
  status: "Onboarded" | "Pending"
  category: "Retail" | "Electronics" | "Clothing" | "Food & Grocery" | "Hardware"
  dateAdded: string (YYYY-MM-DD)
  phone?: string
  email?: string
}
```

### **Dashboard Stats**
```typescript
{
  onboardedCount: number
  pendingCount: number
  dailyVisits: number
  conversionRate: string (percentage)
  weeklyProgress: number (0-100)
}
```

---

## Future Enhancement Opportunities

1. **Map Integration** - GPS-based merchant location tracking
2. **Real-time Analytics** - Live performance dashboard
3. **Merchant Profiles** - Detailed merchant pages with transaction history
4. **Mobile App** - Native iOS/Android application
5. **Notifications** - Push notifications for status updates
6. **Reports** - Exportable performance reports
7. **CRM Integration** - Sync with external CRM systems
8. **Multi-user Roles** - Admin, Manager, Sales Agent roles
9. **Bulk Operations** - Import/export merchant data
10. **Performance Leaderboard** - Gamification for sales agents

---

## Testing Scenarios

1. Add new merchant through onboarding form
2. Search merchants by name/owner
3. Filter merchants by status
4. View performance analytics
5. Navigate between tabs on mobile
6. Responsive layout on different screen sizes
7. Success/error states in forms
8. Real-time search filtering
9. Pagination navigation
10. Empty state handling

---

*Last Updated: January 2026*
*Version: 1.0*

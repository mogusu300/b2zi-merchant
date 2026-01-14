# 🎨 UI/UX Implementation Guide - Visual Layouts

## Customer Order Detail Page - Layout Overview

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            ORDER DETAIL PAGE                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ← Back  Order #ABC123XYZ        Status: ⏳ Awaiting Payment (Blue Badge)      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ORDER INFORMATION                      │  STATUS PROGRESS                   ║
║  ─────────────────                      │  ─────────────────                 ║
║  Date: Jan 14, 2025                     │  1. Placed ✓                       ║
║  Total: $109.98                         │  ─────────────────────────          ║
║                                         │  2. Review ✓                        ║
║                                         │  ─────────────────────────          ║
║  ITEMS                                  │  3. Payment Pending ⏳               ║
║  ──────                                 │  ─────────────────────────          ║
║  Product A × 2                          │  4. Received                        ║
║  Seller: Merchant Store                 │  ─────────────────────────          ║
║  Color: Red, Size: Large                │  5. Dispatched                      ║
║  Price: $49.99 each                     │  ─────────────────────────          ║
║                                         │  6. In Transit                      ║
║  Product B × 1                          │  ─────────────────────────          ║
║  Seller: Another Store                  │  7. Delivered                       ║
║  Price: $10.00                          │                                    ║
║                                         │  PAYMENT                            ║
║  DELIVERY ADDRESS                       │  ──────────                        ║
║  ──────────────────                     │  Amount Due: $109.98                ║
║  John Doe                               │                                    ║
║  123 Main Street                        │  ○ Credit/Debit Card               ║
║  Lusaka, Lusaka 10101                   │  ○ Bank Transfer                   ║
║  Phone: +260123456789                   │  ○ Cash on Delivery                ║
║                                         │                                    ║
║                                         │  [Pay Now] (Blue button)            ║
║                                         │                                    ║
║                                         │  All payments are secure             ║
║                                         │  and encrypted                      ║
║                                         │                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ORDER TIMELINE                                                              ║
║  ──────────────                                                              ║
║                                                                               ║
║  📦  Order Created                      Jan 14, 2025 10:00 AM               ║
║  ├─ Order ID: order_abc123              Placed by: You                       ║
║  │                                                                            ║
║  ✓ Approved by Merchant                 Jan 14, 2025 10:30 AM               ║
║  ├─ Approved by: Merchant Store                                              ║
║  │                                                                            ║
║  💳 Payment Received                    Jan 14, 2025 10:45 AM               ║
║  ├─ Method: Credit Card                                                      ║
║  │  Amount: $109.98                                                          ║
║  │                                                                            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## After Payment - UI Changes

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            ORDER DETAIL PAGE                                  ║
║                        (After Payment Successful)                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ← Back  Order #ABC123XYZ        Status: ✓ Received (Green Badge)            ║
║                                                                               ║
║  [Same layout as above, but:]                                                 ║
║                                                                               ║
║                                         │  STATUS PROGRESS                   ║
║                                         │  ─────────────────                 ║
║                                         │  1. Placed ✓                       ║
║                                         │  2. Review ✓                        ║
║                                         │  3. Payment Pending ✓               ║
║                                         │  4. Received ⏳                      ║
║                                         │  5. Dispatched                      ║
║                                         │  6. In Transit                      ║
║                                         │  7. Delivered                       ║
║                                         │                                    ║
║                                         │  PAYMENT                            ║
║                                         │  ──────────                        ║
║                                         │  ✓ Payment Received                 ║
║                                         │                                    ║
║                                         │  Amount: $109.98                    ║
║                                         │  Method: Credit/Debit Card          ║
║                                         │  Date: Jan 14, 2025 10:45 AM       ║
║                                         │                                    ║
║                                         │  [Green success card with checkmark]║
║                                         │                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## After Dispatch - Tracking Info Appears

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            ORDER DETAIL PAGE                                  ║
║                       (After Merchant Dispatches)                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ← Back  Order #ABC123XYZ        Status: 🚚 Dispatched (Orange Badge)        ║
║                                                                               ║
║  [Order info, items, delivery address as before]                             ║
║                                                                               ║
║  TRACKING INFORMATION                  │  [Same payment success card]         ║
║  ──────────────────────                │                                    ║
║  🚚 Truck icon                          │                                    ║
║  Tracking Number: TRK123456789ABC       │                                    ║
║  Status: Dispatched                     │                                    ║
║  Estimated Delivery: Jan 20, 2025       │                                    ║
║  Driver: John Smith                     │                                    ║
║  Driver Phone: +260987654321            │                                    ║
║  Message: "Package picked up and on     │                                    ║
║           the way to Lusaka"            │                                    ║
║                                         │                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ORDER TIMELINE (With Dispatch Event Added)                                  ║
║  ──────────────────────────────────────────                                  ║
║                                                                               ║
║  📦  Order Created                      Jan 14, 2025 10:00 AM               ║
║  ✓ Approved by Merchant                 Jan 14, 2025 10:30 AM               ║
║  💳 Payment Received                    Jan 14, 2025 10:45 AM               ║
║  🚚 Dispatched                          Jan 14, 2025 11:00 AM               ║
║  ├─ Tracking: TRK123456789ABC                                                ║
║  │  Est. Delivery: Jan 20, 2025                                              ║
║  │                                                                            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Seller Order Management Dashboard - Overview

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      ORDER MANAGEMENT DASHBOARD                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Order Management              [Search: ________]  [🔄 Refresh]             ║
║                                                                               ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ ┌────────┐║
║  │ ⏰ AWAITING      │  │ 💳 AWAITING      │  │ ✓ READY TO       │ │ 🚚     ││
║  │    APPROVAL      │  │    PAYMENT       │  │    DISPATCH      │ │ IN     ││
║  │                  │  │                  │  │                  │ │ TRANSIT││
║  │ 3 Orders        │  │ 1 Order          │  │ 2 Orders        │ │ 0      ││
║  └──────────────────┘  └──────────────────┘  └──────────────────┘ └────────┘
║
║  ┌────────────────────────────────────────────────────────────────────────────┐
║  │ ⏰ AWAITING APPROVAL [v]                                    (3 orders)     │
║  ├────────────────────────────────────────────────────────────────────────────┤
║  │                                                                            │
║  │ Order #order_abc123     Created: Jan 14, 2025 10:00 AM                   │
║  │ Customer: John Doe <john@example.com>                                     │
║  │ Phone: +260123456789                                                      │
║  │ Total: $109.98                                                            │
║  │ Items: (Scrollable)                                                       │
║  │ ├─ Product A × 2                                                          │
║  │ ├─ Product B × 1                                                          │
║  │ └─ (2 items)                                                              │
║  │                                                                            │
║  │ [✓ Approve]  [✗ Reject]  [→ View Details]                                ║
║  │                                                                            │
║  ├────────────────────────────────────────────────────────────────────────────┤
║  │                                                                            │
║  │ Order #order_def456     Created: Jan 14, 2025 09:30 AM                   │
║  │ Customer: Jane Smith <jane@example.com>                                   │
║  │ Phone: +260987654321                                                      │
║  │ Total: $45.50                                                             │
║  │ Items:                                                                     │
║  │ ├─ Product C × 3                                                          │
║  │ └─ (1 item)                                                               │
║  │                                                                            │
║  │ [✓ Approve]  [✗ Reject]  [→ View Details]                                ║
║  │                                                                            │
║  └────────────────────────────────────────────────────────────────────────────┘
║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Seller Dashboard - Ready to Dispatch Queue

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      ORDER MANAGEMENT DASHBOARD                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  [Queue Cards showing:]                                                       ║
║  ⏰ Awaiting Approval: 0   │   💳 Awaiting Payment: 0   │   ✓ Ready: 2      ║
║                                                                               ║
║  ┌────────────────────────────────────────────────────────────────────────────┐
║  │ ✓ READY TO DISPATCH [v]                                   (2 orders)      │
║  ├────────────────────────────────────────────────────────────────────────────┤
║  │                                                                            │
║  │ Order #order_ghi789     Created: Jan 14, 2025 10:45 AM                   │
║  │ Customer: John Doe <john@example.com>                                     │
║  │ Phone: +260123456789                                                      │
║  │ Total: $109.98                                                            │
║  │ ✓ PAID: Jan 14, 2025 10:45 AM                                            │
║  │ Items:                                                                     │
║  │ ├─ Product A × 2                                                          │
║  │ └─ (1 item)                                                               │
║  │                                                                            │
║  │ [📦 Dispatch]  [→ View Details]                                           ║
║  │                                                                            │
║  ├────────────────────────────────────────────────────────────────────────────┤
║  │                                                                            │
║  │ Order #order_jkl012     Created: Jan 14, 2025 11:00 AM                   │
║  │ Customer: Jane Smith <jane@example.com>                                   │
║  │ Phone: +260987654321                                                      │
║  │ Total: $45.50                                                             │
║  │ ✓ PAID: Jan 14, 2025 11:15 AM                                            │
║  │ Items:                                                                     │
║  │ ├─ Product C × 3                                                          │
║  │ └─ (1 item)                                                               │
║  │                                                                            │
║  │ [📦 Dispatch]  [→ View Details]                                           ║
║  │                                                                            │
║  └────────────────────────────────────────────────────────────────────────────┘
║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Component Interaction Flow

### Customer Flow: View → Pay → Track

```
┌─────────────────────────────────────────────────────────────────────┐
│ Customer Marketplace                                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
                  [Add to Cart, Checkout]
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ /customers/orders/[id] (Page Load)   │
        │ Status: pending_approval              │
        │ Timeline: Shows creation only         │
        │ Payment: DISABLED                     │
        │ Action: Wait for approval             │
        └──────────────┬───────────────────────┘
                       │
         [Merchant Approves in Dashboard]
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Refresh /customers/orders/[id]       │
        │ Status: awaiting_payment              │
        │ Timeline: Shows approval event        │
        │ Payment: ENABLED ✓                    │
        │ Action: Select method & pay           │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Payment Modal/Section                 │
        │ ○ Credit Card (selected)              │
        │ ○ Bank Transfer                       │
        │ ○ Cash on Delivery                    │
        │ [Pay Now]                             │
        └──────────────┬───────────────────────┘
                       │
                       ▼ (Processing...)
        ┌──────────────────────────────────────┐
        │ Success! Payment Received             │
        │ Status: paid/received                 │
        │ Timeline: Shows payment event         │
        │ Action: Wait for dispatch             │
        └──────────────┬───────────────────────┘
                       │
         [Merchant Dispatches]
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Status: dispatched                    │
        │ Tracking Info: Shows number/driver    │
        │ Timeline: Shows dispatch event        │
        │ Action: Monitor tracking updates      │
        └──────────────┬───────────────────────┘
                       │
         [Merchant Updates Tracking]
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Status: in_transit → delivered        │
        │ Timeline: Updates with status changes │
        │ Completion: All steps marked ✓        │
        └──────────────────────────────────────┘
```

### Merchant Flow: Approve → Dispatch → Track

```
┌─────────────────────────────────────────────────────────────────────┐
│ /sellers/dashboard/orders                                           │
│ Queues Displayed: [⏰] [💳] [✓] [🚚]                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Click [⏰ AWAITING APPROVAL]          │
        │ Queue Expands (ChevronRight rotates) │
        │ Shows 3 pending orders                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Find Order                            │
        │ [✓ Approve]  [✗ Reject]              │
        │ Click Approve                         │
        └──────────────┬───────────────────────┘
                       │
                       ▼ (Processing...)
        ┌──────────────────────────────────────┐
        │ Success!                              │
        │ Order moves to [💳 AWAITING PAYMENT]  │
        │ Queue count updates                   │
        └──────────────┬───────────────────────┘
                       │
      [Customer Pays for Order]
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Click [✓ READY TO DISPATCH]           │
        │ Queue Expands                         │
        │ Shows 2 paid orders                   │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Find Order                            │
        │ [📦 Dispatch]                         │
        │ Click Dispatch                        │
        │ Dialog: "Enter Tracking Number?"      │
        │ Input: TRK123456789ABC                │
        │ Click: Dispatch                       │
        └──────────────┬───────────────────────┘
                       │
                       ▼ (Processing...)
        ┌──────────────────────────────────────┐
        │ Success!                              │
        │ Order moves to [🚚 IN TRANSIT]        │
        │ Queue count updates                   │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Find Order                            │
        │ [Update Tracking]                     │
        │ Dialog: Tracking Status, Message      │
        │ Select: "In Transit"                  │
        │ Message: "On the way to Lusaka"       │
        │ Driver: John Smith                    │
        │ Phone: +260987654321                  │
        │ Click: Update                         │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Same order                            │
        │ [Update Tracking]                     │
        │ Select: "Delivered"                   │
        │ Message: "Order delivered"            │
        │ Click: Update                         │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Status: DELIVERED ✓                   │
        │ Order may move to completed section   │
        │ Or disappear from active queues       │
        └──────────────────────────────────────┘
```

---

## Animation Timings

### Timeline Entry Animation
```
0ms:    Items invisible
100ms:  Item 1 fades in, slides in from left
200ms:  Item 2 fades in, slides in from left
300ms:  Item 3 fades in, slides in from left
400ms:  Item 4 fades in, slides in from left
500ms:  All items fully visible and settled
```

### Queue Card Expansion
```
0ms:    Queue card clicked
200ms:  ChevronRight icon rotates 90°
200ms:  Order list fades in
400ms:  Orders fully visible with stagger
```

### Payment Processing
```
0ms:    Click "Pay Now"
100ms:  Button shows "Processing..."
200ms:  Button disabled, spinner (if any)
1000ms: API response received
1200ms: Payment section replaced with success
1500ms: Success card fully animated in
```

---

## Color Scheme & Status Mapping

### Status Colors

```
Status              │ Color      │ Icon    │ Badge Type
────────────────────┼────────────┼─────────┼──────────────
pending_approval    │ Blue       │ Clock   │ Primary
awaiting_payment    │ Amber      │ Card    │ Warning
approved            │ Green      │ Check   │ Success
paid                │ Emerald    │ Card    │ Success
dispatched          │ Orange     │ Truck   │ Warning
in_transit          │ Orange     │ Truck   │ Warning
delivered           │ Green      │ Check   │ Success
rejected            │ Red        │ X       │ Danger
```

### Event Colors (Timeline)

```
Event Type          │ Color      │ Icon           │ Label
────────────────────┼────────────┼────────────────┼──────────────
created             │ Blue       │ Package        │ Order Created
approved            │ Green      │ CheckCircle    │ Approved
rejected            │ Red        │ XCircle        │ Rejected
paid                │ Emerald    │ CreditCard     │ Payment Received
dispatched          │ Orange     │ Truck          │ Dispatched
in_transit          │ Amber      │ Truck          │ In Transit
delivered           │ Green      │ CheckCircle    │ Delivered
cancelled           │ Gray       │ AlertCircle    │ Cancelled
```

### Button Colors

```
Action      │ Color   │ Hover Effect           │ Disabled Color
────────────┼─────────┼────────────────────────┼───────────────
Approve     │ Green   │ Scale 1.05, Darker     │ Gray
Reject      │ Red     │ Scale 1.05, Darker     │ Gray
Pay         │ Blue    │ Scale 1.02, Shadow     │ Gray
Dispatch    │ Blue    │ Scale 1.05, Darker     │ Gray
Update      │ Blue    │ Scale 1.05, Darker     │ Gray
Details     │ Gray    │ Scale 1.05, Darker     │ Gray (disabled)
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
Layout: Single column, stacked
Queue Cards: 1 column
Order Details: Full width
Timeline: Adjusted padding
Buttons: Full width
Touch targets: 48-56px minimum
```

### Tablet (640px - 1024px)
```
Layout: 2 column (orders + sidebar)
Queue Cards: 2 columns
Order Details: 2 column grid
Timeline: Optimized spacing
Buttons: Wider hitarea
Touch targets: 44-48px
```

### Desktop (> 1024px)
```
Layout: 3+ column (flexible)
Queue Cards: 4 columns (max 3 columns usually)
Order Details: Side-by-side layout
Timeline: Full width, detailed
Buttons: Hover effects enabled
Touch targets: 40-44px standard
```

---

## Error States Visual

### Error Alert (Red)
```
┌─────────────────────────────────────────┐
│ ⚠️ Error                                 │
│ Cannot approve this order. Invalid      │
│ status transition.                       │
│                                 [Dismiss]│
└─────────────────────────────────────────┘
```

### Toast Notification (Bottom-Right)
```
┌─────────────────────────────┐
│ ✓ Order approved            │
│   successfully!             │
└─────────────────────────────┘
```

---

## Loading States

### Skeleton Loading (While fetching)
```
┌─────────────────────────────┐
│ ▭▭▭▭▭▭▭▭▭▭▭▭ (shimmer)    │
│ ▭▭▭▭▭▭▭▭▭▭▭▭ (shimmer)    │
│ ▭▭▭▭▭▭▭▭▭▭▭▭ (shimmer)    │
└─────────────────────────────┘
```

### Button Loading State
```
Before:  [Pay Now]
Loading: [Processing...] (disabled, no click)
After:   [✓ Payment Received]
```

---

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Space/Enter to click buttons
- Arrow keys to navigate lists
- Escape to close dialogs

### Screen Reader Support
- All buttons have aria-labels
- Status badges have aria-live regions
- Error messages announced
- Timeline events properly marked up

### Visual Accessibility
- Color not sole indicator (use icons + text)
- Sufficient contrast ratios (WCAG AA)
- Readable font sizes (16px minimum)
- Clear focus indicators

---

## Summary: Components at a Glance

```
┌─ OrderTimeline.tsx (Reusable Component)
│  ├─ Props: events[], currentStatus
│  ├─ Features: Timeline visualization, metadata display
│  └─ Animations: Stagger, fade, scale, hover effects
│
├─ Customer Order Detail Page
│  ├─ Path: /customers/orders/[id]
│  ├─ Features: Order info, items, delivery, payment, timeline, tracking
│  ├─ Status checks: Only accessible by order owner
│  └─ Animations: Section stagger, button feedback, status pulse
│
└─ Seller Order Dashboard
   ├─ Path: /sellers/dashboard/orders
   ├─ Features: 4 queue cards, expandable orders, action buttons, search
   ├─ Status checks: Only shows own products
   └─ Animations: Card stagger, expand/collapse, button feedback
```

**All components use:**
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Lucide React for icons
- ✅ TypeScript for type safety
- ✅ Next.js 16 App Router
- ✅ React 19 hooks

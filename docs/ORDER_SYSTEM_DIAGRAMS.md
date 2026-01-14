# 📊 Order System - Visual Architecture

## Complete System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        MARKETPLACE SYSTEM                            │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER SIDE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. MARKETPLACE                                                     │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │ Browse Products                                         │    │
│     │ ├─ Product Card                                         │    │
│     │ │  ├─ Price: $XX.XX                                     │    │
│     │ │  ├─ Colors: [Red] [Blue] [Green]                      │    │
│     │ │  ├─ Seller: [Name]                                    │    │
│     │ │  └─ [Add to Cart]                                     │    │
│     │ └─ Product Detail (Modal)                               │    │
│     │    ├─ Full description                                  │    │
│     │    ├─ Image carousel                                    │    │
│     │    ├─ Variants (dynamic from DB)                        │    │
│     │    ├─ Seller Info Card                                  │    │
│     │    └─ [Add to Cart]                                     │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
│  2. SHOPPING CART                                                   │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │ Cart Items                                              │    │
│     │ ├─ Product 1 x 2                                        │    │
│     │ ├─ Product 2 x 1                                        │    │
│     │ ├─ Subtotal: $XX.XX                                     │    │
│     │ ├─ Shipping: $X.XX                                      │    │
│     │ ├─ Tax: $X.XX                                           │    │
│     │ └─ [Proceed to Checkout]                                │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
│  3. CHECKOUT FORM ⭐ NEW                                            │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │ A. Shipping Address                                     │    │
│     │    ├─ Name: [_____________]                             │    │
│     │    ├─ Email: [_____________]                            │    │
│     │    ├─ Street: [_____________]                           │    │
│     │    ├─ City: [_____________]                             │    │
│     │    ├─ State: [_____________]                            │    │
│     │    └─ Zip: [_____________]                              │    │
│     │                                                         │    │
│     │ B. Contact Information ⭐ NEW                           │    │
│     │    ├─ Phone: [_____________] *required                  │    │
│     │    └─ WhatsApp: [_____________] optional                │    │
│     │                                                         │    │
│     │ C. Payment Method                                       │    │
│     │    ├─ Card: 4242 4242 4242 4242                         │    │
│     │    ├─ Expiry: 12/25                                     │    │
│     │    └─ CVC: 123                                          │    │
│     │                                                         │    │
│     └─ [Place Order]                                          │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
│  4. ORDER CONFIRMATION                                              │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │ ✓ Order Placed!                                         │    │
│     │ Order #: ABC123DEF                                      │    │
│     │ Status: Pending                                         │    │
│     │ Redirecting to order tracking...                        │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
│  5. ORDER TRACKING ⭐ ENHANCED                                     │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │ My Orders                                               │    │
│     │                                                         │    │
│     │ Order #ABC123DEF                    $XX.XX              │    │
│     │ Placed: 2026-01-07                  Processing          │    │
│     │ ▼ Click to expand                                       │    │
│     │                                                         │    │
│     │ ┌─ 📍 Order Status ────────────────────────────────┐   │    │
│     │ │ Status: Processing                               │   │    │
│     │ │ Tracking #: TRK123456789                          │   │    │
│     │ │ Est. Delivery: 2026-01-10                         │   │    │
│     │ └──────────────────────────────────────────────────┘   │    │
│     │                                                         │    │
│     │ ┌─ 📦 Delivery Address ────────────────────────────┐   │    │
│     │ │ John Doe                                         │   │    │
│     │ │ 123 Main Street                                  │   │    │
│     │ │ New York, NY 10001                               │   │    │
│     │ └──────────────────────────────────────────────────┘   │    │
│     │                                                         │    │
│     │ ┌─ 📦 Order Items ─────────────────────────────────┐   │    │
│     │ │ Product 1 x 2                                    │   │    │
│     │ │ Sold by: Store Name                              │   │    │
│     │ │ $XX.XX                                           │   │    │
│     │ │                                                  │   │    │
│     │ │ Product 2 x 1                                    │   │    │
│     │ │ Sold by: Other Store                             │   │    │
│     │ │ $XX.XX                                           │   │    │
│     │ └──────────────────────────────────────────────────┘   │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     CENTRAL DATABASE                                 │
│                    (PostgreSQL / Prisma)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ORDER RECORD ⭐ ENHANCED                                           │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ Order {                                                   │     │
│  │   id: "order_123",                                        │     │
│  │   customerId: "customer_456",                             │     │
│  │   customerName: "John Doe",                               │     │
│  │   customerEmail: "john@example.com",                      │     │
│  │   customerPhone: "+1-555-123-4567",      ⭐ NEW          │     │
│  │   customerWhatsApp: "+1-555-987-6543",   ⭐ NEW (optional)│     │
│  │   deliveryAddress: "123 Main Street",    ⭐ NEW          │     │
│  │   deliveryCity: "New York",              ⭐ NEW          │     │
│  │   deliveryState: "NY",                   ⭐ NEW          │     │
│  │   deliveryZipCode: "10001",              ⭐ NEW          │     │
│  │   items: [                                               │     │
│  │     {                                                    │     │
│  │       productId: "prod_789",                             │     │
│  │       quantity: 2,                                       │     │
│  │       price: 29.99,                                      │     │
│  │       variantData: { color: "Red", size: "M" }           │     │
│  │     }                                                    │     │
│  │   ],                                                     │     │
│  │   total: 59.98,                                          │     │
│  │   status: "processing",                                  │     │
│  │   trackingNumber: "TRK123456789",                        │     │
│  │   estimatedDelivery: "2026-01-10",                       │     │
│  │   createdAt: "2026-01-07T10:30:00Z",                     │     │
│  │   updatedAt: "2026-01-07T11:45:00Z"                      │     │
│  │ }                                                         │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SELLER SIDE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SELLER DASHBOARD - ORDERS                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Orders                                                       │  │
│  │                                                              │  │
│  │ Order #ABC123DEF                               $XX.XX       │  │
│  │ 2026-01-07                                   [Processing]   │  │
│  │ Customer: John Doe  ⭐ NEW                                   │  │
│  │ ▼ Click to expand                                           │  │
│  │                                                              │  │
│  │ ┌──────────────────────────────────────────────────────┐   │  │
│  │ │ 📦 Delivery Information ⭐ NEW                       │   │  │
│  │ │ ┌──────────────────────────────────────────────────┐ │   │  │
│  │ │ │ Recipient Name: John Doe                         │ │   │  │
│  │ │ │ Delivery Address: 123 Main Street                │ │   │  │
│  │ │ │ New York, NY 10001                               │ │   │  │
│  │ │ └──────────────────────────────────────────────────┘ │   │  │
│  │ │                                                      │   │  │
│  │ │ 📞 Contact Information ⭐ NEW                       │   │  │
│  │ │ ┌──────────────────────────────────────────────────┐ │   │  │
│  │ │ │ Phone: +1-555-123-4567        [Call]  ⭐ NEW    │ │   │  │
│  │ │ │ WhatsApp: +1-555-987-6543     [Chat]  ⭐ NEW    │ │   │  │
│  │ │ │ Email: john@example.com                           │ │   │  │
│  │ │ └──────────────────────────────────────────────────┘ │   │  │
│  │ │                                                      │   │  │
│  │ │ 📦 Order Items                                       │   │  │
│  │ │ ├─ Product 1 x 2 (Red, Large)   $XX.XX              │   │  │
│  │ │ └─ Product 2 x 1                 $XX.XX              │   │  │
│  │ │                                                      │   │  │
│  │ │ Status: [pending ▼]   ⭐ Dropdown                    │   │  │
│  │ │ (pending/processing/shipped/delivered/cancelled)    │   │  │
│  │ └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  SELLER ACTIONS:                                                    │
│  ├─ [Call] → Opens device phone app                                │
│  ├─ [Chat] → Opens WhatsApp                                        │
│  ├─ Update Status Dropdown                                          │
│  └─ Add Tracking # via API                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  POST /api/orders                                                   │
│  ├─ Input: Order data + customer info + delivery address            │
│  ├─ Process: Create order in database                               │
│  └─ Output: Created order with ID                                   │
│                                                                      │
│  GET /api/customers/[id]/orders                                     │
│  ├─ Input: Customer ID                                              │
│  ├─ Process: Fetch all customer orders                              │
│  └─ Output: Array of orders with items                              │
│                                                                      │
│  GET /api/merchants/[id]/orders                                     │
│  ├─ Input: Seller ID                                                │
│  ├─ Process: Fetch seller's product orders                          │
│  └─ Output: Array of orders with items                              │
│                                                                      │
│  PATCH /api/orders/[id]                                             │
│  ├─ Input: Order ID + new status/tracking/delivery                  │
│  ├─ Process: Update order                                           │
│  └─ Output: Updated order                                           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                  COMMUNICATION CHANNELS ⭐ NEW                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHONE COMMUNICATION                                                │
│  ┌──────────────────────────┐        ┌──────────────────────────┐  │
│  │      SELLER              │        │      CUSTOMER            │  │
│  │  Sees: +1-555-123-4567   │        │                          │  │
│  │  Clicks: [Call]          │─ tel: ─┤ Receives call on device  │  │
│  │  Opens: Phone Dialer     │        │                          │  │
│  └──────────────────────────┘        └──────────────────────────┘  │
│                                                                      │
│  WHATSAPP COMMUNICATION                                             │
│  ┌──────────────────────────┐        ┌──────────────────────────┐  │
│  │      SELLER              │        │      CUSTOMER            │  │
│  │  Sees: +1-555-987-6543   │        │                          │  │
│  │  Clicks: [Chat]          │─ wa.me ─┤ Receives in WhatsApp     │  │
│  │  Opens: WhatsApp         │        │                          │  │
│  └──────────────────────────┘        └──────────────────────────┘  │
│                                                                      │
│  EMAIL COMMUNICATION                                                │
│  ┌──────────────────────────┐        ┌──────────────────────────┐  │
│  │      SELLER              │        │      CUSTOMER            │  │
│  │  Sees: john@example.com  │        │                          │  │
│  │  Copies & Uses:          │────────┤ Receives email           │  │
│  │  Own Email Client        │        │                          │  │
│  └──────────────────────────┘        └──────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Order Status Workflow Diagram

```
                    ┌─────────────┐
                    │  PENDING    │
                    │ (Order Just │
                    │  Created)   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ PROCESSING      │
                    │ (Seller picking │
                    │  and packing)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ SHIPPED              │
                    │ + Tracking #         │
                    │ + Est. Delivery Date │
                    └──────────┬───────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ DELIVERED    │
                        │ (Order Done) │
                        └──────────────┘

                    CANCELLATION PATH:
                    ┌──────────────────────┐
        From any    │                      │
        state ─────►│   CANCELLED          │
                    │ (Order Cancelled)    │
                    └──────────────────────┘
```

---

## Data Visibility Matrix

```
┌─────────────────────┬──────────────┬─────────────────┬──────────┐
│ Field               │ Customer     │ Seller          │ Database │
├─────────────────────┼──────────────┼─────────────────┼──────────┤
│ Order ID            │ ✓ Sees       │ ✓ Sees          │ ✓        │
│ Items               │ ✓ Sees       │ ✓ Sees theirs   │ ✓        │
│ Status              │ ✓ Sees       │ ✓ Can update    │ ✓        │
│ Delivery Address    │ ✓ Sees own   │ ✓ Sees          │ ✓        │
│ Total Amount        │ ✓ Sees       │ ✓ Sees          │ ✓        │
├─────────────────────┼──────────────┼─────────────────┼──────────┤
│ Customer Name       │ Own only     │ ✓ Sees          │ ✓        │
│ Customer Phone ⭐   │ Own only     │ ✓ Sees          │ ✓        │
│ Customer WhatsApp ⭐│ Own only     │ ✓ Sees (opt)    │ ✓        │
│ Customer Email      │ Own only     │ ✓ Sees          │ ✓        │
├─────────────────────┼──────────────┼─────────────────┼──────────┤
│ Tracking #          │ ✓ Sees       │ ✓ Can add       │ ✓        │
│ Est. Delivery       │ ✓ Sees       │ ✓ Can set       │ ✓        │
│ Order History       │ ✓ Their own  │ ✓ Their orders  │ ✓        │
└─────────────────────┴──────────────┴─────────────────┴──────────┘
```

---

## System Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING FEATURES                             │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Customer Authentication                                       │
│  ✓ Seller Authentication                                         │
│  ✓ Product Catalog                                               │
│  ✓ Product Variants (Colors, Size, etc)                          │
│  ✓ Shopping Cart                                                 │
│  ✓ Payment Processing (Test Mode)                                │
│  ✓ Marketplace Display                                           │
│  ✓ Seller Dashboard                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEW ORDER SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  ⭐ Order Creation & Management                                   │
│  ⭐ Customer Contact Collection                                   │
│  ⭐ Delivery Address Tracking                                     │
│  ⭐ Order Status Workflow                                         │
│  ⭐ Seller-Customer Communication                                 │
│  ⭐ Order History & Tracking                                      │
│  ⭐ Seller Fulfillment Tools                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

**All diagrams current as of January 7, 2026**

# B2Zi Order Approval, Payment & Tracking System
## Complete Implementation Design Document

**Status**: Ready for implementation  
**Date**: January 2025  
**Compatibility**: Additive (backward compatible with existing orders)  

---

## 1. ORDER LIFECYCLE OVERVIEW

### Complete Order State Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE STATE MACHINE                 │
└──────────────────────────────────────────────────────────────────┘

                         [PENDING_APPROVAL]
                               │
                    (Customer can't pay yet)
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ↓                      ↓                      ↓
    [APPROVED]         [REJECTED]              [CANCELLED]
        │                      │                      │
   (Auto-notify)          (Notify customer)      (No refund needed)
        │                      │                      │
        ↓                      └──────────────────────┘
 [AWAITING_PAYMENT]                    (END STATE)
        │
   (Payment page)
        │
   (Customer pays)
        │
        ↓
      [PAID]
        │
   (Seller dispatches)
        │
        ↓
   [DISPATCHED]
        │
   (Seller updates tracking)
        │
        ↓
   [IN_TRANSIT]
        │
   (Seller marks delivered)
        │
        ↓
    [DELIVERED]
        │
    (END STATE)
```

### Actors & Responsibilities

| Actor | Can Create | Can Approve | Can Pay | Can Track | Can Cancel |
|-------|-----------|------------|--------|-----------|-----------|
| **Customer** | ✅ Order | ❌ | ✅ | ✅ | ✅ (before approved) |
| **Merchant/Seller** | ❌ | ✅ (for own products) | ❌ | ✅ | ✅ (only if not paid) |
| **System** | ❌ | ❌ | ❌ (Stripe eventually) | ❌ | ❌ |

### Key Transitions

```
VALID TRANSITIONS:
├─ pending_approval → approved (Seller approves)
├─ pending_approval → rejected (Seller rejects)
├─ pending_approval → cancelled (Customer cancels, OR timeout)
├─ approved → awaiting_payment (Auto-transition or manual)
├─ awaiting_payment → paid (Customer pays)
├─ paid → dispatched (Seller dispatches)
├─ dispatched → in_transit (Seller provides tracking)
├─ in_transit → delivered (Seller marks complete)
├─ rejected → (END - No further transitions)
└─ cancelled → (END - No further transitions)

INVALID TRANSITIONS:
├─ paid → pending_approval (Cannot go backward)
├─ delivered → in_transit (Cannot reverse)
├─ rejected → approved (Cannot resurrect)
└─ etc. (State machine enforces)
```

---

## 2. DATABASE SCHEMA CHANGES

### 2.1 Order Status Enum Extension

**Current**: `pending | processing | shipped | delivered | cancelled`  
**New**: Add more granular states

```prisma
// In schema.prisma, modify Order.status enum:

model Order {
  id        String    @id @default(cuid())
  customerId String
  customer  Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  items     OrderItem[]
  total     Float
  
  // UPDATED STATUS ENUM (replaces old one)
  status    String    @default("pending_approval")
  // Valid values:
  // - pending_approval: Waiting for merchant approval
  // - approved: Merchant approved, ready for payment
  // - awaiting_payment: Approved, awaiting customer payment
  // - paid: Payment received, awaiting dispatch
  // - dispatched: Seller dispatched goods
  // - in_transit: In transit with driver
  // - delivered: Delivered to customer
  // - rejected: Seller rejected the order
  // - cancelled: Customer or system cancelled
  
  // EXISTING FIELDS (keep as-is)
  deliveryAddress String
  deliveryCity    String
  deliveryState   String
  deliveryZipCode String
  customerName    String
  customerEmail   String
  customerPhone   String
  customerWhatsApp String?
  trackingNumber  String?
  estimatedDelivery String?
  
  // NEW FIELDS (additive, optional for backward compatibility)
  approvedAt      DateTime?       // When merchant approved
  approvedBy      String?         // Merchant ID who approved
  rejectedAt      DateTime?       // When merchant rejected
  rejectedReason  String?         // Why rejected (optional)
  paidAt          DateTime?       // When payment received
  paymentStatus   String?         // "pending" | "paid" | "failed"
  paymentMethod   String?         // "card" | "cash" | "bank_transfer"
  
  // TRACKING & FULFILLMENT
  dispatchedAt    DateTime?       // When seller dispatched
  trackedAt       DateTime?       // Last tracking update
  trackingStatus  String?         // "dispatched" | "in_transit" | "delivered"
  trackingMessage String?         // "Driver on the way", "Out for delivery", etc.
  driverName      String?         // Optional driver info
  driverPhone     String?         // Optional driver info
  
  // AUDIT
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // RELATIONSHIPS
  orderEvents     OrderEvent[]    // New: Order audit trail
  
  @@index([customerId])
  @@index([status])
  @@index([approvedBy])
}
```

### 2.2 New OrderEvent Table (Audit Trail)

```prisma
model OrderEvent {
  id          String    @id @default(cuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // EVENT TYPE
  eventType   String    // "created" | "approved" | "rejected" | "paid" | 
                        // "dispatched" | "tracking_updated" | "delivered" | "cancelled"
  
  // WHO DID IT
  actorId     String?   // User ID (merchant or customer)
  actorType   String?   // "merchant" | "customer" | "system"
  
  // WHAT CHANGED
  oldStatus   String?   // Previous status
  newStatus   String?   // New status
  message     String?   // Additional context
  metadata    Json?     // Extra data (payment details, tracking info, etc.)
  
  // TIMESTAMPS
  createdAt   DateTime  @default(now())
  
  @@index([orderId])
  @@index([createdAt])
  @@index([eventType])
}
```

### 2.3 Optional: OrderPayment Table (For Payment History)

```prisma
model OrderPayment {
  id            String    @id @default(cuid())
  orderId       String
  customerId    String
  
  // PAYMENT DETAILS
  amount        Float
  currency      String    @default("ZWL")
  method        String    // "card" | "bank_transfer" | "cash_on_delivery"
  status        String    // "pending" | "processing" | "completed" | "failed"
  
  // PROVIDER REFERENCES
  stripePaymentIntentId  String?
  transactionId          String?
  
  // ERROR TRACKING
  failureReason String?
  failureCode   String?
  
  // TIMESTAMPS
  initiatedAt   DateTime  @default(now())
  completedAt   DateTime?
  updatedAt     DateTime  @updatedAt
  
  @@index([orderId])
  @@index([customerId])
  @@index([status])
}
```

### 2.4 Backward Compatibility Migration Notes

```prisma
// For existing orders in database:
// - Update old "pending" status to "pending_approval"
// - Update old "processing" status to "paid" (assume payment happened)
// - Update old "shipped" status to "dispatched"
// - Update old "delivered" status to "delivered"
// - All other new fields default to NULL

// Migration script (pseudocode):
/*
UPDATE Order SET status = 'pending_approval' WHERE status = 'pending';
UPDATE Order SET status = 'paid' WHERE status = 'processing';
UPDATE Order SET status = 'dispatched' WHERE status = 'shipped';
-- delivered stays the same
*/
```

---

## 3. API ROUTES (COMPLETE SPECIFICATION)

### 3.1 Seller Approval Routes

#### Route: `PUT /api/orders/[id]/approve`

**Who Can Call**: Merchant/Seller (only for orders containing their products)  
**State Transition**: `pending_approval` → `approved`

```typescript
// Request
PUT /api/orders/[id]/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  // Empty body or optional:
  // { note?: string }
}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "approved",
    approvedAt: "2025-01-14T10:30:00Z",
    approvedBy: "merchant_123"
  }
}

// Response (Error)
400 Bad Request
{
  success: false,
  error: "Order is not in pending_approval status" | 
         "You are not authorized to approve this order" |
         "Order does not contain any of your products"
}
```

**Backend Logic**:
1. Verify token & extract merchant ID
2. Fetch order with OrderItems + Products
3. Verify that at least one OrderItem.product.sellerId == merchant ID
4. Verify order.status === "pending_approval"
5. Update: Order.status = "approved", Order.approvedAt = NOW, Order.approvedBy = merchantId
6. Create OrderEvent: type="approved", actorId=merchantId, actorType="merchant"
7. Send notification to customer: "Order approved! Proceed to payment."
8. Return updated order

---

#### Route: `PUT /api/orders/[id]/reject`

**Who Can Call**: Merchant/Seller (any merchant in the system, not just order seller)  
**State Transition**: `pending_approval` → `rejected`

```typescript
// Request
PUT /api/orders/[id]/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  reason: string  // Required: why rejecting?
}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "rejected",
    rejectedAt: "2025-01-14T10:30:00Z",
    rejectedReason: "Out of stock for SKU XYZ"
  }
}

// Response (Error)
400 Bad Request | 403 Forbidden
{
  success: false,
  error: "Order is not in pending_approval status" |
         "Reason is required" |
         "You are not authorized to reject this order"
}
```

**Backend Logic**:
1. Verify token & extract merchant ID
2. Fetch order with OrderItems + Products
3. Verify that at least one OrderItem.product.sellerId == merchant ID
4. Verify order.status === "pending_approval"
5. Validate: reason must be non-empty string, max 500 chars
6. Update: Order.status = "rejected", Order.rejectedAt = NOW, Order.rejectedReason = reason
7. Create OrderEvent: type="rejected", message=reason
8. Refund/restore inventory if payment already taken (future: Stripe integration)
9. Send notification to customer: "Order rejected: {reason}"
10. Return updated order

---

#### Route: `PUT /api/orders/[id]/dispatch`

**Who Can Call**: Merchant/Seller (only for orders containing their products)  
**State Transition**: `paid` → `dispatched`

```typescript
// Request
PUT /api/orders/[id]/dispatch
Authorization: Bearer {token}
Content-Type: application/json

{
  trackingNumber?: string,  // Optional: shipping tracking code
  estimatedDelivery?: string  // Optional: ISO date string
}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "dispatched",
    dispatchedAt: "2025-01-14T10:30:00Z",
    trackingNumber: "ZW123456789",
    trackingStatus: "dispatched"
  }
}

// Response (Error)
400 Bad Request | 403 Forbidden
{
  success: false,
  error: "Order is not in paid status" |
         "You are not authorized to dispatch this order" |
         "Payment not received yet"
}
```

**Backend Logic**:
1. Verify merchant authorization
2. Verify order.status === "paid"
3. Update: Order.status = "dispatched", Order.dispatchedAt = NOW
4. Update: Order.trackingNumber = trackingNumber (if provided)
5. Update: Order.estimatedDelivery = estimatedDelivery (if provided)
6. Update: Order.trackingStatus = "dispatched"
7. Create OrderEvent: type="dispatched"
8. Send notification to customer: "Your order is on its way! Tracking: {trackingNumber}"
9. Return updated order

---

#### Route: `PUT /api/orders/[id]/update-tracking`

**Who Can Call**: Merchant/Seller  
**State Transition**: `dispatched` → `in_transit` → `delivered`

```typescript
// Request
PUT /api/orders/[id]/update-tracking
Authorization: Bearer {token}
Content-Type: application/json

{
  trackingStatus: "in_transit" | "delivered",  // Required
  trackingMessage: string,  // Required: "Driver on the way", "Out for delivery", "Delivered"
  driverName?: string,      // Optional
  driverPhone?: string      // Optional
}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "in_transit" | "delivered",
    trackingStatus: "in_transit" | "delivered",
    trackingMessage: "Driver on the way",
    driverName: "Ahmed",
    trackedAt: "2025-01-14T14:00:00Z"
  }
}

// Response (Error)
400 Bad Request | 403 Forbidden
{
  success: false,
  error: "Invalid trackingStatus" |
         "Order must be in dispatched or in_transit status" |
         "Unauthorized"
}
```

**Backend Logic**:
1. Verify merchant authorization
2. Fetch order, verify status is "dispatched" or "in_transit"
3. Validate trackingStatus enum: "in_transit" | "delivered"
4. Validate trackingMessage is non-empty
5. Update:
   - Order.trackingStatus = trackingStatus
   - Order.trackingMessage = trackingMessage
   - Order.driverName = driverName (if provided)
   - Order.driverPhone = driverPhone (if provided)
   - Order.trackedAt = NOW
   - If trackingStatus === "delivered": Order.status = "delivered"
6. Create OrderEvent: type="tracking_updated", metadata={trackingStatus, message}
7. Send notification to customer with tracking message
8. Return updated order

---

### 3.2 Customer Payment Routes

#### Route: `POST /api/orders/[id]/pay`

**Who Can Call**: Customer (authenticated)  
**State Transition**: `awaiting_payment` → `paid`

```typescript
// Request
POST /api/orders/[id]/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  paymentMethod: "card" | "bank_transfer" | "cash_on_delivery",
  // If method === "card", include Stripe token:
  stripePaymentMethodId?: string,
  // If method === "bank_transfer":
  bankName?: string,
  accountNumber?: string
}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "paid",
    paidAt: "2025-01-14T10:30:00Z",
    paymentStatus: "paid",
    paymentMethod: "card"
  }
}

// Response (Error)
400 Bad Request | 403 Forbidden | 402 Payment Required
{
  success: false,
  error: "Order is not awaiting payment" |
         "Invalid payment method" |
         "Payment declined" |
         "You are not authorized to pay this order" |
         "Order not found"
}
```

**Backend Logic**:
1. Verify customer token & extract customerId
2. Fetch order, verify order.customerId === customerId
3. Verify order.status === "awaiting_payment" (or approved - auto-transition)
4. Validate paymentMethod enum
5. If paymentMethod === "card":
   - Call Stripe API: create payment intent or charge
   - If failed: return 402 error with payment details
6. If paymentMethod === "cash_on_delivery":
   - Skip actual payment; mark as "pending" (will be collected at delivery)
7. Create OrderPayment record:
   - amount, currency, method, status, initiatedAt
   - stripePaymentIntentId (if card)
8. Update Order:
   - Order.status = "paid"
   - Order.paidAt = NOW
   - Order.paymentStatus = "paid"
   - Order.paymentMethod = paymentMethod
9. Create OrderEvent: type="paid", metadata={method, amount}
10. Send notification to merchant: "Payment received for Order {id}. Please dispatch."
11. Return updated order

---

#### Route: `GET /api/orders/[id]/tracking`

**Who Can Call**: Customer (authenticated, owner of order)  
**Query**: Get full order details + tracking history

```typescript
// Request
GET /api/orders/[id]/tracking
Authorization: Bearer {token}

// Response (Success)
200 OK
{
  success: true,
  data: {
    id: "order_xyz",
    status: "in_transit",
    customerId: "customer_123",
    items: [
      {
        id: "item_1",
        productId: "prod_1",
        productName: "Leather Shoes",
        sellerName: "Best Store",
        quantity: 2,
        price: 50.00,
        variantData: { color: "Brown", size: "10" }
      }
    ],
    total: 100.00,
    
    // TRACKING INFO
    trackingStatus: "in_transit",
    trackingMessage: "Driver on the way",
    trackingNumber: "ZW123456789",
    driverName: "Ahmed",
    driverPhone: "+263712345678",
    estimatedDelivery: "2025-01-15T18:00:00Z",
    dispatchedAt: "2025-01-14T08:00:00Z",
    trackedAt: "2025-01-14T14:00:00Z",
    
    // DELIVERY INFO
    deliveryAddress: "123 Main St",
    deliveryCity: "Harare",
    deliveryState: "Harare",
    deliveryZipCode: "00263",
    
    // TIMELINE
    timeline: [
      { timestamp: "2025-01-14T10:00:00Z", status: "approved", message: "Order approved" },
      { timestamp: "2025-01-14T10:30:00Z", status: "paid", message: "Payment received" },
      { timestamp: "2025-01-14T11:00:00Z", status: "dispatched", message: "Dispatched" },
      { timestamp: "2025-01-14T14:00:00Z", status: "in_transit", message: "Driver on the way" }
    ]
  }
}

// Response (Error)
400 Bad Request | 403 Forbidden
{
  success: false,
  error: "Order not found" |
         "You are not authorized to view this order"
}
```

**Backend Logic**:
1. Verify customer token & extract customerId
2. Fetch order, verify order.customerId === customerId
3. Include related: items + products + seller info
4. Fetch related OrderEvents, sort by createdAt
5. Transform OrderEvents into timeline array
6. Return complete order + timeline

---

### 3.3 Enhanced Customer Orders List

#### Route: `GET /api/orders?customerId=X` (ENHANCED)

**Current Behavior**: Already implemented, fetches all orders  
**Enhancement**: Include status, timeline, payment status in response

```typescript
// Response (Enhanced)
200 OK
{
  success: true,
  data: [
    {
      id: "order_1",
      status: "in_transit",
      total: 100.00,
      customerName: "John Doe",
      createdAt: "2025-01-14T08:00:00Z",
      approvedAt: "2025-01-14T10:00:00Z",
      paidAt: "2025-01-14T10:30:00Z",
      dispatchedAt: "2025-01-14T11:00:00Z",
      trackingStatus: "in_transit",
      trackingMessage: "Driver on the way",
      items: [...]
    },
    // ... more orders
  ]
}
```

---

### 3.4 Enhanced Seller Orders List

#### Route: `GET /api/sellers/orders` (ENHANCED)

**Current Behavior**: Show orders for merchant  
**Enhancement**: Group by status, show approval queue, payment status

```typescript
// Backend modification in existing orders page:
// Fetch /api/orders (all orders)
// Filter: WHERE items[].product.sellerId === merchantId
// Group by status:
//   - pending_approval (priority queue)
//   - approved (awaiting payment)
//   - paid (ready to dispatch)
//   - dispatched (in transit)
//   - delivered (completed)

// Response structure:
{
  success: true,
  data: {
    pending_approval: [  // Show first
      { id, customer, items, createdAt, approveButton, rejectButton }
    ],
    paid: [  // Ready to ship
      { id, customer, items, dispatchButton, trackingForm }
    ],
    dispatched: [  // In transit
      { id, customer, trackingStatus, updateTrackingButton }
    ],
    delivered: [  // Completed
      { id, customer, completedAt }
    ]
  }
}
```

---

## 4. STATE MACHINE RULES

### 4.1 State Enum Definition

```typescript
// /lib/order-status.ts (NEW FILE)

export enum OrderStatus {
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  AWAITING_PAYMENT = "awaiting_payment",
  PAID = "paid",
  DISPATCHED = "dispatched",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum TrackingStatus {
  DISPATCHED = "dispatched",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
}
```

### 4.2 State Transition Rules

```typescript
// /lib/order-state-machine.ts (NEW FILE)

type StateTransition = {
  from: OrderStatus
  to: OrderStatus
  allowedRoles?: ('customer' | 'merchant' | 'admin')[]
  validator?: (order: Order) => boolean
}

const VALID_TRANSITIONS: StateTransition[] = [
  // From PENDING_APPROVAL
  {
    from: OrderStatus.PENDING_APPROVAL,
    to: OrderStatus.APPROVED,
    allowedRoles: ['merchant'],
    validator: (order) => order.items.length > 0
  },
  {
    from: OrderStatus.PENDING_APPROVAL,
    to: OrderStatus.REJECTED,
    allowedRoles: ['merchant'],
    validator: (order) => order.items.length > 0
  },
  {
    from: OrderStatus.PENDING_APPROVAL,
    to: OrderStatus.CANCELLED,
    allowedRoles: ['customer'],
    validator: (order) => !order.paidAt // Can't cancel if already paid
  },
  
  // From APPROVED
  {
    from: OrderStatus.APPROVED,
    to: OrderStatus.AWAITING_PAYMENT,
    allowedRoles: ['system'], // Auto-transition
    validator: (order) => true
  },
  
  // From AWAITING_PAYMENT
  {
    from: OrderStatus.AWAITING_PAYMENT,
    to: OrderStatus.PAID,
    allowedRoles: ['customer', 'system'],
    validator: (order) => order.paymentStatus === 'paid'
  },
  
  // From PAID
  {
    from: OrderStatus.PAID,
    to: OrderStatus.DISPATCHED,
    allowedRoles: ['merchant'],
    validator: (order) => true
  },
  
  // From DISPATCHED
  {
    from: OrderStatus.DISPATCHED,
    to: OrderStatus.IN_TRANSIT,
    allowedRoles: ['merchant'],
    validator: (order) => !!order.trackingNumber
  },
  
  // From IN_TRANSIT
  {
    from: OrderStatus.IN_TRANSIT,
    to: OrderStatus.DELIVERED,
    allowedRoles: ['merchant'],
    validator: (order) => true
  },
  
  // END STATES: No transitions allowed FROM rejected or cancelled
]

export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus,
  userRole: 'customer' | 'merchant' | 'admin'
): boolean {
  const transition = VALID_TRANSITIONS.find(t => t.from === from && t.to === to)
  
  if (!transition) return false
  if (transition.allowedRoles && !transition.allowedRoles.includes(userRole)) {
    return false
  }
  
  return true
}

export function getValidNextStates(
  currentStatus: OrderStatus,
  userRole: 'customer' | 'merchant' | 'admin'
): OrderStatus[] {
  return VALID_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles?.includes(userRole))
    .map(t => t.to)
}
```

### 4.3 Validation Before State Change

```typescript
// /lib/order-validation.ts (NEW FILE)

export async function validateStateTransition(
  order: Order,
  newStatus: OrderStatus,
  actorId: string,
  actorType: 'customer' | 'merchant'
): Promise<{ valid: boolean; error?: string }> {
  
  // 1. Check if transition is allowed
  if (!isValidTransition(order.status as OrderStatus, newStatus, actorType)) {
    return {
      valid: false,
      error: `Cannot transition from ${order.status} to ${newStatus}`
    }
  }
  
  // 2. Role-based authorization
  if (actorType === 'customer') {
    if (order.customerId !== actorId) {
      return { valid: false, error: 'Not authorized' }
    }
  } else if (actorType === 'merchant') {
    // Verify merchant owns products in this order
    const merchantProducts = await prisma.product.findMany({
      where: { sellerId: actorId }
    })
    const merchantProductIds = new Set(merchantProducts.map(p => p.id))
    const orderProductIds = order.items.map(i => i.productId)
    
    const hasMerchantProducts = orderProductIds.some(
      id => merchantProductIds.has(id)
    )
    
    if (!hasMerchantProducts) {
      return { valid: false, error: 'You do not own products in this order' }
    }
  }
  
  // 3. Status-specific validations
  switch (newStatus) {
    case OrderStatus.PAID:
      if (order.paymentStatus !== 'paid') {
        return { valid: false, error: 'Payment not received' }
      }
      break
    
    case OrderStatus.DISPATCHED:
      if (order.status !== OrderStatus.PAID) {
        return { valid: false, error: 'Order not paid yet' }
      }
      break
    
    case OrderStatus.CANCELLED:
      if (order.paidAt) {
        return { valid: false, error: 'Cannot cancel paid orders' }
      }
      break
  }
  
  return { valid: true }
}
```

---

## 5. FRONTEND UI CHANGES

### 5.1 Customer Order Details Page (Enhanced)

**File**: `/app/customers/orders/page.tsx` (MODIFIED)  
**Purpose**: Show order timeline, payment button, tracking updates

**Key Components**:
1. **Order Status Timeline** (visual stepper)
2. **Payment Button** (only if awaiting_payment)
3. **Tracking Section** (updates from merchant)
4. **Cancellation Button** (only if pending_approval)

**UI Sketch**:

```
┌─────────────────────────────────────────────────────────────┐
│ Order #ORDER_ID                             Status: In Transit│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIMELINE (Stepper)                                          │
│                                                             │
│  ✓        ✓        ✓        ✓        →        ○            │
│ Order   Approved Payment  Dispatch  In Transit  Delivered   │
│ Placed            Paid     on Way                           │
│ Jan14   Jan14 10am  Jan14    Jan14    Jan14 2pm             │
│                 10:30am    11am      14:00                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRACKING STATUS (if dispatched or in_transit)              │
│                                                             │
│ 📦 Driver on the way                                        │
│    Ahmed | +263712345678                                    │
│    Tracking: ZW123456789                                    │
│    Est. Delivery: Tomorrow, 6 PM                            │
│                                                             │
│ [📱 Contact Driver]                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ORDER ITEMS                                                 │
│                                                             │
│ [Image] Leather Shoes (Brown, Size 10) × 2     $50 × 2    │
│         Sold by: Best Store                     = $100     │
│                                                             │
│ Subtotal: $100 | Shipping: $10 | Tax: $8 = Total: $118    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DELIVERY DETAILS                                            │
│                                                             │
│ Address: 123 Main St, Harare                                │
│ City: Harare | State: Harare | Zip: 00263                  │
│ Phone: +263712345678 | WhatsApp: +263712345678             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [Back to Orders]                      [Request Return] OR   │
│                                        [Contact Support]    │
└─────────────────────────────────────────────────────────────┘
```

**Component Implementation** (Pseudocode):

```tsx
export default function OrderDetail({ orderId }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/orders/${orderId}/tracking`)
      .then(r => r.json())
      .then(d => setOrder(d.data))
  }, [orderId])
  
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending_approval': 'yellow',
      'approved': 'blue',
      'awaiting_payment': 'orange',
      'paid': 'green',
      'dispatched': 'green',
      'in_transit': 'blue',
      'delivered': 'green',
      'rejected': 'red',
      'cancelled': 'gray'
    }
    return colors[status] || 'gray'
  }
  
  const timeline = [
    { status: 'Order Placed', timestamp: order?.createdAt, icon: '📋' },
    { status: 'Approved', timestamp: order?.approvedAt, icon: '✓', condition: order?.approvedAt },
    { status: 'Payment Received', timestamp: order?.paidAt, icon: '💳', condition: order?.paidAt },
    { status: 'Dispatched', timestamp: order?.dispatchedAt, icon: '📦', condition: order?.dispatchedAt },
    { status: 'In Transit', timestamp: order?.trackedAt, icon: '🚗', condition: order?.trackingStatus === 'in_transit' },
    { status: 'Delivered', timestamp: null, icon: '✓', condition: order?.status === 'delivered' }
  ]
  
  const paymentButton = order?.status === 'awaiting_payment' && (
    <button onClick={() => router.push(`/customers/checkout/${orderId}/payment`)}>
      Complete Payment
    </button>
  )
  
  const cancelButton = order?.status === 'pending_approval' && (
    <button onClick={handleCancel}>
      Cancel Order
    </button>
  )
  
  return (
    <div className="space-y-6">
      <Header order={order} />
      <Timeline items={timeline} />
      {order?.trackingStatus === 'in_transit' && <TrackingCard order={order} />}
      <ItemsCard items={order?.items} />
      <DeliveryCard order={order} />
      <div className="flex gap-4">
        {paymentButton}
        {cancelButton}
      </div>
    </div>
  )
}
```

---

### 5.2 Seller Orders Dashboard (Enhanced)

**File**: `/app/sellers/orders/page.tsx` (MODIFIED)  
**Purpose**: Approve/reject orders, dispatch, update tracking

**Key Components**:
1. **Pending Approval Queue** (top priority)
2. **Ready to Dispatch** (paid orders)
3. **In Transit** (dispatched orders)
4. **Completed** (delivered orders)

**UI Sketch**:

```
┌──────────────────────────────────────────────────────────────┐
│ Orders Dashboard           Filter: [All ▼]  [Search]         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🔴 PENDING APPROVAL (2 orders)                               │
├──────────────────────────────────────────────────────────────┤
│ ORDER #123 | John Doe                      Jan 14, 10:00 AM │
│ 2 items from your store                                     │
│ [View Details] [✓ Approve] [✗ Reject]                      │
│                                                              │
│ ORDER #124 | Jane Smith                    Jan 14, 09:30 AM │
│ 1 item from your store                                      │
│ [View Details] [✓ Approve] [✗ Reject]                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🟠 AWAITING PAYMENT (1 order)                                │
├──────────────────────────────────────────────────────────────┤
│ ORDER #125 | Alex Johnson                  Jan 14, 08:00 AM │
│ Status: Approved, waiting for customer payment              │
│ [View Details] [Payment Details]                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🟢 READY TO DISPATCH (3 orders)                              │
├──────────────────────────────────────────────────────────────┤
│ ORDER #122 | Bob Williams                  Jan 13, 02:00 PM │
│ Payment received: $150                                       │
│ [View Details] [Dispatch] [Get Shipping Label]              │
│                                                              │
│ ORDER #121 | Sarah Jones                   Jan 13, 01:30 PM │
│ Payment received: $280                                       │
│ [View Details] [Dispatch] [Get Shipping Label]              │
│                                                              │
│ ORDER #120 | Tom Brown                     Jan 13, 01:00 PM │
│ Payment received: $95                                        │
│ [View Details] [Dispatch] [Get Shipping Label]              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🚗 IN TRANSIT (4 orders)                                     │
├──────────────────────────────────────────────────────────────┤
│ ORDER #119 | Mike Chang                    Dispatched Jan 14 │
│ Status: In Transit | Driver: Ahmed | +263712345678         │
│ [View Details] [Update Tracking]                            │
│                                                              │
│ (... more orders)
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ✓ COMPLETED (12 orders)                                      │
├──────────────────────────────────────────────────────────────┤
│ ORDER #118 | Lisa Chen                     Delivered Jan 13  │
│ [View Details]                                               │
│                                                              │
│ (... more orders)
└──────────────────────────────────────────────────────────────┘
```

**Modal: Approve/Reject Order**:

```
┌──────────────────────────────────────────────────────────┐
│ ✓ APPROVE ORDER #123                              ✕     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Customer: John Doe                                      │
│ Phone: +263712345678                                    │
│ Delivery: 123 Main St, Harare                           │
│                                                          │
│ Items (2):                                              │
│  • Leather Shoes (Brown, Size 10) × 2 = $100            │
│                                                          │
│ Total: $118 (including $10 shipping, $8 tax)            │
│                                                          │
│ [Optional note]                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ "Everything in stock, will dispatch today"          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel]                    [Approve Order]             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ✗ REJECT ORDER #123                               ✕     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Customer: John Doe                                      │
│ Reason (Required):                                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Out of stock for size 10                            │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel]                    [Reject Order]              │
└──────────────────────────────────────────────────────────┘
```

**Modal: Dispatch Order**:

```
┌──────────────────────────────────────────────────────────┐
│ 📦 DISPATCH ORDER #122                             ✕     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Customer: Bob Williams                                  │
│ Phone: +263712345678                                    │
│ Delivery: 123 Main St, Harare                           │
│                                                          │
│ Shipping Tracking Number (optional):                    │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ZW123456789                                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Estimated Delivery (optional):                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 2025-01-15                         [📅 Pick date]    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Get Shipping Label]                                    │
│                                                          │
│ [Cancel]                    [Dispatch Order]            │
└──────────────────────────────────────────────────────────┘
```

**Modal: Update Tracking**:

```
┌──────────────────────────────────────────────────────────┐
│ 🚗 UPDATE TRACKING ORDER #119                      ✕     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Current Status: Dispatched                              │
│ Tracking #: ZW123456789                                 │
│                                                          │
│ Update Status:                                          │
│ ○ In Transit (Driver on the way)                        │
│ ○ Delivered                                             │
│                                                          │
│ Tracking Message:                                       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Driver on the way, arriving in 2 hours               │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Driver Name (optional):                                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Ahmed                                                │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Driver Phone (optional):                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ +263712345678                                        │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel]                    [Update Tracking]           │
└──────────────────────────────────────────────────────────┘
```

---

## 6. SECURITY & DATA PRIVACY RULES

### 6.1 Authorization Hierarchy

```typescript
// /lib/order-authorization.ts (NEW FILE)

export async function canApproveOrder(merchantId: string, orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  })
  
  if (!order) return false
  
  // Merchant must own at least one product in the order
  return order.items.some(item => item.product.sellerId === merchantId)
}

export async function canPayOrder(customerId: string, orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  return order?.customerId === customerId && order?.status === 'awaiting_payment'
}

export async function canDispatchOrder(merchantId: string, orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  })
  
  if (!order || order.status !== 'paid') return false
  return order.items.some(item => item.product.sellerId === merchantId)
}

export async function canViewOrderTracking(customerId: string, orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  return order?.customerId === customerId
}
```

### 6.2 Data Exposure Rules

| Data | Customer Can See | Merchant Can See | Exposure Risk |
|------|-----------------|------------------|--------------|
| Order items | ✅ Own only | ✅ Own products only | ⚠️ Enforce at API level |
| Customer name | ✅ Own | ✅ On own orders | ✅ Safe |
| Customer phone | ✅ Own | ✅ On own orders | ✅ Safe (needed for delivery) |
| Customer email | ✅ Own | ✅ On own orders | ✅ Safe (needed for notifications) |
| Customer WhatsApp | ✅ Own | ✅ On own orders | ✅ Safe (needed for delivery) |
| Merchant details | ✅ Store name only | ✅ See all | ⚠️ Limit to store name |
| Payment card | ❌ Masked | ❌ Never | ✅ Never expose PCI data |
| PaymentHistory | ✅ Own | ❌ Never | ✅ Customer only |

### 6.3 Status Update Validation

```typescript
// Every status update must:
// 1. Verify token & extract actor ID
// 2. Validate current status matches expected
// 3. Validate new status is in allowed transitions
// 4. Verify actor has permission for this status
// 5. Validate business logic (e.g., payment received before paid)
// 6. Use database transaction
// 7. Log to OrderEvent table
// 8. Send audit-safe notifications
```

### 6.4 Logging & Audit Trail

```typescript
// Every order event must create OrderEvent record:
// {
//   orderId: string
//   eventType: string (approved | rejected | paid | dispatched | etc.)
//   actorId: string (who did it)
//   actorType: string (merchant | customer | system)
//   oldStatus: string (prev status)
//   newStatus: string (new status)
//   message: string (what happened)
//   metadata: json (extra context, e.g., payment method)
//   createdAt: datetime
// }

// Never store:
// - Full credit card numbers
// - Sensitive banking info
// - Customer passwords
// - Internal system notes
```

---

## 7. BACKWARD COMPATIBILITY NOTES

### 7.1 Legacy Order Handling

**Problem**: Existing orders in database don't have approval workflow fields

**Solution**:

```sql
-- Migration for existing orders
BEGIN TRANSACTION;

-- Add new columns with defaults
ALTER TABLE "Order" 
  ADD COLUMN approvedAt TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN approvedBy VARCHAR NULL DEFAULT NULL,
  ADD COLUMN rejectedAt TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN rejectedReason VARCHAR NULL DEFAULT NULL,
  ADD COLUMN paidAt TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN paymentStatus VARCHAR DEFAULT 'pending',
  ADD COLUMN paymentMethod VARCHAR NULL DEFAULT NULL,
  ADD COLUMN dispatchedAt TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN trackedAt TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN trackingStatus VARCHAR NULL DEFAULT NULL,
  ADD COLUMN trackingMessage VARCHAR NULL DEFAULT NULL,
  ADD COLUMN driverName VARCHAR NULL DEFAULT NULL,
  ADD COLUMN driverPhone VARCHAR NULL DEFAULT NULL;

-- Update status for existing orders
UPDATE "Order" 
  SET status = CASE 
    WHEN status = 'pending' THEN 'pending_approval'
    WHEN status = 'processing' THEN 'paid'  -- Assume payment received
    WHEN status = 'shipped' THEN 'dispatched'
    ELSE status
  END;

-- Set approvedAt for all existing "paid" or "dispatched" orders
UPDATE "Order" 
  SET approvedAt = createdAt,
      approvedBy = NULL,  -- Unknown who approved
      paymentStatus = 'paid',
      paidAt = createdAt
  WHERE status IN ('paid', 'dispatched', 'delivered');

COMMIT;
```

### 7.2 Frontend Fallback for Legacy Orders

```typescript
// For orders without approvalWorkflow fields:
const getOrderTimeline = (order: Order) => {
  const timeline = []
  
  // All orders have createdAt
  timeline.push({ status: 'created', timestamp: order.createdAt })
  
  // Legacy orders go straight to paid/dispatched
  if (order.status === 'paid' && !order.approvedAt) {
    timeline.push({ status: 'approved', timestamp: order.createdAt })
    timeline.push({ status: 'paid', timestamp: order.createdAt })
  }
  
  // New orders follow full workflow
  if (order.approvedAt) timeline.push({ status: 'approved', timestamp: order.approvedAt })
  if (order.paidAt) timeline.push({ status: 'paid', timestamp: order.paidAt })
  if (order.dispatchedAt) timeline.push({ status: 'dispatched', timestamp: order.dispatchedAt })
  
  return timeline
}
```

### 7.3 API Response Compatibility

```typescript
// Always include optional fields in response, with null as default
// This way old clients don't break:

{
  id: "order_123",
  status: "paid",
  total: 118.00,
  
  // Old fields (always present)
  customerName: "John",
  customerEmail: "john@example.com",
  
  // New fields (present but may be null for legacy orders)
  approvedAt: "2025-01-14T10:00:00Z" | null,
  approvedBy: "merchant_123" | null,
  paidAt: "2025-01-14T10:30:00Z" | null,
  trackingStatus: "in_transit" | null,
  trackingMessage: "Driver on the way" | null
}
```

---

## 8. OPTIONAL ENHANCEMENTS

### 8.1 Inventory Reservation

```typescript
// When order is placed, reserve stock:
// ProductVariant.reserved += quantity

// When approved, keep reservation

// When rejected/cancelled, release reservation:
// ProductVariant.reserved -= quantity

// When shipped, deduct from actual stock:
// ProductVariant.stock -= quantity
// ProductVariant.reserved -= quantity

// This prevents overselling in high-concurrency scenarios
```

### 8.2 Email Notifications

```typescript
// Send notifications on status changes:

// Customer notifications:
- "Order Approved" → customer email
- "Payment Required" → customer email + SMS (optional)
- "Order Dispatched" → customer email + SMS
- "Tracking Update" → customer email + SMS
- "Order Delivered" → customer email

// Merchant notifications:
- "New Order Pending Approval" → merchant email
- "Payment Received" → merchant email
- "Order Rejected" → customer email (auto-generated)
```

### 8.3 Order Cancellation with Refunds

```typescript
// If customer cancels before payment:
// - Status: pending_approval → cancelled
// - No refund needed

// If customer cancels after payment:
// - Status: paid → cancelled
// - Trigger refund via Stripe
// - Wait for refund confirmation
// - Update paymentStatus = 'refunded'

// If merchant rejects after payment:
// - Auto-refund to customer
// - Status: rejected
// - Notify customer with refund details
```

### 8.4 Rating & Reviews (Post-Delivery)

```typescript
// After order marked delivered:
// 1. Wait 1-2 days for customer to receive
// 2. Show "Rate Order" button
// 3. Collect: 1-5 stars + comment
// 4. Update Product.rating with average
// 5. Display reviews on product card in marketplace
```

### 8.5 Seller Performance Metrics

```typescript
// Dashboard analytics for seller:
// - Approval rate (approved / total)
// - Average approval time
// - Average dispatch time
// - Delivery success rate
// - Customer rating average
// - Revenue per month
// - Most popular products

// Use these metrics for:
// - Seller ranking/badges
// - Recommendation algorithm
// - Performance incentives
```

### 8.6 Optimistic Locking for Order Updates

```typescript
// Prevent race conditions when multiple updates happen:

model Order {
  // ... existing fields
  version Int @default(1)  // Increment on each update
}

// When updating:
UPDATE Order 
  SET status = 'paid', version = version + 1
  WHERE id = $1 AND version = $2
  RETURNING *

// If version doesn't match, update failed (someone else changed it)
```

---

## SUMMARY

This design provides:

✅ **Complete order lifecycle** from creation → approval → payment → dispatch → delivery  
✅ **Role-based access control** (customer vs merchant)  
✅ **State machine enforcement** (no invalid transitions)  
✅ **Audit trail** (OrderEvent table logs every change)  
✅ **Backward compatibility** (legacy orders still work)  
✅ **Modern UX** (timeline, tracking, status updates)  
✅ **Security** (authorization checks, data privacy)  
✅ **Extensibility** (optional features like inventory, refunds, ratings)

---

**END OF DESIGN DOCUMENT**

Ready for implementation. All code patterns follow existing B2Zi conventions.

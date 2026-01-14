# Complete Payment & Order Flow - Step-by-Step Explanation

## 🎯 Order Lifecycle Overview

```
[Customer Creates Order]
         ↓
  pending_approval (Merchant review needed)
         ↓
  ┌─────────────┬──────────────────┐
  ↓             ↓                  ↓
approved   awaiting_payment      REJECTED ✗
  ↓
  (auto-transition)
  ↓
awaiting_payment (Customer payment needed)
  ↓
  ┌──────────────┐
  ↓              ↓
 PAID        FAILED ✗
  ↓
 paid (Merchant can now dispatch)
  ↓
dispatched (In courier's hands)
  ↓
in_transit (On the way)
  ↓
delivered ✓ (Complete!)
```

---

## 💳 PAYMENT FLOW - STEP BY STEP

### Phase 1: Order Creation (Customer Action)
```
WHEN: Customer places order from marketplace
WHAT: POST /api/orders

REQUEST BODY:
{
  "customerId": "cust_abc123",
  "items": [
    {
      "productId": "prod_xyz789",
      "quantity": 2,
      "selectedColor": "Red",
      "selectedType": "Large",
      "price": 49.99
    }
  ],
  "total": 109.98,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+260123456789",
  "deliveryAddress": "123 Main Street",
  "deliveryCity": "Lusaka",
  "deliveryState": "Lusaka",
  "deliveryZipCode": "10101"
}

DATABASE CHANGES:
✓ Order created with status = "pending_approval"
✓ Order.createdAt = NOW
✓ OrderItems created for each item
✓ OrderEvent created: {
    eventType: "created",
    actorType: "customer",
    oldStatus: null,
    newStatus: "pending_approval",
    message: "Order created by customer"
  }

RESPONSE:
{
  "success": true,
  "data": {
    "id": "order_abc123",
    "status": "pending_approval",
    "total": 109.98,
    "items": [...]
  }
}

CUSTOMER UI STATE:
- Sees order confirmation page
- Order shows status: "Pending Approval"
- Timeline shows: Order Placed ✓, Merchant Review ⏳
- Payment button is DISABLED (waiting for approval)
- No payment required yet
```

---

### Phase 2: Merchant Approval (Merchant Action)

```
WHEN: Merchant reviews order in approval dashboard
      (/sellers/dashboard/orders)
WHAT: PUT /api/orders/{orderId}/approve

VALIDATION CHECKS (OrderTransitionValidator.validateApprove):
✓ Order exists
✓ Order status === "pending_approval"
✓ Order has items
✓ Merchant owns ≥1 product in order
✓ Order not already approved/rejected

REQUEST BODY:
{} (empty - no data needed)

DATABASE CHANGES:
✓ Order.status = "awaiting_payment"  
✓ Order.approvedAt = NOW
✓ Order.approvedBy = merchantId
✓ OrderEvent created: {
    eventType: "approved",
    actorType: "merchant",
    actorId: "merchant_xyz",
    oldStatus: "pending_approval",
    newStatus: "awaiting_payment",
    message: "Order approved by merchant"
  }

RESPONSE:
{
  "success": true,
  "data": {
    "id": "order_abc123",
    "status": "awaiting_payment",
    "approvedAt": "2025-01-14T10:30:00Z",
    "approvedBy": "merchant_xyz"
  }
}

MERCHANT UI:
- Order moves from "Awaiting Approval" queue to "Awaiting Payment" queue
- ✓ Approve button removed
- Cannot reject anymore
- See "Awaiting Payment" status in queue dashboard

CUSTOMER UI (REAL-TIME UPDATE):
- /customers/orders/{orderId} refreshes
- Status badge changes to "Approved"
- Timeline shows: Order Placed ✓, Merchant Review ✓, Payment Pending ⏳
- 🟢 PAYMENT BUTTON BECOMES ENABLED
```

---

### Phase 3: Customer Payment (Customer Action)

```
WHEN: Customer clicks "Pay Now" button on order detail page
WHAT: POST /api/orders/{orderId}/pay

PAYMENT METHOD SELECTION (Radio buttons):
○ Credit/Debit Card
● Bank Transfer
○ Cash on Delivery

VALIDATION CHECKS (OrderTransitionValidator.validatePay):
✓ Order exists
✓ Order status === "awaiting_payment" OR "approved"
✓ Customer owns order (customerId matches)
✓ Payment method valid ("card" | "bank_transfer" | "cash_on_delivery")
✓ Order has items
✓ Order.total > 0
✓ Not already paid

REQUEST BODY:
{
  "paymentMethod": "card",
  "stripePaymentMethodId": "pm_test_abc123xyz" (for Stripe integration)
}

MOCK PAYMENT BEHAVIOR (Current - for testing):
- All payments succeed immediately
- No actual payment processing
- Ready for Stripe integration

PRODUCTION PAYMENT BEHAVIOR (Future with Stripe):
- Send paymentMethod to Stripe API
- Get Stripe PaymentIntent
- Return client secret to frontend
- Frontend confirms payment
- Webhook updates order status

DATABASE CHANGES:
✓ Order.status = "paid"
✓ Order.paidAt = NOW
✓ Order.paymentStatus = "paid"
✓ Order.paymentMethod = "card"
✓ OrderPayment created: {
    orderId: "order_abc123",
    amount: 109.98,
    currency: "USD",
    method: "card",
    status: "paid",
    stripePaymentIntentId: "pi_test_...",
    completedAt: NOW
  }
✓ OrderEvent created: {
    eventType: "paid",
    actorType: "customer",
    actorId: "cust_abc123",
    oldStatus: "awaiting_payment",
    newStatus: "paid",
    message: "Payment received",
    metadata: {
      paymentMethod: "card",
      amount: 109.98,
      transactionId: "txn_..."
    }
  }

RESPONSE:
{
  "success": true,
  "data": {
    "id": "order_abc123",
    "status": "paid",
    "paidAt": "2025-01-14T10:45:00Z",
    "paymentStatus": "paid",
    "paymentMethod": "card"
  }
}

CUSTOMER UI:
- Loading spinner during payment
- Success! "Payment Received" card appears (green)
- Shows: Amount, Method, Timestamp
- Payment button becomes disabled/hidden
- Timeline updated: Order Placed ✓, Merchant Review ✓, Payment Received ✓, Dispatch Pending ⏳
- Can now view order waiting for dispatch

MERCHANT UI (REAL-TIME):
- Order moves from "Awaiting Payment" queue to "Ready to Dispatch" queue
- 🟢 NEW "Dispatch" button appears
- Cannot reject anymore
- See full payment info
```

---

### Phase 4: Merchant Dispatch (Merchant Action)

```
WHEN: Merchant clicks "Dispatch" button in "Ready to Dispatch" queue
      (/sellers/dashboard/orders)
WHAT: PUT /api/orders/{orderId}/dispatch

OPTIONAL INPUT:
- Tracking number (prompt dialog)
- Estimated delivery date (optional)

VALIDATION CHECKS (OrderTransitionValidator.validateDispatch):
✓ Order exists
✓ Order status === "paid"
✓ Order.paymentStatus === "paid"
✓ Merchant owns ≥1 product in order
✓ Order.paidAt exists (payment timestamp required)
✓ Order has items

REQUEST BODY:
{
  "trackingNumber": "TRK123456789" (optional),
  "estimatedDelivery": "2025-01-20" (optional)
}

DATABASE CHANGES:
✓ Order.status = "dispatched"
✓ Order.dispatchedAt = NOW
✓ Order.trackingNumber = "TRK123456789"
✓ Order.estimatedDelivery = "2025-01-20"
✓ Order.trackingStatus = "dispatched"
✓ OrderEvent created: {
    eventType: "dispatched",
    actorType: "merchant",
    actorId: "merchant_xyz",
    oldStatus: "paid",
    newStatus: "dispatched",
    message: "Order dispatched",
    metadata: {
      trackingNumber: "TRK123456789",
      estimatedDelivery: "2025-01-20"
    }
  }

RESPONSE:
{
  "success": true,
  "data": {
    "id": "order_abc123",
    "status": "dispatched",
    "dispatchedAt": "2025-01-14T11:00:00Z",
    "trackingNumber": "TRK123456789",
    "trackingStatus": "dispatched"
  }
}

MERCHANT UI:
- Order moves from "Ready to Dispatch" queue to "In Transit" queue
- ✓ Dispatch button removed
- NEW: "Update Tracking" button appears
- See tracking number and estimated delivery

CUSTOMER UI (REAL-TIME):
- Timeline updates: Dispatched ✓
- NEW "Tracking Information" section shows:
  - Tracking number: TRK123456789
  - Estimated delivery: 2025-01-20
- Status badge changes to "Dispatched"
- Timeline shows: Order Placed ✓, Merchant Review ✓, Payment Received ✓, Dispatched ✓, In Transit ⏳
```

---

### Phase 5: Tracking Updates (Merchant Action)

```
WHEN: Merchant updates order tracking status
      (e.g., "In Transit" → "Delivered")
WHAT: PUT /api/orders/{orderId}/update-tracking

REQUIRED INPUTS:
- trackingStatus: "in_transit" | "delivered"
- trackingMessage: "Package on the way" (required)
- driverName: "John Smith" (optional)
- driverPhone: "+260987654321" (optional)

VALIDATION CHECKS (OrderTransitionValidator.validateInTransit):
✓ Order exists
✓ Order status === "dispatched" OR "in_transit"
✓ Merchant owns ≥1 product
✓ trackingStatus is valid enum
✓ trackingMessage provided
✓ Order.dispatchedAt exists
✓ Not already delivered

AUTO-TRANSITION LOGIC:
IF trackingStatus === "delivered":
  → status becomes "delivered"
ELSE IF status === "dispatched" AND trackingStatus === "in_transit":
  → status becomes "in_transit"

REQUEST BODY:
{
  "trackingStatus": "in_transit",
  "trackingMessage": "Package picked up and in transit to Lusaka",
  "driverName": "John Smith",
  "driverPhone": "+260987654321"
}

DATABASE CHANGES:
✓ Order.status = "in_transit" (or "delivered")
✓ Order.trackingStatus = "in_transit"
✓ Order.trackingMessage = "Package picked up and in transit to Lusaka"
✓ Order.driverName = "John Smith"
✓ Order.driverPhone = "+260987654321"
✓ Order.trackedAt = NOW
✓ OrderEvent created: {
    eventType: "in_transit",
    actorType: "merchant",
    actorId: "merchant_xyz",
    oldStatus: "dispatched",
    newStatus: "in_transit",
    message: "Package picked up and in transit to Lusaka",
    metadata: {
      driverName: "John Smith",
      driverPhone: "+260987654321"
    }
  }

CUSTOMER UI (REAL-TIME):
- "Tracking Information" section updates:
  - Tracking Status: In Transit
  - Message: "Package picked up and in transit to Lusaka"
  - Driver: John Smith
  - Driver Phone: +260987654321
- Timeline adds new event: "In Transit - Package picked up..."
- Status badge: "In Transit"

WHEN STATUS BECOMES "DELIVERED":
- Status badge: "Delivered" (green checkmark)
- Timeline shows: Order Complete ✓
- All steps marked complete
```

---

## 🚨 ERROR SCENARIOS & RECOVERY

### Scenario 1: Merchant Rejects Order
```
WHEN: Merchant clicks "Reject" button instead of approve
STATUS: pending_approval → rejected (TERMINAL)

VALIDATION CHECKS (OrderTransitionValidator.validateReject):
✓ Order status === "pending_approval"
✓ Merchant owns ≥1 product
✓ Reason provided and valid (1-500 chars)
✓ Not already approved/rejected

REQUEST:
{
  "reason": "Customer address is invalid. Please update before resubmitting."
}

DATABASE CHANGES:
✓ Order.status = "rejected"
✓ Order.rejectedAt = NOW
✓ Order.rejectedReason = "Customer address is invalid..."
✓ OrderEvent: eventType="rejected", message from reason

CUSTOMER UI:
- Status: "Rejected" (red X)
- See rejection reason in order details
- Payment button hidden
- Can potentially edit address and create new order
- Timeline shows: Rejected by Merchant at [timestamp]
```

### Scenario 2: Payment Method Invalid
```
WHEN: Customer selects payment method but validation fails
VALIDATION FAILS: paymentMethod not in ["card", "bank_transfer", "cash_on_delivery"]

RESPONSE:
{
  "success": false,
  "error": "Invalid payment method selected"
}

CUSTOMER UI:
- Error alert appears below payment section (red)
- Error message: "Invalid payment method selected"
- Payment button remains enabled
- Can try different payment method
```

### Scenario 3: Payment Fails (Future - with Stripe)
```
WHEN: Stripe payment processing fails
STRIPE RETURNS: { status: "requires_action" } or error

DATABASE CHANGES:
✓ OrderPayment.status = "failed"
✓ OrderPayment.failureReason = "Insufficient funds"
✓ Order.status stays "awaiting_payment"
✓ Order.paymentStatus = "failed"
✓ OrderEvent: eventType="payment_failed"

CUSTOMER UI:
- Error alert: "Payment failed: Insufficient funds"
- Payment button re-enabled
- Can retry with different card
- Retry attempt creates new OrderPayment record
```

---

## 📊 COMPLETE API CALL SEQUENCE (Happy Path)

```
1. CUSTOMER: POST /api/orders
   → Creates order with status="pending_approval"
   
2. MERCHANT: Sees order in approval queue
   
3. MERCHANT: PUT /api/orders/{id}/approve
   → Status: pending_approval → awaiting_payment
   
4. CUSTOMER: Sees payment button enabled
   
5. CUSTOMER: POST /api/orders/{id}/pay
   → Status: awaiting_payment → paid
   → Creates OrderPayment record
   
6. MERCHANT: Sees order in dispatch queue
   
7. MERCHANT: PUT /api/orders/{id}/dispatch
   → Status: paid → dispatched
   → Adds tracking number
   
8. MERCHANT: PUT /api/orders/{id}/update-tracking
   → Status: dispatched → in_transit
   → Adds driver info
   
9. MERCHANT: PUT /api/orders/{id}/update-tracking
   → Status: in_transit → delivered
   → Order complete!
   
10. CUSTOMER: Sees "Delivered" status
    → Can view full tracking timeline
```

---

## 🔐 AUTHORIZATION RULES

| Action | Allowed For | Validation |
|--------|-------------|-----------|
| **POST /api/orders** | Customers | customerId from JWT matches |
| **PUT /approve** | Merchants | Merchant owns ≥1 product in order |
| **PUT /reject** | Merchants | Merchant owns ≥1 product in order |
| **POST /pay** | Customers | customerId from JWT matches |
| **PUT /dispatch** | Merchants | Merchant owns ≥1 product, paid |
| **PUT /update-tracking** | Merchants | Merchant owns ≥1 product |
| **GET /tracking** | Customers | customerId from JWT matches |

---

## 💾 DATABASE STATE PROGRESSION

### After Creation
```
Order {
  id: "order_123",
  status: "pending_approval",
  customerId: "cust_abc",
  total: 109.98,
  createdAt: 2025-01-14T10:00:00Z,
  approvedAt: null,
  paidAt: null,
  dispatchedAt: null
}

OrderEvent[] {
  { eventType: "created", newStatus: "pending_approval" }
}
```

### After Approval
```
Order {
  ...
  status: "awaiting_payment",
  approvedAt: 2025-01-14T10:30:00Z,
  approvedBy: "merchant_xyz"
}

OrderEvent[] {
  { eventType: "created" },
  { eventType: "approved", newStatus: "awaiting_payment" }
}
```

### After Payment
```
Order {
  ...
  status: "paid",
  paidAt: 2025-01-14T10:45:00Z,
  paymentStatus: "paid",
  paymentMethod: "card"
}

OrderPayment {
  orderId: "order_123",
  amount: 109.98,
  method: "card",
  status: "paid"
}

OrderEvent[] {
  { eventType: "created" },
  { eventType: "approved" },
  { eventType: "paid", newStatus: "paid" }
}
```

### After Dispatch
```
Order {
  ...
  status: "dispatched",
  dispatchedAt: 2025-01-14T11:00:00Z,
  trackingNumber: "TRK123456789"
}

OrderEvent[] {
  { eventType: "created" },
  { eventType: "approved" },
  { eventType: "paid" },
  { eventType: "dispatched", trackingNumber: "TRK123456789" }
}
```

### After Delivery
```
Order {
  ...
  status: "delivered",
  trackedAt: 2025-01-14T14:00:00Z,
  trackingStatus: "delivered",
  driverName: "John Smith"
}

OrderEvent[] {
  { eventType: "created" },
  { eventType: "approved" },
  { eventType: "paid" },
  { eventType: "dispatched" },
  { eventType: "in_transit" },
  { eventType: "delivered" }
}
```

---

## 🎨 UI FLOW SUMMARY

### Customer Journey
```
Marketplace
    ↓
Add to Cart
    ↓
Checkout Form
    ↓
Place Order
    ↓
[⏳ Awaiting Merchant Approval]
    ↓
Order Detail Page (read-only, waiting)
    ↓
[Merchant Approves]
    ↓
Order Detail Page (payment button enabled)
    ↓
Click "Pay Now"
    ↓
Select Payment Method
    ↓
[Processing Payment...]
    ↓
✓ Payment Received Badge
    ↓
[⏳ Awaiting Dispatch]
    ↓
[Merchant Dispatches]
    ↓
✓ Tracking Information Section
    ↓
[Real-time Tracking Updates]
    ↓
✓ Delivered Status
```

### Merchant Journey
```
Seller Dashboard (/sellers/dashboard/orders)
    ↓
See "Awaiting Approval" Queue
    ↓
Click Order Card
    ↓
[⏳ Awaiting Approval] queue expanded
    ↓
Click "✓ Approve" or "✗ Reject"
    ↓
[IF APPROVED]
    ↓
Order moves to "Awaiting Payment" Queue
    ↓
[Customer Pays]
    ↓
Order moves to "Ready to Dispatch" Queue
    ↓
Click "📦 Dispatch"
    ↓
Enter Tracking Number (optional)
    ↓
Order moves to "In Transit" Queue
    ↓
Click "View Details" to update tracking
    ↓
Update with: Status, Message, Driver Info
    ↓
Order completes
```

---

## 📱 RESPONSIVE DESIGN NOTES

- **Mobile**: Stacked cards, single-column layout
- **Tablet**: 2-column grid for queues
- **Desktop**: 4-column grid for queues, detailed view
- **Animations**: Smooth transitions, hover effects on buttons
- **Icons**: Lucide icons for all actions
- **Colors**: Status-based color scheme (blue, green, amber, orange, red)
- **Typography**: Clear hierarchy, readable fonts

---

## ✅ Testing Checklist

- [ ] Customer can create order (status: pending_approval)
- [ ] Payment button disabled until approved
- [ ] Merchant can approve order
- [ ] Payment button becomes enabled after approval
- [ ] Customer can pay with different methods
- [ ] Order moves to paid status after payment
- [ ] Merchant can dispatch after payment
- [ ] Customer sees tracking info after dispatch
- [ ] Tracking updates appear in timeline
- [ ] All OrderEvents are created correctly
- [ ] Authorization checks prevent unauthorized access
- [ ] Error messages are clear and actionable

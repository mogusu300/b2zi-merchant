# Order System API Quick Reference

## Endpoints Summary

### Merchant Operations

#### Approve Order
```
PUT /api/orders/{id}/approve
Authorization: Bearer {merchant_token}
Content-Type: application/json

Request: {} (empty body)

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "approved",
    approvedAt: "2025-01-14T10:30:00Z",
    approvedBy: "merchant_456"
  }
}
```

#### Reject Order
```
PUT /api/orders/{id}/reject
Authorization: Bearer {merchant_token}
Content-Type: application/json

Request: {
  reason: "Out of stock"  // Required, max 500 chars
}

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "rejected",
    rejectedAt: "2025-01-14T10:30:00Z",
    rejectedReason: "Out of stock"
  }
}
```

#### Dispatch Order
```
PUT /api/orders/{id}/dispatch
Authorization: Bearer {merchant_token}
Content-Type: application/json

Request: {
  trackingNumber: "ZW123456789",  // Optional
  estimatedDelivery: "2025-01-15T18:00:00Z"  // Optional
}

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "dispatched",
    dispatchedAt: "2025-01-14T11:00:00Z",
    trackingNumber: "ZW123456789",
    trackingStatus: "dispatched"
  }
}
```

#### Update Tracking
```
PUT /api/orders/{id}/update-tracking
Authorization: Bearer {merchant_token}
Content-Type: application/json

Request: {
  trackingStatus: "in_transit",  // or "delivered" - Required
  trackingMessage: "Driver on the way",  // Required
  driverName: "Ahmed",  // Optional
  driverPhone: "+263712345678"  // Optional
}

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "in_transit",  // or "delivered"
    trackingStatus: "in_transit",
    trackingMessage: "Driver on the way",
    driverName: "Ahmed",
    driverPhone: "+263712345678",
    trackedAt: "2025-01-14T14:00:00Z"
  }
}
```

---

### Customer Operations

#### Pay for Order
```
POST /api/orders/{id}/pay
Authorization: Bearer {customer_token}
Content-Type: application/json

Request (Card Payment): {
  paymentMethod: "card",
  stripePaymentMethodId: "pm_1234567890"
}

Request (Bank Transfer): {
  paymentMethod: "bank_transfer",
  bankName: "CABS",
  accountNumber: "1234567890"
}

Request (Cash on Delivery): {
  paymentMethod: "cash_on_delivery"
}

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    paidAt: "2025-01-14T10:30:00Z",
    transactionId: "pm_1234567890"
  }
}
```

#### View Order Tracking
```
GET /api/orders/{id}/tracking
Authorization: Bearer {customer_token}

Response (200): {
  success: true,
  data: {
    id: "order_123",
    status: "in_transit",
    customerId: "customer_456",
    
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
    
    trackingStatus: "in_transit",
    trackingMessage: "Driver on the way",
    trackingNumber: "ZW123456789",
    driverName: "Ahmed",
    driverPhone: "+263712345678",
    estimatedDelivery: "2025-01-15T18:00:00Z",
    
    deliveryAddress: "123 Main St",
    deliveryCity: "Harare",
    deliveryState: "Harare",
    deliveryZipCode: "00263",
    
    paymentStatus: "paid",
    paymentMethod: "card",
    paidAt: "2025-01-14T10:30:00Z",
    
    timeline: [
      {
        timestamp: "2025-01-14T08:00:00Z",
        eventType: "created",
        status: "pending_approval",
        message: "Order created"
      },
      {
        timestamp: "2025-01-14T10:00:00Z",
        eventType: "approved",
        status: "approved",
        message: "Order approved"
      },
      {
        timestamp: "2025-01-14T10:30:00Z",
        eventType: "paid",
        status: "paid",
        message: "Payment received"
      },
      {
        timestamp: "2025-01-14T11:00:00Z",
        eventType: "dispatched",
        status: "dispatched",
        message: "Order dispatched"
      },
      {
        timestamp: "2025-01-14T14:00:00Z",
        eventType: "tracking_updated",
        status: "in_transit",
        message: "Driver on the way"
      }
    ]
  }
}
```

---

## Order Status Values

```
pending_approval   - Waiting for merchant approval
approved           - Approved by merchant
awaiting_payment   - Ready for payment
paid               - Payment received
dispatched         - On its way
in_transit         - In transit with driver
delivered          - Delivered to customer
rejected           - Rejected by merchant (END STATE)
cancelled          - Cancelled (END STATE)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Order is not in pending_approval status"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You are not authorized to approve this order"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Status Transitions

```
pending_approval
  ├→ approved (Merchant can approve)
  ├→ rejected (Merchant can reject)
  └→ cancelled (Customer can cancel before approval)

approved
  └→ awaiting_payment (Auto-transition)

awaiting_payment
  ├→ paid (Customer pays)
  └→ cancelled (Customer can cancel before payment)

paid
  └→ dispatched (Merchant dispatches)

dispatched
  └→ in_transit (Merchant updates tracking)

in_transit
  └→ delivered (Merchant marks as delivered)

rejected (FINAL)
cancelled (FINAL)
delivered (FINAL)
```

---

## Testing with cURL

### Test Approve Order
```bash
curl -X PUT http://localhost:3000/api/orders/order_123/approve \
  -H "Authorization: Bearer merchant_token" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Reject Order
```bash
curl -X PUT http://localhost:3000/api/orders/order_123/reject \
  -H "Authorization: Bearer merchant_token" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Out of stock"}'
```

### Test Dispatch Order
```bash
curl -X PUT http://localhost:3000/api/orders/order_123/dispatch \
  -H "Authorization: Bearer merchant_token" \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "ZW123456789"}'
```

### Test Update Tracking
```bash
curl -X PUT http://localhost:3000/api/orders/order_123/update-tracking \
  -H "Authorization: Bearer merchant_token" \
  -H "Content-Type: application/json" \
  -d '{
    "trackingStatus": "in_transit",
    "trackingMessage": "Driver on the way",
    "driverName": "Ahmed"
  }'
```

### Test Payment
```bash
curl -X POST http://localhost:3000/api/orders/order_123/pay \
  -H "Authorization: Bearer customer_token" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "cash_on_delivery"}'
```

### Test Tracking View
```bash
curl -X GET http://localhost:3000/api/orders/order_123/tracking \
  -H "Authorization: Bearer customer_token"
```

---

## Files Modified/Created

**Schema**:
- `/prisma/schema.prisma` - Updated Order, new OrderEvent & OrderPayment tables

**Libraries**:
- `/lib/order-status.ts` - Status enums and constants
- `/lib/order-state-machine.ts` - Transition validation logic

**API Routes**:
- `/app/api/orders/[id]/approve/route.ts`
- `/app/api/orders/[id]/reject/route.ts`
- `/app/api/orders/[id]/dispatch/route.ts`
- `/app/api/orders/[id]/update-tracking/route.ts`
- `/app/api/orders/[id]/pay/route.ts`
- `/app/api/orders/[id]/tracking/route.ts`

**Documentation**:
- `/ORDER_SYSTEM_IMPLEMENTATION.md` - Full implementation guide
- `/ORDER_SYSTEM_API_QUICK_REFERENCE.md` - This file

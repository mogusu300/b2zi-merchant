# SIMPLIFIED PAYMENT FLOW - VISUAL REFERENCE

## 🔄 Order Lifecycle (Simple Version)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  CUSTOMER CHECKOUT                                             │
│  ─────────────────                                             │
│  1. Browse + Add to cart                                       │
│  2. Enter payment details (SIMULATED AUTH)                     │
│  3. Order created                                              │
│                                                                │
│  📊 Order State: status="pending", paymentStatus="authorized"  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  MERCHANT APPROVAL                                             │
│  ──────────────────                                            │
│  1. Merchant views order                                       │
│  2. Clicks "Approve Order"                                     │
│  3. Order validated & approved                                 │
│                                                                │
│  📊 Order State: status="ready_for_dispatch"                   │
│  🟢 Dispatch button: ENABLED                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  MERCHANT DISPATCH                                             │
│  ──────────────────                                            │
│  1. Merchant clicks "Dispatch"                                 │
│  2. Optional: Enter tracking number                            │
│  3. Order dispatched                                           │
│  4. 💰 SIMULATED PAYMENT CAPTURED                              │
│  5. 💳 Seller credited (simulated)                             │
│                                                                │
│  📊 Order State: status="dispatched"                           │
│  💰 paymentStatus: "captured", paidAt: <timestamp>            │
│  📦 trackingNumber: "TRACK-123"                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  CUSTOMER TRACKING                                             │
│  ──────────────────                                            │
│  Customer sees:                                                │
│  ✅ Order Dispatched                                           │
│  📍 Tracking: TRACK-123                                        │
│  ⏱️  "Your order is on the way"                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚦 Status Transitions

### Simple State Machine

```
                    ┌─ PENDING ─┐
                    │ (Awaiting  │
                    │ approval)  │
                    └─────┬─────┘
                          │
                    (Merchant approves)
                          ↓
                ┌─ READY_FOR_DISPATCH ─┐
                │ (Auth'd, ready to    │
                │  ship)               │
                └───────┬──────────────┘
                        │
                  (Merchant dispatches)
                        ↓
                  ┌─ DISPATCHED ─────┐
                  │ (Payment         │
                  │  captured,       │
                  │  shipping)       │
                  └──────┬───────────┘
                         │
                  (Track shipment)
                         ↓
                  ┌─ IN_TRANSIT ─────┐
                  │ (On the way)     │
                  └──────┬───────────┘
                         │
                  (Delivery complete)
                         ↓
                  ┌─ DELIVERED ──────┐
                  │ (Order done)     │
                  └──────────────────┘
```

---

## 💰 Payment Status Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                PAYMENT STATE THROUGHOUT ORDER                │
└─────────────────────────────────────────────────────────────┘

CHECKOUT:
┌──────────────────────┐
│ paymentStatus: "authorized"
│ paidAt: null
│ ✅ Auth successful
│ ❌ Not yet charged
└──────────────────────┘
        ↓
APPROVAL:
┌──────────────────────┐
│ paymentStatus: "authorized" (unchanged)
│ paidAt: null
│ ✅ Still authorized
│ ⏳ Waiting for dispatch
└──────────────────────┘
        ↓
DISPATCH:
┌──────────────────────┐
│ paymentStatus: "captured" ← CAPTURED HERE!
│ paidAt: <timestamp>
│ ✅ Charged (simulated)
│ ✅ Seller credited
└──────────────────────┘
        ↓
TRACKING:
┌──────────────────────┐
│ paymentStatus: "captured" (unchanged)
│ dispatchedAt: <timestamp>
│ ✅ Order shipped
│ ✅ Payment settled
└──────────────────────┘
```

---

## 📱 Customer UI Journey

### Timeline

```
AFTER CHECKOUT:
──────────────────────────────────────────────
Order Status: "Pending Merchant Review"
[❌ NO "Awaiting Payment" message]
Customer action: Wait for merchant

AFTER MERCHANT APPROVES:
──────────────────────────────────────────────
Order Status: "Ready for Dispatch"
Customer action: Still waiting (merchant preparing)

AFTER MERCHANT DISPATCHES:
──────────────────────────────────────────────
Order Status: ✅ "DISPATCHED"
📍 Tracking Number: TRACK-123456
⏱️  "Your order is on the way! We'll keep you updated."
Customer action: Track order

AFTER DELIVERY:
──────────────────────────────────────────────
Order Status: ✅ "DELIVERED"
Message: "Order delivered! Thanks for shopping with us."
Customer action: Leave review (optional)
```

---

## 🟢 Merchant Dashboard

### Order Queue

```
PENDING APPROVAL (New Orders)
├─ Order #123 - $50.00 - 2 items
├─ Order #124 - $75.50 - 3 items
└─ Order #125 - $125.00 - 1 item

READY FOR DISPATCH (Ready to Ship)
├─ Order #120 ✅ APPROVED - [DISPATCH] button
├─ Order #121 ✅ APPROVED - [DISPATCH] button
└─ Order #122 ✅ APPROVED - [DISPATCH] button
      ↑
   Merchant clicks here to ship

DISPATCHED (Shipped)
├─ Order #100 - Tracking: ABC123 - Shipped 2 hours ago
├─ Order #101 - Tracking: DEF456 - Shipped 1 day ago
└─ Order #102 - Tracking: GHI789 - Shipped 2 days ago

DELIVERED (Done)
├─ Order #90 - Delivered 2 days ago
├─ Order #91 - Delivered 5 days ago
└─ Order #92 - Delivered 1 week ago
```

---

## ✅ Validation Rules

```
┌─ APPROVE ENDPOINT ─────────────────────┐
│ ✅ order.status === "pending"          │
│ ✅ Merchant owns product               │
│ ✅ Order has items                     │
│ ✓ Result: status → "ready_for_dispatch"│
└────────────────────────────────────────┘

┌─ DISPATCH ENDPOINT ───────────────────────────┐
│ ✅ order.status === "ready_for_dispatch"      │
│ ✅ paymentStatus === "authorized"             │
│ ✅ Merchant owns product                      │
│ ✓ Result: status → "dispatched"              │
│ ✓ Result: paymentStatus → "captured"          │
│ ✓ Result: paidAt set + seller credited        │
└───────────────────────────────────────────────┘

┌─ REJECT ENDPOINT ─────────────────────┐
│ ✅ order.status === "pending"         │
│ ✅ Reason provided (< 500 chars)      │
│ ✓ Result: status → "rejected"        │
│ ✓ Payment refunded (future)           │
└───────────────────────────────────────┘

┌─ CANCEL ENDPOINT ─────────────────────┐
│ ✅ order.status !== "dispatched"      │
│ ✅ order.paymentStatus !== "captured" │
│ ✓ Result: status → "cancelled"       │
│ ✓ Payment refunded (future)           │
└───────────────────────────────────────┘
```

---

## 🔴 Error States (What Can Go Wrong)

```
ERROR: "Order must be ready for dispatch"
┌────────────────────────────────────────┐
│ Cause: Order.status !== "ready_for_dispatch"
│ Status might be:
│ • "pending" (not approved yet)
│ • "rejected" (merchant rejected it)
│ • "cancelled" (customer cancelled)
│ Solution: Approve order first
└────────────────────────────────────────┘

ERROR: "Payment must be authorized at checkout"
┌────────────────────────────────────────┐
│ Cause: order.paymentStatus !== "authorized"
│ Status might be:
│ • null (no payment attempted)
│ • "failed" (payment auth failed)
│ • "captured" (already dispatched)
│ Solution: Ensure payment at checkout
└────────────────────────────────────────┘

ERROR: "You don't own this order"
┌────────────────────────────────────────┐
│ Cause: Merchant doesn't have product in order
│ Solution: Wrong merchant trying to dispatch
│ Fix: Only merchant with product can act
└────────────────────────────────────────┘
```

---

## 🧪 Quick Test Scenario

```
1. CUSTOMER CHECKOUT
   ✅ Add item to cart
   ✅ Enter payment (simulated)
   ✅ Place order
   → Check: order.paymentStatus === "authorized"
   → Check: order.status === "pending"

2. MERCHANT APPROVAL
   ✅ Go to seller dashboard
   ✅ Find order in "Pending Approval"
   ✅ Click "Approve Order"
   → Check: order.status === "ready_for_dispatch"
   → Check: Dispatch button appears ENABLED

3. MERCHANT DISPATCH
   ✅ Click "Dispatch Order"
   ✅ (Optionally) Enter tracking number
   ✅ Click "Confirm Dispatch"
   → Check: order.status === "dispatched"
   → Check: order.paymentStatus === "captured"
   → Check: Log shows "[PAYMENT CAPTURED]"

4. CUSTOMER SEES UPDATE
   ✅ Check customer orders page
   → Check: Order shows "Dispatched"
   → Check: Tracking number visible
   → Check: Message shows "Order on the way"
```

---

## 🎯 Key Points

```
❌ OLD FLOW (Broken):
   pending → approved → awaiting_payment → paid → dispatched
   (Too many steps, artificial waiting, deadlock risk)

✅ NEW FLOW (Fixed):
   pending → ready_for_dispatch → dispatched
   (Direct path, payment simulated at right times, no deadlock)

💰 PAYMENT TIMING:
   Checkout:  Authorize (simulated) ← Ready to charge
   Dispatch:  Capture (simulated)   ← Actually "charge"

🚀 RESULT:
   • Merchant can dispatch immediately after approval
   • No artificial waiting for payment
   • Payment captured when goods ship
   • Clean, simple, future-proof
```


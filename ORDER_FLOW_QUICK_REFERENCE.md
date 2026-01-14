# ORDER FLOW - QUICK REFERENCE CARD

## Status Values (Updated Jan 14, 2026)

```
PENDING
  ↓ [Merchant approves]
AWAITING_PAYMENT
  ↓ [Customer pays]
PAID_PENDING_DISPATCH ← ✨ NEW (the dispatch gate)
  ↓ [Merchant dispatches]
DISPATCHED
  ↓ [Tracking updates]
IN_TRANSIT
  ↓ [Delivery]
DELIVERED
```

## Key Status Rules

| Status | Means | Next Action | Who | API Endpoint |
|--------|-------|-------------|-----|--------------|
| `pending` | Merchant decision pending | Approve or Reject | Merchant | `/approve` or `/reject` |
| `awaiting_payment` | Payment pending | Submit payment | Customer | `/pay` |
| `paid_pending_dispatch` | Payment received, waiting for merchant | Dispatch order | Merchant | `/dispatch` |
| `dispatched` | Order shipped | Track shipment | System | N/A |
| `in_transit` | Order in delivery | Confirm delivery | Merchant | `/update-tracking` |
| `delivered` | Order completed | N/A | N/A | N/A |

## Database Column

All orders have `status` column (string):
```sql
status VARCHAR(50)  -- Values: pending, awaiting_payment, paid_pending_dispatch, dispatched, ...
```

## Frontend Conditions

### Show Approve Button
```typescript
if (order.status === "pending") {
  // Show "Approve Order" button
}
```

### Show Payment Button
```typescript
if (order.status === "awaiting_payment") {
  // Show "Pay Now" button
}
```

### Show Dispatch Button
```typescript
if (order.status === "paid_pending_dispatch") {  // ← KEY CHANGE
  // Show "Dispatch Order" button
}
```

## API Responses

### After Approval (BEFORE Payment)
```json
{
  "status": "awaiting_payment",
  "approvedAt": "2025-01-14T10:30:00Z",
  "approvedBy": "merchant_123",
  "paymentStatus": null,
  "paidAt": null
}
```

### After Payment (AFTER Customer Pays)
```json
{
  "status": "paid_pending_dispatch",  // ← Ready to dispatch!
  "approvedAt": "2025-01-14T10:30:00Z",
  "paidAt": "2025-01-14T10:35:00Z",
  "paymentStatus": "paid",
  "paymentMethod": "card"
}
```

### After Dispatch
```json
{
  "status": "dispatched",
  "dispatchedAt": "2025-01-14T10:40:00Z",
  "trackingNumber": "TRACK123456",
  "trackingStatus": "dispatched"
}
```

## Common Issues & Solutions

### Issue: Dispatch button doesn't show
```typescript
// WRONG: checking old status
if (order.status === "paid" || order.status === "approved") { }

// CORRECT: check for new status
if (order.status === "paid_pending_dispatch") { }
```

### Issue: Dispatch returns 400 error
```
Error: Order must be in paid_pending_dispatch status, currently: awaiting_payment

// Solution: Customer hasn't paid yet
// UI should show "Payment" button, not "Dispatch"
```

### Issue: Payment endpoint throws error
```
// Check that order status is "awaiting_payment"
// The validate() function expects this

// After payment succeeds:
// Order status should change to "paid_pending_dispatch"
// Check logs for: [STATE TRANSITION] Order xxx: awaiting_payment → paid_pending_dispatch
```

## Debugging Checklist

When order is stuck:

- [ ] What is `order.status`? (Should be one of the values above)
- [ ] What is `order.paymentStatus`? (Should be "paid" or null)
- [ ] What is `order.paidAt`? (Should have timestamp after payment)
- [ ] Check console logs for `[STATE TRANSITION]` messages
- [ ] Check console logs for `[STATE TRANSITION BLOCKED]` messages
- [ ] Verify user role: is it merchant or customer?
- [ ] What endpoint are they hitting? Approve/Pay/Dispatch?

## Log Messages to Look For

### Good Flow
```
[STATE TRANSITION] Order abc: pending → awaiting_payment
[STATE TRANSITION] Order abc: awaiting_payment → paid_pending_dispatch
[STATE TRANSITION] Order abc: paid_pending_dispatch → dispatched
```

### Blocked Flow
```
[STATE TRANSITION BLOCKED] Order xyz: Cannot dispatch from status "awaiting_payment"
[VALIDATION ERRORS] Order must be in paid_pending_dispatch status, currently: awaiting_payment
```

## Files to Check

- `lib/order-status.ts` - Status enum values
- `lib/order-transition-validator.ts` - Validation rules
- `app/api/orders/[id]/approve/route.ts` - Approval logic
- `app/api/orders/[id]/pay/route.ts` - Payment logic
- `app/api/orders/[id]/dispatch/route.ts` - Dispatch logic
- `app/sellers/dashboard/orders/[id]/page.tsx` - Seller UI

## Updated Jan 14, 2026

**Change:** Introduced `PAID_PENDING_DISPATCH` status to fix order deadlock

**Before:** pending → approved → (stuck, can't dispatch)

**After:** pending → awaiting_payment → paid_pending_dispatch → dispatched ✅

**No Breaking Changes** - Old orders still work, new orders flow correctly

---

## Need More Details?

- See `ORDER_FLOW_DEADLOCK_FIX.md` for detailed analysis
- See `ORDER_FLOW_TEST_PLAN.md` for testing steps
- See `CODE_CHANGES_REFERENCE.md` for code diffs
- See `DEADLOCK_FIX_EXECUTIVE_SUMMARY.md` for business context


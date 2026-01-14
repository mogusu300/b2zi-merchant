# 🧪 Complete Testing & Verification Guide

## Overview

This guide provides step-by-step testing instructions to verify:
1. ✅ All state transitions work correctly
2. ✅ Authorization rules are enforced
3. ✅ UI/UX is consistent and smooth
4. ✅ Payment flow completes successfully
5. ✅ Error handling works as expected

---

## 📋 Test Setup

### Prerequisites
- Dev server running: `npm run dev` (localhost:3000)
- Database migrated: `npx prisma db push`
- Test data created: Run `node create-test-users.js` and `node create-test-merchant.js`

### Test Users & Merchants

**Test Customer #1**
- Email: `customer@example.com`
- Password: `TestPassword123!`
- Role: customer
- Purpose: Place orders, make payments

**Test Customer #2**
- Email: `customer2@example.com`
- Password: `TestPassword123!`
- Role: customer
- Purpose: Test authorization (cannot see other's orders)

**Test Merchant #1**
- Email: `merchant@example.com`
- Password: `TestPassword123!`
- Role: merchant
- Purpose: Approve orders, dispatch, update tracking

**Test Merchant #2**
- Email: `merchant2@example.com`
- Password: `TestPassword123!`
- Role: merchant
- Purpose: Test authorization (cannot approve other's products)

---

## 🎯 Test Suite 1: Happy Path (Complete Order Lifecycle)

### Test 1.1: Order Creation
**Objective**: Verify customer can create order and it enters pending_approval state

**Steps**:
1. Login as `customer@example.com`
2. Navigate to `/marketplace`
3. Add 2 products to cart from **Merchant #1** store
4. Click "Proceed to Checkout"
5. Enter delivery details:
   - Name: Test Customer
   - Address: 123 Main Street
   - City: Lusaka
   - State: Lusaka
   - Zip: 10101
6. Click "Place Order"

**Expected Results**:
- ✅ Order created successfully (toast notification)
- ✅ Redirected to `/customers/orders/[orderId]`
- ✅ Order status shows "Pending Approval" (blue badge)
- ✅ Timeline shows single event: "Order Created" with timestamp
- ✅ Payment button is **DISABLED** (grayed out)
- ✅ Delivery address matches input
- ✅ Items list shows all 2 products with quantities
- ✅ Total amount is correct
- ✅ Order ID is 8+ characters

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE id = 'order_xxx' \G
-- Should show:
-- status: 'pending_approval'
-- customerId: (matches test customer)
-- total: (matches UI)
-- createdAt: current timestamp
-- approvedAt: NULL
-- paidAt: NULL

SELECT * FROM "OrderEvent" WHERE orderId = 'order_xxx' \G
-- Should show exactly 1 record:
-- eventType: 'created'
-- actorType: 'customer'
-- newStatus: 'pending_approval'
```

---

### Test 1.2: Merchant Approval
**Objective**: Verify merchant can approve order and payment button becomes enabled

**Setup**: Order created in Test 1.1

**Steps**:
1. Logout from customer account
2. Login as `merchant@example.com`
3. Navigate to `/sellers/dashboard/orders`
4. Verify order appears in "Awaiting Approval" queue card
5. Click on queue card to expand
6. Find order by Order ID (from Test 1.1)
7. Click **Approve** button

**Expected Results**:
- ✅ "Processing..." text shows during approval
- ✅ Success response received (order moved)
- ✅ Order disappears from "Awaiting Approval" queue
- ✅ Order appears in "Awaiting Payment" queue
- ✅ Reject button is no longer visible
- ✅ Queue counts updated (Awaiting Approval -1, Awaiting Payment +1)

**Customer View (Test)** (without logging out):
1. Open new tab, navigate to `/customers/orders/[orderId]`
2. Refresh page (hard refresh: Ctrl+Shift+R)

**Expected Results**:
- ✅ Status badge changed to "Approved"
- ✅ Timeline shows 2 events:
  - "Order Created"
  - "Approved by Merchant"
- ✅ Payment button is now **ENABLED** (bright blue)
- ✅ Payment section shows total amount and method options
- ✅ Status progress shows "Review" step complete ✓
- ✅ Status progress shows "Payment Pending" as active step (pulsing)

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE id = 'order_xxx' \G
-- Should show:
-- status: 'awaiting_payment'
-- approvedAt: current timestamp
-- approvedBy: (matches merchant ID)
-- paidAt: NULL

SELECT * FROM "OrderEvent" WHERE orderId = 'order_xxx' ORDER BY createdAt \G
-- Should show 2 records (created + approved)
```

---

### Test 1.3: Customer Payment
**Objective**: Verify customer can pay and order enters paid state

**Setup**: Order approved in Test 1.2

**Steps**:
1. Login as `customer@example.com` (from Test 1.1)
2. Navigate to `/customers/orders/[orderId]`
3. Scroll to payment section
4. Verify payment method options visible:
   - ○ Credit/Debit Card (default)
   - ○ Bank Transfer
   - ○ Cash on Delivery
5. Keep "Credit/Debit Card" selected
6. Click **"Pay Now"** button

**Expected Results**:
- ✅ Button shows "Processing..." text
- ✅ Button is disabled during processing
- ✅ No page navigation or errors
- ✅ After 1-2 seconds, success response
- ✅ Page automatically refreshes or updates
- ✅ Payment section replaced with green success card showing:
  - ✓ Payment Received
  - Amount: [total from Test 1.1]
  - Method: Credit/Debit Card
  - Date: Current timestamp
- ✅ Timeline updated with new event: "Payment Received"
- ✅ Status badge changes to "Received" or "Paid"
- ✅ Status progress: "Payment Pending" step marked complete ✓
- ✅ Status progress: "Dispatch" step now active (pulsing)

**Alternative Payment Methods**:
1. Repeat steps 1-5 but test:
   - Bank Transfer method
   - Cash on Delivery method
2. Should behave identically (all succeed in mock mode)

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE id = 'order_xxx' \G
-- Should show:
-- status: 'paid'
-- paidAt: current timestamp
-- paymentStatus: 'paid'
-- paymentMethod: 'card'

SELECT * FROM "OrderPayment" WHERE orderId = 'order_xxx' \G
-- Should show 1 record:
-- amount: (matches order total)
-- method: 'card'
-- status: 'paid'
-- completedAt: current timestamp

SELECT * FROM "OrderEvent" WHERE orderId = 'order_xxx' 
  AND eventType = 'paid' \G
-- Should show 1 record with eventType 'paid'
```

**Merchant View (Test)**:
1. Login as `merchant@example.com`
2. Navigate to `/sellers/dashboard/orders`
3. Refresh page

**Expected Results**:
- ✅ Order disappeared from "Awaiting Payment" queue
- ✅ Order now appears in "Ready to Dispatch" queue (green badge)
- ✅ Queue count updated
- ✅ **Dispatch** button visible (was hidden before)
- ✅ Approve/Reject buttons gone

---

### Test 1.4: Merchant Dispatch
**Objective**: Verify merchant can dispatch order with tracking number

**Setup**: Order paid in Test 1.3

**Steps**:
1. Login as `merchant@example.com`
2. Navigate to `/sellers/dashboard/orders`
3. Click "Ready to Dispatch" queue card
4. Find order from Test 1.1
5. Click **Dispatch** button
6. A dialog prompt should appear asking for tracking number
   - Dialog title: "Enter Tracking Number (optional)"
   - Input field: "Tracking Number"
   - Buttons: "Cancel", "Dispatch"
7. Enter tracking number: `TRK123456789ABC`
8. Click "Dispatch"

**Expected Results**:
- ✅ "Processing..." state during dispatch
- ✅ Dialog closes after response
- ✅ Success notification/toast appears
- ✅ Order disappears from "Ready to Dispatch" queue
- ✅ Order appears in "In Transit" queue (orange badge)
- ✅ Queue counts updated
- ✅ Dispatch button is gone, might see "Update Tracking" button instead

**Customer View (Test)**:
1. Login as `customer@example.com`
2. Navigate to `/customers/orders/[orderId]`
3. Hard refresh page (Ctrl+Shift+R)

**Expected Results**:
- ✅ Status badge: "Dispatched" (orange)
- ✅ NEW "Tracking Information" section appears showing:
  - Icon: 🚚 Truck
  - Tracking Number: TRK123456789ABC (monospace font)
  - Estimated Delivery: [date if provided]
  - Title: "Tracking Information"
- ✅ Timeline updated with "Dispatched" event
- ✅ Status progress: "Dispatch" step marked complete ✓
- ✅ Status progress: "In Transit" step now active (pulsing)

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE id = 'order_xxx' \G
-- Should show:
-- status: 'dispatched'
-- dispatchedAt: current timestamp
-- trackingNumber: 'TRK123456789ABC'
-- trackingStatus: 'dispatched'

SELECT * FROM "OrderEvent" WHERE orderId = 'order_xxx'
  AND eventType = 'dispatched' \G
-- Should show 1 record with tracking number in metadata
```

---

### Test 1.5: Tracking Update (In Transit)
**Objective**: Verify merchant can update tracking status to in_transit

**Setup**: Order dispatched in Test 1.4

**Steps**:
1. Login as `merchant@example.com`
2. Navigate to `/sellers/dashboard/orders`
3. Click "In Transit" queue or find order
4. Click **Update Tracking** button (or similar)
5. Dialog/form should appear with:
   - Tracking Status dropdown
   - Tracking Message text
   - Driver Name input (optional)
   - Driver Phone input (optional)
6. Fill in:
   - Status: "In Transit"
   - Message: "Package picked up and on the way to Lusaka"
   - Driver Name: "John Smith"
   - Driver Phone: "+260987654321"
7. Click Submit/Update

**Expected Results**:
- ✅ Processing state during update
- ✅ Success response received
- ✅ Timeline updated with "In Transit" event
- ✅ Event shows message and driver info
- ✅ Status badge might update to "In Transit"

**Customer View (Test)**:
1. Login as `customer@example.com`
2. Navigate to `/customers/orders/[orderId]`
3. Refresh page

**Expected Results**:
- ✅ Tracking section updated:
  - Tracking Status: In Transit
  - Message: "Package picked up and on the way to Lusaka"
  - Driver: John Smith
  - Phone: +260987654321 (clickable)
- ✅ Timeline shows new event: "In Transit - Package picked up..."
- ✅ Status progress: "In Transit" step marked complete ✓
- ✅ Status progress: "Delivered" step now active (pulsing)

---

### Test 1.6: Final Delivery
**Objective**: Verify merchant can mark order as delivered

**Setup**: Order in transit from Test 1.5

**Steps**:
1. Login as `merchant@example.com`
2. Find order in "In Transit" queue
3. Click **Update Tracking** button
4. Change Status to "Delivered"
5. Update Message: "Order delivered successfully"
6. Update Driver info (optional)
7. Submit

**Expected Results**:
- ✅ Success response
- ✅ Order might disappear from active queues
- ✅ Timeline shows "Delivered" event
- ✅ Status badge: "Delivered" (green with checkmark)

**Customer View (Test)**:
1. Refresh order detail page

**Expected Results**:
- ✅ Status badge: "Delivered" ✓ (green)
- ✅ All timeline steps marked complete ✓✓✓✓✓✓✓
- ✅ All status progress steps marked complete ✓
- ✅ Tracking information still visible with "Delivered" status
- ✅ Order marked as complete

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE id = 'order_xxx' \G
-- Should show:
-- status: 'delivered'
-- trackingStatus: 'delivered'

SELECT * FROM "OrderEvent" WHERE orderId = 'order_xxx'
  ORDER BY createdAt \G
-- Should show 5+ events:
-- 1. created
-- 2. approved
-- 3. paid
-- 4. dispatched
-- 5. in_transit
-- 6. delivered
```

---

## 🔒 Test Suite 2: Authorization Rules

### Test 2.1: Customer Cannot See Other's Orders
**Objective**: Verify customer can't view orders from other customers

**Setup**: Create 2 orders (one from customer@example.com, one from customer2@example.com)

**Steps**:
1. Login as `customer@example.com`
2. Create order (from Test 1.1) and note order ID: `order_A`
3. Logout
4. Login as `customer2@example.com`
5. Try to navigate directly to `/customers/orders/order_A`

**Expected Results**:
- ✅ Get 403 Forbidden error
- ✅ OR redirected to `/customers/orders` (with error toast)
- ✅ Cannot see order details
- ✅ Error message: "Not authorized to view this order" or similar

**Database Verification**:
```sql
SELECT * FROM "Order" WHERE customerId IN (
  SELECT id FROM "User" WHERE email IN ('customer@example.com', 'customer2@example.com')
) \G
-- Should see 2 different orders with 2 different customerIds
```

---

### Test 2.2: Merchant Cannot Approve Product They Don't Sell
**Objective**: Verify merchant can't approve orders with only other merchant's products

**Setup**: 
- Create order with only `merchant2@example.com`'s products
- `merchant@example.com` tries to approve

**Steps**:
1. Login as `customer@example.com`
2. Go to marketplace
3. Add ONLY products from `merchant2@example.com` store
4. Checkout and place order
5. Logout
6. Login as `merchant@example.com`
7. Navigate to `/sellers/dashboard/orders`
8. See if order appears in "Awaiting Approval" queue

**Expected Results**:
- ✅ Order DOES NOT appear in `merchant@example.com`'s approval queue
- ✅ Only appears in `merchant2@example.com`'s queue
- ✅ If manually try to approve via API, get 403/400 error

**Database Verification**:
```sql
-- Check which merchant can approve
SELECT DISTINCT m.id, m.name, m.email, COUNT(p.id) as product_count
FROM "Merchant" m
LEFT JOIN "Product" p ON p.merchantId = m.id
WHERE m.id IN (
  SELECT DISTINCT oi.merchantId FROM "OrderItem" oi 
  WHERE oi.orderId = 'order_xxx'
)
GROUP BY m.id \G
```

---

### Test 2.3: Customer Cannot Pay Others' Orders
**Objective**: Verify customer can't pay orders they don't own

**Setup**: Order from customer@example.com that's awaiting payment

**Steps**:
1. Use curl/Postman to send:
   ```
   POST /api/orders/[orderId]/pay
   Authorization: Bearer [customer2_token]
   Body: { "paymentMethod": "card" }
   ```

**Expected Results**:
- ✅ 403 Forbidden error
- ✅ Response: "Not authorized to pay this order"
- ✅ Order status unchanged (still awaiting_payment)
- ✅ No OrderPayment record created

---

### Test 2.4: Merchant Cannot Dispatch Without Payment
**Objective**: Verify merchant can't dispatch unpaid orders

**Setup**: Order in awaiting_payment state

**Steps**:
1. Try to dispatch order before payment:
   ```
   PUT /api/orders/[orderId]/dispatch
   Authorization: Bearer [merchant_token]
   Body: { "trackingNumber": "TRK123" }
   ```

**Expected Results**:
- ✅ 400 Bad Request error
- ✅ Response: "Order must be paid before dispatch"
- ✅ Order status unchanged
- ✅ No dispatch event created

---

## ⚠️ Test Suite 3: Error Scenarios

### Test 3.1: Invalid Status Transition
**Objective**: Verify system prevents invalid state transitions

**Scenario A: Try to approve paid order**
```
Current Status: paid
Action: PUT /approve
Expected: 400 error - "Order must be in pending_approval state"
```

**Scenario B: Try to pay rejected order**
```
Current Status: rejected
Action: POST /pay
Expected: 400 error - "Cannot pay rejected order"
```

**Scenario C: Try to reject already rejected order**
```
Current Status: rejected
Action: PUT /reject
Expected: 400 error - "Order already rejected"
```

**Scenario D: Try to dispatch delivered order**
```
Current Status: delivered
Action: PUT /dispatch
Expected: 400 error - "Order already delivered"
```

**Implementation Test**:
Use Postman or curl to test each scenario. All should return appropriate error codes:
- ✅ 400 for business logic violations
- ✅ 403 for authorization failures
- ✅ 404 for not found

---

### Test 3.2: Missing Required Fields
**Objective**: Verify validation of required request data

**Test Payment Without Method**:
```
POST /api/orders/[id]/pay
Body: {} (missing paymentMethod)

Expected:
✅ 400 error
✅ Message: "Payment method is required"
```

**Test Reject Without Reason**:
```
PUT /api/orders/[id]/reject
Body: {} (missing reason)

Expected:
✅ 400 error
✅ Message: "Rejection reason is required"
```

**Test Dispatch With Invalid Tracking**:
```
PUT /api/orders/[id]/dispatch
Body: { "trackingNumber": "" } (empty string)

Expected:
✅ Should succeed (tracking is optional)
OR
✅ 400 error if validation enforces non-empty
```

---

### Test 3.3: Non-Existent Order
**Objective**: Verify 404 handling

**Steps**:
1. Try to get non-existent order:
   ```
   GET /api/orders/order_doesnotexist/tracking
   ```

**Expected Results**:
- ✅ 404 Not Found error
- ✅ Message: "Order not found"
- ✅ Customer sees: Toast notification or error page

2. Try to approve non-existent order:
   ```
   PUT /api/orders/order_doesnotexist/approve
   ```

**Expected Results**:
- ✅ 404 error
- ✅ Merchant dashboard handles gracefully

---

### Test 3.4: Database Consistency
**Objective**: Verify database state is always consistent

**After Each Test Step**, run:
```sql
-- Verify Order exists and has valid status
SELECT id, status, createdAt, approvedAt, paidAt, dispatchedAt
FROM "Order" WHERE id = 'order_xxx' \G

-- Verify OrderEvents match status
SELECT eventType, newStatus, createdAt FROM "OrderEvent"
WHERE orderId = 'order_xxx'
ORDER BY createdAt \G

-- Verify OrderItems exist
SELECT productId, merchantId, quantity FROM "OrderItem"
WHERE orderId = 'order_xxx' \G

-- Verify OrderPayment matches Order.paidAt
SELECT status, amount, completedAt FROM "OrderPayment"
WHERE orderId = 'order_xxx' \G
```

**Expected Results**:
- ✅ If Order.status = "paid", OrderPayment.status must = "paid"
- ✅ If Order.status = "dispatched", must have dispatchedAt timestamp
- ✅ OrderEvent records must match all status changes
- ✅ No orphaned records (OrderPayment without Order, etc.)

---

## 🎨 Test Suite 4: UI/UX Verification

### Test 4.1: Timeline Animation
**Objective**: Verify timeline displays smoothly with animations

**Steps**:
1. Create order (Test 1.1)
2. Approve order (Test 1.2)
3. Navigate to `/customers/orders/[id]`
4. Scroll to timeline section
5. Observe animations

**Expected Results**:
- ✅ Timeline events appear with staggered fade-in animation
- ✅ Timeline dots animate on hover (scale 1.1)
- ✅ Event cards slide in from left
- ✅ No jank or stuttering
- ✅ Animations complete in ~500ms
- ✅ Each event icon matches event type
- ✅ Colors are status-appropriate:
  - created → Blue
  - approved → Green
  - paid → Emerald
  - dispatched → Orange
  - in_transit → Amber
  - delivered → Green

**Mobile Test**:
- ✅ Timeline still animated on mobile
- ✅ Events stack vertically
- ✅ Timeline readable on small screen

---

### Test 4.2: Payment Button States
**Objective**: Verify payment button shows correct states

**States to Test**:

1. **Disabled State** (Order not approved):
   - ✅ Button appears grayed out
   - ✅ Mouse cursor shows "not-allowed"
   - ✅ Clicking does nothing
   - ✅ Text: "Pay Now"

2. **Enabled State** (Order approved, not paid):
   - ✅ Button is bright blue
   - ✅ Mouse cursor shows "pointer"
   - ✅ Hover: slight scale/shadow effect
   - ✅ Click triggers payment

3. **Processing State** (During payment):
   - ✅ Button shows "Processing..."
   - ✅ Button disabled during request
   - ✅ Spinner animation (if shown)
   - ✅ Cannot click multiple times

4. **Hidden State** (After payment):
   - ✅ Payment button completely hidden
   - ✅ Success card appears instead
   - ✅ Shows: Amount, Method, Timestamp

---

### Test 4.3: Dashboard Queue Cards
**Objective**: Verify merchant dashboard queue animations and interactions

**Steps**:
1. Login as merchant
2. Navigate to `/sellers/dashboard/orders`
3. Observe queue cards
4. Create orders in different statuses to fill multiple queues

**Expected Results**:

**Card Display**:
- ✅ All 4 queues visible: Awaiting Approval, Awaiting Payment, Ready to Dispatch, In Transit
- ✅ Each shows count (0-99+)
- ✅ Each has appropriate icon:
  - Clock ⏱️ for Awaiting Approval
  - CreditCard 💳 for Awaiting Payment
  - CheckCircle ✓ for Ready to Dispatch
  - Truck 🚚 for In Transit

**Hover Animation**:
- ✅ Card elevates (y-offset -4px)
- ✅ Cursor changes to pointer
- ✅ Smooth transition (~200ms)

**Click/Expand**:
- ✅ Queue expands smoothly
- ✅ ChevronRight icon rotates 90°
- ✅ Order list appears with fade-in
- ✅ Can click again to collapse

**Active Queue**:
- ✅ Active queue has darker background
- ✅ Border is thicker (2px)
- ✅ Has shadow elevation
- ✅ Clear visual distinction

---

### Test 4.4: Order Item List
**Objective**: Verify order items display correctly with scrolling

**Setup**: Create order with 5+ items

**Steps**:
1. Navigate to customer order detail page
2. Scroll to items section
3. Verify display and scrolling

**Expected Results**:
- ✅ Items listed in grid/rows
- ✅ Shows: Product Name, Seller, Quantity, Price
- ✅ Variant info displayed (color, size, etc.)
- ✅ If many items, list is scrollable (max-height applied)
- ✅ Scrollbar appears only when needed
- ✅ Items have subtle background color to distinguish
- ✅ Each item shows line item total

---

### Test 4.5: Status Progress Indicator
**Objective**: Verify 7-step status progress animates correctly

**Setup**: Order in different stages

**Steps**:
1. Create order (pending_approval) - step 1 active
2. Approve - step 2 complete, step 3 active
3. Pay - step 3 complete, step 4 active
4. Dispatch - step 4 complete, step 5 active
5. Update tracking to in_transit - step 5 complete, step 6 active
6. Update tracking to delivered - all steps complete

**Expected Results** (At Each Stage):

**Completed Steps**:
- ✅ Green circle with white checkmark
- ✅ White/bold text
- ✅ Line between steps is green

**Active Step**:
- ✅ Pulsing green circle (infinite animation)
- ✅ Bold text
- ✅ Line before is green, after is gray

**Pending Steps**:
- ✅ Gray circle (empty)
- ✅ Gray text
- ✅ Gray line before step

**7-Step Sequence**:
1. Placed ✓
2. Review ✓
3. Payment Pending
4. Received
5. Dispatched
6. In Transit
7. Delivered

---

### Test 4.6: Error Message Display
**Objective**: Verify error messages appear clearly and are helpful

**Trigger Errors**:

1. **Payment Validation Error**:
   - Try to pay with invalid payment method
   - Expected: Red alert below payment section
   - Message: "Invalid payment method selected"

2. **Authorization Error**:
   - Try to access other customer's order
   - Expected: Error toast or page with message
   - Message: "Not authorized to view this order"

3. **Business Logic Error**:
   - Try to dispatch unpaid order
   - Expected: Red alert on dashboard
   - Message: "Order must be paid before dispatch"

**Expected Behavior**:
- ✅ Error appears immediately (no delay)
- ✅ Clear, human-readable message
- ✅ Icon clearly indicates error (red alert, X, etc.)
- ✅ Error doesn't block other UI elements
- ✅ User can dismiss or error auto-dismisses in 5+ seconds

---

## 📊 Test Suite 5: Performance & Responsiveness

### Test 5.1: Page Load Time
**Objective**: Verify pages load quickly

**Tools**: Chrome DevTools Network tab

**Tests**:
1. Load `/customers/orders/[id]` with pending order
   - Expected: < 1000ms initial load
   - Expected: < 3000ms with all data

2. Load `/sellers/dashboard/orders` with 50+ orders
   - Expected: < 1000ms initial load
   - Expected: Queue counts render immediately
   - Expected: Orders lazy-load as queue expands

3. Create order (checkout → submit)
   - Expected: < 2000ms response time
   - Expected: UI feedback during processing

---

### Test 5.2: Rapid Actions
**Objective**: Verify system handles rapid clicks/actions

**Test**: Double-click "Pay Now" button
- ✅ Payment processes only once
- ✅ Second click ignored or button disabled
- ✅ No duplicate payment records

**Test**: Rapidly switch between queues
- ✅ Dashboard doesn't lag
- ✅ Animations remain smooth
- ✅ Data loads correctly for each queue

---

### Test 5.3: Mobile Responsiveness
**Objective**: Verify pages work on mobile devices

**Tests on Mobile/Tablet**:
1. Customer order detail page
   - ✅ Stack vertically (not side-by-side)
   - ✅ Payment section accessible below items
   - ✅ Timeline readable
   - ✅ Touch-friendly button sizes (>44px)

2. Merchant dashboard
   - ✅ Single-column queue layout
   - ✅ Queue cards stack vertically
   - ✅ Expandable order list readable
   - ✅ Action buttons touch-friendly

---

## ✅ Test Execution Checklist

### Pre-Testing
- [ ] Dev server running (`npm run dev`)
- [ ] Database migrated (`npx prisma db push`)
- [ ] Test users created
- [ ] Fresh browser session (clear cache)
- [ ] DevTools open (for database checks)

### Happy Path Tests (1-6)
- [ ] Test 1.1: Order Creation
- [ ] Test 1.2: Merchant Approval
- [ ] Test 1.3: Customer Payment
- [ ] Test 1.4: Merchant Dispatch
- [ ] Test 1.5: Tracking Update
- [ ] Test 1.6: Final Delivery

### Authorization Tests (2.1-2.4)
- [ ] Test 2.1: Can't see other's orders
- [ ] Test 2.2: Can't approve other's products
- [ ] Test 2.3: Can't pay other's orders
- [ ] Test 2.4: Can't dispatch unpaid orders

### Error Tests (3.1-3.4)
- [ ] Test 3.1: Invalid transitions
- [ ] Test 3.2: Missing fields
- [ ] Test 3.3: Non-existent orders
- [ ] Test 3.4: Database consistency

### UI/UX Tests (4.1-4.6)
- [ ] Test 4.1: Timeline animations
- [ ] Test 4.2: Payment button states
- [ ] Test 4.3: Dashboard animations
- [ ] Test 4.4: Item list scrolling
- [ ] Test 4.5: Status progress indicator
- [ ] Test 4.6: Error messages

### Performance Tests (5.1-5.3)
- [ ] Test 5.1: Page load times
- [ ] Test 5.2: Rapid actions
- [ ] Test 5.3: Mobile responsiveness

---

## 📝 Test Results Template

```
Test Case: [Test Number & Name]
Date: [Date]
Tester: [Name]
Environment: Development

Setup:
[List any prerequisites]

Steps Performed:
1. [Step]
2. [Step]
...

Expected Results:
- [ ] Result 1
- [ ] Result 2

Actual Results:
[What actually happened]

Status: ✅ PASS / ❌ FAIL

Notes:
[Any observations or issues]

Database State:
[Show relevant SQL query results]
```

---

## 🐛 Known Issues & Workarounds

(To be updated as testing reveals issues)

---

## 📞 Support & Debugging

### Quick Debugging Checklist
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Check browser console for JS errors
- [ ] Check Network tab for failed API calls
- [ ] Verify JWT token is valid (check cookies)
- [ ] Check Prisma client is up to date
- [ ] Verify database is running and accessible
- [ ] Check server logs for validation errors

### Common Issues

**Issue**: Payment button stays disabled after approval
- **Cause**: Page not refreshed after approval
- **Fix**: Hard refresh page (Ctrl+Shift+R)

**Issue**: Timeline shows old events
- **Cause**: Browser cache or stale data
- **Fix**: Clear cache and refresh

**Issue**: Order doesn't appear in merchant queue
- **Cause**: Merchant doesn't own products in order
- **Fix**: Verify order has merchant's products

**Issue**: Payment fails silently
- **Cause**: Check API response in Network tab
- **Fix**: Verify paymentMethod value matches enum

---

## 🎯 Success Criteria

All tests pass when:
- ✅ Happy path order lifecycle completes without errors
- ✅ Authorization prevents unauthorized access
- ✅ All UI elements display and animate correctly
- ✅ Database state is consistent throughout
- ✅ Error messages are clear and helpful
- ✅ Mobile responsive without issues
- ✅ No console errors in browser DevTools
- ✅ All API calls complete within 3 seconds

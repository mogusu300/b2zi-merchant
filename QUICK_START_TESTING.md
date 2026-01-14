# ⚡ Quick Start Testing Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Verify Dev Server (30 seconds)

```bash
# Terminal 1: Start dev server
npm run dev

# Should see:
# ✓ Ready in 1234ms
# > Local: http://localhost:3000
```

### Step 2: Create Test Users (1 minute)

```bash
# Terminal 2: Create test data
node create-test-users.js
node create-test-merchant.js

# Should see:
# ✓ Test customer created: customer@example.com
# ✓ Test merchant created: merchant@example.com
```

### Step 3: First Test - Order Creation (1.5 minutes)

**Goal**: Create an order and see it in pending_approval state

```
1. Open: http://localhost:3000
2. Click: [Login]
3. Email: customer@example.com
4. Password: TestPassword123!
5. Click: [Sign In]
6. Navigate: /marketplace
7. Add any product to cart
8. Click: [Checkout]
9. Fill form:
   - Name: Test Customer
   - Address: 123 Main St
   - City: Lusaka
   - State: Lusaka
   - Zip: 10101
10. Click: [Place Order]
11. ✅ Success! Note the Order ID
```

**Expected Result**:
- Order detail page loads
- Status badge shows "Pending Approval" (blue)
- Payment button is DISABLED
- Timeline shows "Order Created" event

### Step 4: Second Test - Merchant Approval (1 minute)

```
1. Logout (click profile → logout)
2. Login as merchant:
   - Email: merchant@example.com
   - Password: TestPassword123!
3. Navigate: /sellers/dashboard/orders
4. Click: [⏰ Awaiting Approval] queue card
5. Find order by ID from Step 3
6. Click: [✓ Approve]
7. Wait for confirmation
```

**Expected Result**:
- Order disappears from "Awaiting Approval" queue
- Order appears in "Awaiting Payment" queue
- Go back to customer view → refresh
- Payment button is now ENABLED

### Step 5: Third Test - Payment (1.5 minutes)

```
1. Logout → Login as customer
2. Go to: /customers/orders/[order-id]
3. Scroll to payment section
4. Verify payment button is ENABLED (blue)
5. Keep "Credit/Debit Card" selected
6. Click: [Pay Now]
7. Wait for success
```

**Expected Result**:
- Success message appears
- Payment section shows success card (green)
- Shows: Amount, Method, Date
- Status badge changes to "Received"
- Go to merchant view → refresh
- Order moves to "Ready to Dispatch" queue

### Step 6: Fourth Test - Dispatch (1 minute)

```
1. Login as merchant
2. Go to: /sellers/dashboard/orders
3. Click: [✓ Ready to Dispatch] queue
4. Click: [📦 Dispatch] button
5. Dialog appears: "Enter Tracking Number?"
6. Type: TRK123456789ABC
7. Click: [Dispatch]
8. Wait for confirmation
```

**Expected Result**:
- Order moves to "In Transit" queue
- Go to customer view → refresh
- Status changes to "Dispatched" (orange)
- NEW section: "Tracking Information" appears
- Shows: Tracking number, status

---

## 📋 5-Minute Test Checklist

Copy this and check off as you go:

```
HAPPY PATH TEST (5 minutes total)
═════════════════════════════════

[ ] 1. Dev server running (npm run dev)
[ ] 2. Test users created
[ ] 3. CUSTOMER creates order
    └─ Status: pending_approval ✓
    └─ Payment disabled ✓
    └─ Order ID noted
    
[ ] 4. MERCHANT approves order
    └─ Order moves to payment queue ✓
    └─ Customer refreshes
    └─ Payment button enabled ✓
    
[ ] 5. CUSTOMER pays order
    └─ Selects payment method ✓
    └─ Clicks "Pay Now" ✓
    └─ Success card appears ✓
    └─ Timeline updated ✓
    
[ ] 6. MERCHANT dispatches
    └─ Enters tracking number ✓
    └─ Order moves to transit queue ✓
    └─ Customer sees tracking info ✓
    
ALL TESTS PASSED! ✓✓✓
```

---

## 🔍 Quick Verification Checklist

After each action, verify:

### After Order Creation
- [ ] Page navigates to `/customers/orders/[id]`
- [ ] Status badge shows "Pending Approval"
- [ ] Payment button is visible but disabled (grayed out)
- [ ] Order ID is displayed
- [ ] Items list shows products
- [ ] Timeline shows "Order Created" event

### After Merchant Approval
- [ ] "Awaiting Approval" queue count decreased
- [ ] "Awaiting Payment" queue count increased
- [ ] Customer refreshes order page
- [ ] Status badge changes to "Approved"
- [ ] Payment button is now ENABLED (bright blue)
- [ ] Timeline adds "Approved" event

### After Customer Payment
- [ ] Payment button shows "Processing..." briefly
- [ ] Success message/toast appears
- [ ] Payment section replaced with green success card
- [ ] Shows: Amount paid, method, date
- [ ] Status badge changes
- [ ] Timeline adds "Payment Received" event
- [ ] Merchant dashboard refreshes
- [ ] Order moves to "Ready to Dispatch" queue

### After Merchant Dispatch
- [ ] Order moves from "Ready" to "In Transit" queue
- [ ] Customer refreshes order page
- [ ] Status badge changes to "Dispatched" (orange)
- [ ] "Tracking Information" section appears
- [ ] Shows: Tracking number, driver (if entered)
- [ ] Timeline adds "Dispatched" event

---

## 🐛 Troubleshooting Quick Fixes

### Problem: Login doesn't work
```
Solution:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear cookies for localhost
3. Hard refresh (Ctrl+Shift+R)
4. Try again
```

### Problem: Order doesn't appear in merchant dashboard
```
Solution:
1. Make sure merchant owns products in order
2. Check you're logged in as correct merchant
3. Refresh page (F5)
4. Check browser console for errors
```

### Problem: Payment button stays disabled
```
Solution:
1. Order must be "approved" status
2. Hard refresh page (Ctrl+Shift+R)
3. Check database: SELECT status FROM "Order" WHERE id='...'
```

### Problem: Merchant dispatch fails
```
Solution:
1. Order must be "paid" status first
2. Try entering tracking number
3. Check console for API error
4. Verify merchant owns products
```

### Problem: See "Not authorized" error
```
Solution:
1. Make sure you're logged in
2. Make sure you're checking YOUR OWN order/merchant
3. Cannot view other customers' orders
4. Cannot approve other merchants' products
```

---

## 📊 Database Quick Check

If something seems wrong, quickly verify database state:

### Check Order Status
```sql
psql -U postgres merchant_db
SELECT id, status, approvedAt, paidAt, dispatchedAt 
FROM "Order" 
ORDER BY createdAt DESC 
LIMIT 3 \G
```

**Expected progression**:
1. pending_approval → approvedAt NULL, paidAt NULL
2. awaiting_payment → approvedAt set, paidAt NULL
3. paid → both timestamps set
4. dispatched → dispatchedAt set

### Check Order Events
```sql
SELECT eventType, oldStatus, newStatus, createdAt
FROM "OrderEvent" 
WHERE orderId = 'order_xxx'
ORDER BY createdAt \G
```

**Should see**:
- created
- approved
- paid
- dispatched
- (in_transit)
- (delivered)

### Check Payment Record
```sql
SELECT status, method, amount, completedAt
FROM "OrderPayment"
WHERE orderId = 'order_xxx' \G
```

**Should show**:
- status: "paid"
- method: "card" (or selected method)
- amount: (order total)
- completedAt: (timestamp)

---

## 🎯 Success Indicators

You're doing great when you see:

### UI Indicators
- ✅ Animations are smooth (no stuttering)
- ✅ Buttons respond immediately
- ✅ Colors match the guide (blue → green → orange)
- ✅ Icons appear correctly (clock, check, truck, card)
- ✅ Text is readable and clear

### API Indicators
- ✅ No errors in browser console
- ✅ Network tab shows successful requests (200-201)
- ✅ Response time < 1 second per request
- ✅ API returns expected data format

### Database Indicators
- ✅ OrderEvent records created for each action
- ✅ Order status changes at each step
- ✅ OrderPayment created after payment
- ✅ No orphaned records

---

## 📱 Testing on Different Devices

### Mobile (Chrome DevTools)
```
1. Press F12 to open DevTools
2. Click device icon (top-left)
3. Select "iPhone 12"
4. Run same tests
```

**Verify**:
- Layout stacks vertically
- Buttons are clickable (44+ px)
- Text is readable
- Animations work on mobile

### Tablet
```
In DevTools:
- Select "iPad Pro"
- Run same tests
```

**Verify**:
- 2-column layout works
- Queue cards responsive
- Orders list scrollable

---

## 🚨 Common Mistakes to Avoid

```
❌ Mistake: Try to pay before merchant approves
✅ Fix: Merchant must approve first

❌ Mistake: Try to dispatch before payment
✅ Fix: Customer must pay first

❌ Mistake: Customer can't see merchant's orders
✅ Fix: Correct - each user sees only their own

❌ Mistake: Payment button doesn't work
✅ Fix: Refresh page after approval (hard refresh)

❌ Mistake: Different users interfering
✅ Fix: Clear cookies/cache, log out completely

❌ Mistake: Tracking info appears before dispatch
✅ Fix: Correct - only appears after dispatch

❌ Mistake: Same order shows in multiple queues
✅ Fix: Order should only be in ONE queue at a time
```

---

## 📞 Getting Help

### Check These First
1. Browser console (F12 → Console tab)
   - Any red errors? Copy and debug
   
2. Network tab (F12 → Network)
   - Are API calls returning 200?
   - Or getting 400/403 errors?
   
3. Database state
   - Run SQL queries above
   - Does status match UI?

### If Still Stuck
1. Review the step-by-step payment flow doc
2. Check database matches expectations
3. Verify you're logged in as correct user
4. Try hard refresh (Ctrl+Shift+R)
5. Check dev server logs for errors

---

## ⏱️ Estimated Test Times

| Test | Duration | Key Steps |
|------|----------|-----------|
| Create Order | 1.5 min | Login → Marketplace → Checkout → Submit |
| Approve | 1 min | Login merchant → Dashboard → Click Approve |
| Payment | 1.5 min | Refresh order → Select method → Pay |
| Dispatch | 1 min | Dashboard → Ready queue → Click Dispatch |
| **TOTAL** | **~5 min** | Full happy path |

---

## 📝 Test Report Template

```
TEST RUN - Date: ____/____/____
Tester: _______________________

HAPPY PATH TESTS
════════════════════════════════════

Test 1.1: Order Creation
Status: [ ] PASS  [ ] FAIL
Notes: ___________________________

Test 1.2: Merchant Approval  
Status: [ ] PASS  [ ] FAIL
Notes: ___________________________

Test 1.3: Customer Payment
Status: [ ] PASS  [ ] FAIL
Notes: ___________________________

Test 1.4: Merchant Dispatch
Status: [ ] PASS  [ ] FAIL
Notes: ___________________________

OVERALL: [ ] ALL PASS  [ ] SOME FAIL

Issues Found:
_____________________________________
_____________________________________

Recommendations:
_____________________________________
_____________________________________
```

---

## 🎉 Congratulations!

If you've completed all 5 tests, you've verified:

✅ Order creation works
✅ Approval flow works  
✅ Payment processing works
✅ Dispatch flow works
✅ Authorization checks work
✅ Database records created correctly
✅ Timeline displays updated
✅ UI animations smooth
✅ API integration complete
✅ Status badges update

**The order system is fully functional!**

Next steps:
1. Run full test suite (see TESTING_VERIFICATION_GUIDE.md)
2. Test on mobile devices
3. Prepare for user acceptance testing
4. Plan Stripe integration
5. Set up email notifications

---

## 📚 Documentation Reference

For more details, see:
- **PAYMENT_FLOW_COMPLETE.md** - Detailed step-by-step payment flow
- **TESTING_VERIFICATION_GUIDE.md** - Comprehensive test cases
- **UI_VISUAL_GUIDE.md** - UI layout mockups
- **FRONTEND_IMPLEMENTATION_COMPLETE.md** - Implementation summary

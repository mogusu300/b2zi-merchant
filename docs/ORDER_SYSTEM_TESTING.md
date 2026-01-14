# 🧪 Order System - Testing Guide

## Quick Testing Workflow

### 1. **Start Fresh**
- Open `http://localhost:3000/marketplace`
- Clear browser localStorage (if needed)

---

## **CUSTOMER FLOW**

### Step 1: Register as Customer
1. Click "Sign In" or go to `/customers/register`
2. Fill in:
   - Email: `customer@test.com`
   - Name: `John Doe`
   - Password: `test123`
3. Click Register

### Step 2: Login
1. Go to `/customers/login`
2. Enter credentials
3. Should redirect to marketplace

### Step 3: Add Products to Cart
1. Browse marketplace products
2. Click on any product to view details
3. Select variants (color, size)
4. Choose quantity
5. Click "Add to Cart"
6. Cart sidebar should update

### Step 4: Proceed to Checkout
1. Click "Checkout" button in cart sidebar
2. You should be on `/customers/checkout`

### Step 5: Fill in Delivery Information
**Shipping Address Section:**
- Full Name: `John Doe`
- Email: `john@example.com`
- Street Address: `123 Main Street`
- City: `New York`
- State: `NY`
- Zip Code: `10001`

**Contact Information Section** (NEW):
- Phone Number: `+1 (555) 123-4567` ← **REQUIRED**
- WhatsApp: `+1 (555) 987-6543` ← Optional

### Step 6: Payment Information
- Card Number: `4242 4242 4242 4242` (pre-filled)
- Expiry: `12/25` (pre-filled)
- CVC: `123` (pre-filled)

### Step 7: Place Order
1. Click "Place Order"
2. Should see success message
3. Will redirect to `/customers/orders?orderid=...`

### Step 8: View Order Tracking
1. On `/customers/orders` page
2. Click order to expand
3. Should see:
   - ✅ Order Status (pending)
   - ✅ Delivery Address (123 Main Street, New York, NY 10001)
   - ✅ Order Items with seller info
   - ✅ Total amount

---

## **SELLER FLOW**

### Step 1: Login as Seller
1. Go to `/sellers/login` (or `/admin`)
2. Use existing seller credentials OR
3. Register as new seller at `/register`

### Step 2: Navigate to Orders
1. Go to `/sellers/orders`
2. Should see the order you just placed

### Step 3: View Order Details
The order card shows:
```
Order #ABC123DEF
2026-01-07
Customer: John Doe    ← NEW
$XX.XX
[Status Dropdown]
```

### Step 4: Click Order to Expand
You'll see:

**📦 Delivery Information**
- Recipient Name: `John Doe`
- Delivery Address: `123 Main Street, New York, NY 10001`

**📞 Contact Information** (NEW)
- Phone: `+1 (555) 123-4567`
  - [Call] button → Opens phone dialer
- WhatsApp: `+1 (555) 987-6543`
  - [Chat] button → Opens WhatsApp
- Email: `john@example.com`

**📦 Order Items**
- Product details
- Quantity and variants
- Price

### Step 5: Test Contact Buttons
- **[Call]** button - Should open your phone app/dialer
- **[Chat]** button - Should open WhatsApp

### Step 6: Update Order Status
1. Click status dropdown
2. Change from `pending` to `processing`
3. Order should update immediately

### Step 7: (Optional) Add Tracking Info
In the API, you can PATCH the order to add:
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2026-01-10"
}
```

---

## **VERIFY DATA FLOW**

### ✅ Check Customer Received Data
After checkout, customer should see on `/customers/orders`:
- [x] Delivery address they entered
- [x] Seller name for each product
- [x] Status updates
- [x] Order total

### ✅ Check Seller Received Data
Seller should see on `/sellers/orders`:
- [x] Customer name
- [x] Delivery address
- [x] Phone number
- [x] WhatsApp number
- [x] Can call/message customer
- [x] Order items with product names
- [x] Order total

### ✅ Check Database
Connect to PostgreSQL and verify:
```sql
SELECT id, customerName, customerPhone, customerWhatsApp, 
       deliveryAddress, deliveryCity, status 
FROM "Order" 
ORDER BY createdAt DESC 
LIMIT 5;
```

---

## **TEST VARIATIONS**

### Test Case 1: Without WhatsApp
1. Don't fill WhatsApp field
2. Complete checkout
3. Seller should NOT see WhatsApp button
4. ✅ Should show "Phone only" in contact

### Test Case 2: Multiple Items
1. Add 3-4 different products
2. Vary colors/sizes
3. Check all show in order details
4. ✅ Each should show seller name

### Test Case 3: Status Updates
1. Create order
2. Seller changes status to `processing`
3. Seller changes to `shipped` + adds tracking
4. Seller changes to `delivered`
5. ✅ Customer should see all updates

---

## **TROUBLESHOOTING**

### Issue: Order not appearing on seller dashboard
- [ ] Check seller is logged in to correct account
- [ ] Verify order was created for products from this seller
- [ ] Check database: `SELECT * FROM "Order" LIMIT 5;`

### Issue: Phone/WhatsApp buttons not working
- [ ] Phone: Requires device/app support
- [ ] WhatsApp: Must have WhatsApp installed
- [ ] Links should be clickable (test in console)

### Issue: Delivery address not showing
- [ ] Check checkout form submission
- [ ] Verify database has the fields
- [ ] Check API response includes fields

### Issue: Contact info missing
- [ ] Ensure checkout form submitted all fields
- [ ] Check API request body in network tab
- [ ] Verify Prisma migration was applied

---

## **ENDPOINT TESTING (Postman/curl)**

### Create Order via API
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_id_here",
    "items": [
      {
        "productId": "product_id",
        "quantity": 1,
        "price": 29.99
      }
    ],
    "total": 29.99,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1-555-123-4567",
    "customerWhatsApp": "+1-555-987-6543",
    "deliveryAddress": "123 Main St",
    "deliveryCity": "New York",
    "deliveryState": "NY",
    "deliveryZipCode": "10001"
  }'
```

### Get Seller Orders
```bash
curl http://localhost:3000/api/merchants/{seller_id}/orders
```

### Get Customer Orders
```bash
curl http://localhost:3000/api/customers/{customer_id}/orders
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/{order_id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TRK123",
    "estimatedDelivery": "2026-01-10"
  }'
```

---

## **Success Criteria**

✅ All tests pass when:

1. **Checkout Flow**
   - Customer can enter all delivery info
   - Phone is required, WhatsApp is optional
   - Order is created in database

2. **Seller Dashboard**
   - Seller sees all incoming orders
   - Can view customer contact details
   - Phone/WhatsApp buttons are clickable
   - Can update order status

3. **Customer Tracking**
   - Customer sees order details
   - Sees delivery address
   - Sees seller name for items
   - Sees status updates

4. **Data Integrity**
   - All fields save to database
   - No data loss
   - Contact info is accessible
   - Delivery address is complete

---

## **Key Features to Highlight**

🎯 **For Demo/Presentation**:
1. **Complete Order Flow** - Start to finish
2. **Direct Communication** - Phone/WhatsApp buttons
3. **Delivery Visibility** - Full address tracking
4. **Seller Control** - Status management
5. **Customer Experience** - Real-time order tracking

---

**Server Running At**: `http://localhost:3000`
**Marketplace**: `http://localhost:3000/marketplace`
**Customer Orders**: `http://localhost:3000/customers/orders`
**Seller Orders**: `http://localhost:3000/sellers/orders`

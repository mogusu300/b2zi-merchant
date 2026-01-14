# Quick Start Testing Guide - New Authentication System

## 1️⃣ Clear Your Browser Cache
Open developer tools (F12) and paste in console:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 2️⃣ Test as Guest User

**Visit marketplace**: http://localhost:3000/marketplace

You should see:
- ✅ Products displayed
- ✅ No customer name in header (you're logged out)
- ✅ "Login" button in top right

## 3️⃣ Add Item to Cart

1. Click any product card
2. Click "Add to Cart"
3. Close modal

## 4️⃣ Try to Checkout (Without Login)

1. Click "Cart" button in header
2. See message: **"Sign up first to proceed to checkout"**
3. Button says: **"Sign Up to Checkout"** ← This is correct!

## 5️⃣ Create New Account

1. Click "Sign Up to Checkout" button
2. Redirected to `/customers/register`
3. Fill form:
   - Name: Your Name
   - Email: youremail@example.com
   - Password: YourPassword123
   - Phone: 555-1234
4. Click "Sign Up"

## 6️⃣ Checkout Automatically

After registration:
1. ✅ Auto-logged in
2. ✅ Redirected to checkout page
3. ✅ Email & name already filled in
4. Fill shipping address
5. Click "Place Order"

## 7️⃣ Verify Order Created

**In browser**:
- Should see "Order Placed!" confirmation
- Redirected to `/customers/orders`

**In database**:
```bash
node debug-database.js
```

Should show:
```
CUSTOMERS: 1
ORDERS: 1
MERCHANTS: 1
PRODUCTS: 1
```

## ✅ Success Indicators

✅ You can browse marketplace without login  
✅ Can't checkout without logging in first  
✅ Registration creates customer in database  
✅ Orders appear in database after checkout  
✅ Can see your orders in /customers/orders  

## 🔄 Test Returning User

1. Browser → Clear localStorage again
2. Go to marketplace  
3. Click "Login" button
4. Use test credentials:
   - Email: `test@example.com`
   - Password: `Password123`
5. Should see your email in header
6. Add items and checkout works immediately

## 📊 Check Database Anytime

```bash
node debug-database.js
```

This shows:
- How many customers
- How many orders
- How many merchants
- How many products

---

**Everything is now working correctly!** 🎉

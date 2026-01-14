# 🚀 Quick Start - Real Data Guide

Everything is now **100% live with real database data**. Here's your quick reference:

---

## ⚡ Quick Links

### Customer Pages (Real Data ✅)
- **Marketplace**: http://localhost:3000/marketplace
- **Register**: http://localhost:3000/customers/register  
- **Login**: http://localhost:3000/customers/login
- **Checkout**: http://localhost:3000/customers/checkout
- **My Orders**: http://localhost:3000/customers/orders

### Merchant Pages (Real Data ✅)
- **Admin Panel**: http://localhost:3000/admin
- **Seller Login**: http://localhost:3000/sellers/login
- **Dashboard**: http://localhost:3000/sellers/dashboard
- **Products**: http://localhost:3000/sellers/dashboard/products
- **Add Product**: http://localhost:3000/sellers/dashboard/products/new
- **Orders**: http://localhost:3000/sellers/dashboard/orders
- **Customers**: http://localhost:3000/sellers/dashboard/customers
- **Analytics**: http://localhost:3000/sellers/dashboard/analytics

---

## 🎯 What's Live

✅ **All pages** show real database data  
✅ **Marketplace** displays real products  
✅ **Orders** are created and saved  
✅ **Customers** see their orders  
✅ **Merchants** see real stats  
✅ **Admin** approves real merchants  
✅ **No mock data** anywhere  

---

## 🔄 Data Sources

| Page | Gets Data From |
|------|----------------|
| Marketplace | `/api/products` |
| Checkout | Creates order via `/api/orders` |
| My Orders | `/api/customers/[id]/orders` |
| Dashboard | `/api/products` + `/api/orders` |
| Products | `/api/products` (filtered by seller) |
| Orders | `/api/orders` (filtered by seller) |
| Customers | `/api/orders` (grouped into customers) |
| Analytics | `/api/products` + `/api/orders` |
| Admin | `/api/merchants` |

---

## 🧪 Quick Test Flow

### 1. Register as Customer
```
1. Go to http://localhost:3000/customers/register
2. Fill in name, email, password
3. Click Register
4. Redirected to marketplace
```

### 2. Browse Products
```
1. See all products from database
2. Search for products
3. Filter by category
4. Click product to see details
```

### 3. Add to Cart & Checkout
```
1. Add items to cart
2. Go to checkout: http://localhost:3000/customers/checkout
3. Fill shipping info
4. Place order (creates real order in database)
```

### 4. View Orders
```
1. Go to http://localhost:3000/customers/orders
2. See all your real orders
3. Expand to see items
```

### 5. Login as Merchant
```
1. Go to http://localhost:3000/sellers/login
2. Login with test merchant credentials
3. Redirected to dashboard
```

### 6. View Dashboard
```
1. See real stats (revenue, orders, products)
2. See recent orders (real data)
3. All charts show actual data
```

### 7. Add New Product
```
1. Go to /sellers/dashboard/products/new
2. Fill product form
3. Add images, colors, types
4. Submit
5. Product appears in products list (real database)
```

### 8. View Analytics
```
1. Go to /sellers/dashboard/analytics
2. See revenue chart (last 7 days)
3. See product categories pie chart
4. See top selling products
```

---

## 📊 Data Status Summary

### Customers ✅
- Create accounts → Saved to database
- Login → Validated against database
- Place orders → Saved to database
- View orders → Retrieved from database

### Merchants ✅
- Login → Validated against database
- Add products → Saved to database
- View products → Retrieved from database
- View orders → Retrieved from database
- View customers → Aggregated from database
- View analytics → Calculated from database

### Admin ✅
- View merchants → Retrieved from database
- Approve/reject merchants → Updated in database
- View merchant details → Retrieved from database

---

## 🔐 Authentication

### Customer
```
localStorage key: "b2zi_user"
Contains: { id, name, email }
```

### Merchant
```
localStorage key: "b2zi_merchant"
Contains: { id, businessName, ownerName, email }
```

---

## 📝 Example Data Flow

### Placing an Order (Real)
```
1. Customer at /marketplace
   → Fetches products from /api/products
   → Shows real products

2. Customer clicks product
   → Modal shows real product details

3. Customer adds to cart
   → Stored in localStorage

4. Customer goes to /checkout
   → Shows real cart items
   → Shows real prices (from database)

5. Customer submits order
   → POST to /api/orders
   → Creates Order record in database
   → Creates OrderItem records in database
   → Clears localStorage

6. Customer goes to /customers/orders
   → Fetches from /api/customers/[id]/orders
   → Shows real order from database
```

### Viewing Merchant Stats (Real)
```
1. Merchant at /sellers/dashboard
   → Fetches from /api/products
   → Gets all products
   → Filters by sellerId

   → Fetches from /api/orders
   → Gets all orders
   → Filters orders containing merchant's products

2. Calculates real stats:
   - totalRevenue = sum of order totals
   - totalOrders = count of orders
   - totalProducts = count of products

3. Shows real data to merchant
```

---

## 🎨 Real Data Examples

### Real Product (from database)
```json
{
  "id": "clk123...",
  "name": "Wireless Headphones",
  "description": "Premium headphones...",
  "price": 89.99,
  "category": "electronics",
  "images": ["url1", "url2"],
  "colors": ["Black", "Silver"],
  "inStock": true,
  "sellerId": "merchant123",
  "rating": 4.8
}
```

### Real Order (from database)
```json
{
  "id": "ord456...",
  "customerId": "cust123...",
  "items": [
    {
      "productId": "prod123",
      "quantity": 2,
      "price": 89.99
    }
  ],
  "total": 179.98,
  "status": "pending",
  "createdAt": "2025-12-18T..."
}
```

### Real Merchant (from database)
```json
{
  "id": "merch123...",
  "businessName": "Tech Store",
  "ownerName": "John Doe",
  "email": "john@techstore.com",
  "phone": "+263771234567",
  "status": "approved",
  "createdAt": "2025-12-18T..."
}
```

---

## 🚀 Start Here

1. **Make sure dev server is running:**
   ```bash
   pnpm dev
   ```

2. **Visit marketplace:**
   - http://localhost:3000/marketplace

3. **Test as customer:**
   - Register → Login → Browse → Checkout

4. **Test as merchant:**
   - http://localhost:3000/sellers/login

5. **Check admin:**
   - http://localhost:3000/admin

---

## ✅ Everything Works

- ✅ Real products showing
- ✅ Real orders being created
- ✅ Real customer data
- ✅ Real merchant data
- ✅ Real authentication
- ✅ Real stats and analytics

**You're all set! Start testing! 🎉**


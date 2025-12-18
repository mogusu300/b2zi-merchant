# Complete Testing Guide - B2Zi Marketplace

## 🚀 Quick Start URLs

### Base URL
- **Local Development**: `http://localhost:3000`
- **Vercel Production**: `https://your-domain.vercel.app` (after deployment)

---

## 📋 Full URL Map for Testing

### 🛍️ CUSTOMER PAGES

#### Authentication
- **Register**: `http://localhost:3000/customers/register`
- **Login**: `http://localhost:3000/customers/login`

#### Shopping
- **Marketplace**: `http://localhost:3000/marketplace`
- **Checkout**: `http://localhost:3000/customers/checkout`
- **My Orders**: `http://localhost:3000/customers/orders`

---

### 👨‍💼 MERCHANT/SELLER PAGES

#### Dashboard
- **Seller Dashboard**: `http://localhost:3000/sellers/dashboard`

#### Product Management
- **All Products**: `http://localhost:3000/sellers/products`
- **Add New Product**: `http://localhost:3000/sellers/products/new`
- **Edit Product**: `http://localhost:3000/sellers/products/[PRODUCT_ID]/edit`

#### Order Management
- **All Orders**: `http://localhost:3000/sellers/orders`

---

### 🏪 ADMIN/MERCHANT REGISTRATION

- **Merchant Register**: `http://localhost:3000/register`
- **Merchant Admin**: `http://localhost:3000/admin`
- **Merchant Dashboard**: `http://localhost:3000/admin/dashboard`

---

## 🔌 API ENDPOINTS

### 📦 PRODUCTS API

#### Get All Products
```
GET /api/products
```

**Query Parameters:**
```
- category: string (optional) - Filter by category
- search: string (optional) - Search in product names/descriptions
```

**Example:**
```
http://localhost:3000/api/products
http://localhost:3000/api/products?category=Electronics
http://localhost:3000/api/products?search=laptop
http://localhost:3000/api/products?category=Electronics&search=laptop
```

**Response:**
```json
[
  {
    "id": "clk123...",
    "name": "Product Name",
    "description": "Product description",
    "price": 9999,
    "category": "Electronics",
    "images": ["url1", "url2"],
    "colors": ["Red", "Blue"],
    "types": ["Small", "Large"],
    "sellerId": "merchant123",
    "sellerName": "Merchant Business Name",
    "inStock": true,
    "rating": 4.5,
    "reviews": 15,
    "createdAt": "2025-12-18T..."
  }
]
```

#### Get Single Product
```
GET /api/products/[PRODUCT_ID]
```

**Example:**
```
http://localhost:3000/api/products/clk123xyz
```

#### Create Product (Seller)
```
POST /api/products
```

**Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 5000,
  "category": "Electronics",
  "images": ["https://example.com/img1.jpg"],
  "colors": ["Red", "Blue"],
  "types": ["Small", "Medium"],
  "sellerId": "merchant-id-here"
}
```

#### Update Product (Seller)
```
PUT /api/products/[PRODUCT_ID]
```

**Body:** Same as POST

#### Delete Product (Seller)
```
DELETE /api/products/[PRODUCT_ID]
```

---

### 👥 CUSTOMER API

#### Register Customer
```
POST /api/customers/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "customer": {
    "id": "cust123...",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-18T..."
  }
}
```

#### Login Customer
```
POST /api/customers/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "customer": {
    "id": "cust123...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Get Customer Orders
```
GET /api/customers/[CUSTOMER_ID]/orders
```

**Example:**
```
http://localhost:3000/api/customers/cust123/orders
```

**Response:**
```json
[
  {
    "id": "order123...",
    "customerId": "cust123...",
    "items": [
      {
        "id": "item123...",
        "productId": "prod123...",
        "quantity": 2,
        "price": 5000,
        "selectedColor": "Red"
      }
    ],
    "total": 10000,
    "status": "pending",
    "createdAt": "2025-12-18T..."
  }
]
```

---

### 📦 ORDERS API

#### Create Order
```
POST /api/orders
```

**Body:**
```json
{
  "customerId": "cust123...",
  "items": [
    {
      "productId": "prod123...",
      "quantity": 2,
      "selectedColor": "Red",
      "price": 5000
    }
  ],
  "total": 10000,
  "status": "pending",
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Harare",
    "state": "Harare",
    "zipCode": "1000"
  }
}
```

#### Get All Orders
```
GET /api/orders
```

**Query Parameters:**
```
- customerId: string (optional) - Filter by customer
- status: string (optional) - Filter by status
```

#### Update Order Status
```
PATCH /api/orders/[ORDER_ID]
```

**Body:**
```json
{
  "status": "shipped"
}
```

**Valid Statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

#### Delete Order
```
DELETE /api/orders/[ORDER_ID]
```

---

### 🏪 MERCHANT API

#### Get Merchant Stats
```
GET /api/merchants/[MERCHANT_ID]/stats
```

**Response:**
```json
{
  "totalRevenue": 50000,
  "totalOrders": 25,
  "totalProducts": 10,
  "totalViews": 500
}
```

#### Get Merchant Products
```
GET /api/merchants/[MERCHANT_ID]/products
```

**Response:** Same as products list

#### Get Merchant Orders
```
GET /api/merchants/[MERCHANT_ID]/orders
```

**Response:** Orders containing merchant's products

---

## 🧪 TESTING WORKFLOW

### Step 1: Create a Merchant Account
```
1. Go to: http://localhost:3000/register
2. Fill in merchant details
3. Upload ID (optional for testing)
4. Submit
5. Login at http://localhost:3000/admin
```

### Step 2: Add Products as Merchant
```
1. Login to merchant dashboard
2. Go to: http://localhost:3000/sellers/products
3. Click "Add Product"
4. Fill in product details (name, price, category, images)
5. Click "Create Product"
```

**Required Fields:**
- Name: "Test Product"
- Price: "9999"
- Category: Select from dropdown
- Images: Can use image URLs like:
  - https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500
  - https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500

### Step 3: Create Customer Account
```
1. Go to: http://localhost:3000/customers/register
2. Enter:
   - Name: "Test Customer"
   - Email: "customer@test.com"
   - Password: "password123"
3. Click "Register"
4. You'll be redirected to marketplace
```

### Step 4: Browse Marketplace
```
1. Go to: http://localhost:3000/marketplace
2. Products from database should display
3. Use search: http://localhost:3000/marketplace?search=test
4. Click on products to see details
5. Add items to cart
```

### Step 5: Complete Checkout
```
1. Click cart icon
2. Click "Proceed to Checkout"
3. Fill in shipping info
4. Use test card: 4242 4242 4242 4242
5. Click "Place Order"
6. Check orders at: http://localhost:3000/customers/orders
```

### Step 6: View Orders as Merchant
```
1. Login as merchant
2. Go to: http://localhost:3000/sellers/orders
3. See customer orders
4. Update order status
```

---

## 🧬 CURL Testing Examples

### Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High performance laptop",
    "price": 50000,
    "category": "Electronics",
    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
    "colors": ["Silver", "Black"],
    "types": ["13-inch", "15-inch"],
    "sellerId": "YOUR_MERCHANT_ID"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Search Products
```bash
curl "http://localhost:3000/api/products?search=laptop&category=Electronics"
```

### Register Customer
```bash
curl -X POST http://localhost:3000/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login Customer
```bash
curl -X POST http://localhost:3000/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "items": [{
      "productId": "PRODUCT_ID",
      "quantity": 2,
      "price": 9999
    }],
    "total": 19998,
    "status": "pending",
    "shippingAddress": {
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St",
      "city": "Harare",
      "state": "Harare",
      "zipCode": "1000"
    }
  }'
```

---

## 📊 PRODUCT IMAGE URLS TO USE

Great free image URLs for testing:

**Electronics:**
- https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500 (Laptop)
- https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500 (Watch)
- https://images.unsplash.com/photo-1610945415295-d9bbf7e3b3fe?w=500 (Headphones)

**Clothing:**
- https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500 (Jacket)
- https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500 (Shoes)

**Home & Garden:**
- https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500 (Sofa)
- https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500 (Plant)

---

## 🔐 LOCAL STORAGE KEYS

The app uses these localStorage keys (visible in browser DevTools → Application → Local Storage):

- `b2zi_merchant` - Logged-in merchant data
- `b2zi_user` - Logged-in customer data
- `b2zi_cart` - Shopping cart items

**View localStorage in DevTools:**
```javascript
console.log(JSON.parse(localStorage.getItem('b2zi_user')))
console.log(JSON.parse(localStorage.getItem('b2zi_cart')))
```

---

## 🐛 DEBUGGING

### Enable API Logs
```javascript
// In browser console
localStorage.setItem('debug', 'true')
```

### Check Database Connection
```bash
npx prisma db push
npx prisma studio  # Opens GUI at http://localhost:5555
```

### Clear All Data (Reset)
```javascript
// Browser console
localStorage.clear()
```

---

## ✅ TESTING CHECKLIST

- [ ] Create merchant account
- [ ] Add 3+ products with different categories
- [ ] Search products by name
- [ ] Filter by category
- [ ] Create customer account
- [ ] Browse marketplace (should see products from database)
- [ ] Add items to cart
- [ ] Complete checkout
- [ ] View order history
- [ ] View merchant orders
- [ ] Update order status
- [ ] Edit/delete products as merchant

---

## 📱 RESPONSIVE DESIGN

Test on different screen sizes:
- Desktop: `1920x1080` ✓
- Laptop: `1366x768` ✓
- Tablet: `768x1024` ✓
- Mobile: `375x667` ✓

Use browser DevTools (`F12` → Toggle Device Toolbar)

---

## 🚀 DEPLOYMENT URLs (After Vercel)

Once deployed to Vercel, all URLs become:
```
https://your-project-name.vercel.app/...
```

Check `vercel.json` for deployment configuration.

---

## 📞 SUPPORT

If you encounter issues:

1. Check browser console for errors (`F12`)
2. Check server logs for API errors
3. Verify environment variables in `.env.local`
4. Run `npx prisma migrate dev` if schema changes
5. Clear browser cache and localStorage

---

## 🎉 NEXT STEPS

After testing:
1. Push to GitHub: `git push origin main`
2. Deploy to Vercel: Connect GitHub repo to Vercel
3. Update `.env.local` with Vercel environment variables
4. Monitor with Vercel Analytics
5. Set up error tracking (Sentry optional)

Happy Testing! 🚀

# Testing URLs and Guide

All mock data has been removed and replaced with real database queries. Here are all the URLs and endpoints for testing the system:

## Customer/Shopper URLs

### Marketplace (Browse Products)
- **URL**: `http://localhost:3000/`
- **Description**: Main marketplace showing all products from all merchants
- **Features**: 
  - Displays real products from database
  - Search functionality
  - Filters by category
  - Product details with images, prices, ratings

### Customer Registration
- **URL**: `http://localhost:3000/register`
- **Description**: Customer onboarding and registration
- **Features**:
  - Email registration
  - Password setup
  - Account creation

### Customer Login
- **URL**: `http://localhost:3000/register/success`
- **Description**: After registration, customers can view their account

---

## Seller/Merchant URLs

### Seller Login
- **URL**: `http://localhost:3000/sellers/login`
- **Description**: Merchant authentication page
- **Credentials**: Use any email/password from your test merchants in database
- **Features**:
  - Email/password validation
  - Session storage in localStorage (b2zi_merchant)

### Seller Dashboard (Main)
- **URL**: `http://localhost:3000/sellers/dashboard`
- **Protected**: Yes (must login first)
- **Data Source**: Real database queries
- **Features**:
  - Overview stats (revenue, orders, products, visitors)
  - Recent orders display
  - Quick links to other sections

### Products Management
- **URL**: `http://localhost:3000/sellers/dashboard/products`
- **Protected**: Yes
- **Data Source**: Real database queries filtered by sellerId
- **Features**:
  - List of merchant's products
  - Search by product name
  - Filter by stock status (active/out-of-stock)
  - Real product images, prices, categories
  - Edit/Delete buttons (UI present, action to be implemented)

### Add New Product
- **URL**: `http://localhost:3000/sellers/dashboard/products/new`
- **Protected**: Yes
- **Data Source**: Submits to `/api/products` POST endpoint
- **Features**:
  - Product name, description, price, category
  - Primary image URL + multiple additional images
  - Color options (add/remove tags)
  - Type/Variant options (add/remove tags)
  - Stock status checkbox
  - Form validation
  - Auto-redirects to products list on success

### Orders Management
- **URL**: `http://localhost:3000/sellers/dashboard/orders`
- **Protected**: Yes
- **Data Source**: Real database queries
- **Features**:
  - All orders containing merchant's products
  - Order status breakdown (pending/processing/shipped/delivered)
  - Customer name, order total, date, status
  - Status icons and color-coded badges
  - View button for individual orders

### Customers
- **URL**: `http://localhost:3000/sellers/dashboard/customers`
- **Protected**: Yes
- **Data Source**: Real database queries
- **Features**:
  - Unique customers from merchant's orders
  - Customer name, email, order count, total spent
  - Last order date
  - Search functionality
  - Stats: total customers, total revenue, average order value
  - Repeat customer count

### Analytics
- **URL**: `http://localhost:3000/sellers/dashboard/analytics`
- **Protected**: Yes
- **Data Source**: Real database queries
- **Features**:
  - Total revenue, orders, average order value
  - Product count stats
  - Revenue & Orders chart (last 7 days)
  - Sales by category pie chart
  - Top selling products
  - Product categories breakdown
  - Performance insights

### Settings
- **URL**: `http://localhost:3000/sellers/dashboard/settings`
- **Protected**: Yes
- **Features**:
  - Business information form
  - Banking details
  - Support email
  - Status display

---

## API Endpoints (Backend)

### Authentication
```
POST /api/merchant/login
Body: { email: "seller@example.com", password: "password" }
Response: { id, businessName, ownerName, email, phone, status }
```

### Products
```
GET /api/products
Response: Array of all products with seller mapping

POST /api/products
Body: {
  sellerId: "merchant-id",
  name: "Product Name",
  description: "Description",
  price: 99.99,
  category: "Category",
  images: ["url1", "url2"],
  colors: ["color1", "color2"],
  types: ["type1", "type2"],
  inStock: true
}
Response: Created product object
```

### Orders
```
GET /api/orders
Response: Array of all orders with customer and items data
```

### Customers
```
GET /api/customers
Response: Array of all customers
```

### Merchants
```
GET /api/merchants
Response: Array of all merchants

POST /api/merchants
Body: { ... merchant data ... }
Response: Created merchant
```

---

## Testing Flow

### 1. Test as Customer
1. Visit `http://localhost:3000/`
2. Browse products (should show real products from database)
3. Register at `/register`
4. View confirmation at `/register/success`

### 2. Test as Seller
1. Visit `http://localhost:3000/sellers/login`
2. Login with test merchant credentials
3. Navigate dashboard:
   - `/sellers/dashboard` - View stats and recent orders
   - `/sellers/dashboard/products` - View your products
   - `/sellers/dashboard/products/new` - Add new product
   - `/sellers/dashboard/orders` - View orders
   - `/sellers/dashboard/customers` - View customers
   - `/sellers/dashboard/analytics` - View analytics

### 3. Test Product Creation
1. Login as seller
2. Go to `/sellers/dashboard/products/new`
3. Fill product form:
   - Name, Description, Price, Category
   - Add primary image URL
   - Add additional images (multiple)
   - Add colors and types
   - Check "In Stock"
4. Submit form
5. Should redirect to `/sellers/dashboard/products`
6. New product should appear in the list
7. Check database to verify product was created with sellerId

### 4. Test Orders Display
1. Login as seller
2. Go to `/sellers/dashboard/orders`
3. Should see orders containing your products
4. Stats should show breakdown by status
5. Orders should display with real customer data

### 5. Test Analytics
1. Login as seller
2. Go to `/sellers/dashboard/analytics`
3. Charts should populate with real data
4. Stats should reflect actual revenue and orders

---

## Data Structure

### Merchant (Seller)
```json
{
  "id": "uuid",
  "businessName": "Business Name",
  "ownerName": "Owner Name",
  "email": "seller@example.com",
  "phone": "+1234567890",
  "password": "plaintext",
  "status": "approved",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Product
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "category": "Category",
  "images": ["url1", "url2"],
  "colors": ["color1", "color2"],
  "types": ["type1", "type2"],
  "inStock": true,
  "rating": 4.5,
  "reviews": 10,
  "sellerId": "merchant-uuid",
  "createdAt": "timestamp"
}
```

### Order
```json
{
  "id": "uuid",
  "customerId": "customer-uuid",
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com"
  },
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "total": 199.98,
  "status": "pending",
  "createdAt": "timestamp"
}
```

### Customer
```json
{
  "id": "uuid",
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "hashed_password",
  "createdAt": "timestamp"
}
```

---

## Key Features Implemented

✅ **Dashboard Pages** - All pages now fetch real data from database
✅ **Orders Management** - Filter orders by merchant's products
✅ **Customers List** - Group orders to unique customers
✅ **Analytics** - Real charts and stats from database
✅ **Product Management** - Real products with search/filter
✅ **Product Creation** - Add new products with images, colors, variants
✅ **Authentication** - Merchant login with credential validation
✅ **Mobile Responsive** - All pages optimized for mobile

---

## Notes

- All sensitive data (passwords) should be hashed before production
- Image upload should be implemented instead of URL pasting
- Product edit/delete functionality needs to be implemented
- Order status update functionality needs to be implemented
- Customer communication features can be added
- Inventory management can be enhanced


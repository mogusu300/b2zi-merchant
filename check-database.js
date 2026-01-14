const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('📊 B2Zi DATABASE INVENTORY\n');

    // Merchants
    const merchants = await prisma.merchant.findMany({
      select: { id: true, businessName: true, email: true, status: true }
    });
    console.log(`\n🏪 MERCHANTS (${merchants.length}):`);
    console.table(merchants);

    // Customers
    const customers = await prisma.customer.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log(`\n👥 CUSTOMERS (${customers.length}):`);
    console.table(customers);

    // Products
    const products = await prisma.product.findMany({
      select: { 
        id: true, 
        name: true, 
        price: true, 
        seller: { select: { businessName: true } }
      }
    });
    console.log(`\n📦 PRODUCTS (${products.length}):`);
    console.table(products);

    // Orders
    const orders = await prisma.order.findMany({
      select: { 
        id: true, 
        total: true, 
        status: true,
        customerName: true
      }
    });
    console.log(`\n📋 ORDERS (${orders.length}):`);
    console.table(orders);

    // Order Items
    const orderItems = await prisma.orderItem.findMany({
      select: {
        id: true,
        quantity: true,
        price: true,
        order: { select: { id: true } },
        product: { select: { name: true } }
      }
    });
    console.log(`\n🛒 ORDER ITEMS (${orderItems.length}):`);
    console.table(orderItems);

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();

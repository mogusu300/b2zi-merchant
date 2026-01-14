const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== CHECKING DATABASE ===\n');

    const customers = await prisma.customer.findMany();
    console.log('CUSTOMERS:', customers.length);
    customers.forEach(c => {
      console.log(`  - ID: ${c.id}, Email: ${c.email}, Name: ${c.name}`);
    });

    console.log('\nORDERS:', (await prisma.order.findMany()).length);
    const orders = await prisma.order.findMany({
      include: { items: true }
    });
    orders.forEach(o => {
      console.log(`  - ID: ${o.id}, Customer: ${o.customerId}, Status: ${o.status}, Total: ${o.total}`);
      o.items.forEach(item => {
        console.log(`    • Product: ${item.productId}, Qty: ${item.quantity}, Price: ${item.price}`);
      });
    });

    console.log('\nMERCHANTS:', (await prisma.merchant.findMany()).length);
    const merchants = await prisma.merchant.findMany();
    merchants.forEach(m => {
      console.log(`  - Email: ${m.email}, Status: ${m.status}`);
    });

    console.log('\nPRODUCTS:', (await prisma.product.findMany()).length);
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

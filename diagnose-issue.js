// Script to manually test the flow and diagnose issues
// Run this to understand what's happening

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== DIAGNOSING THE ISSUE ===\n');

  console.log('1. DATABASE STATE:');
  const customers = await prisma.customer.findMany();
  const orders = await prisma.order.findMany();
  console.log(`   - Customers in DB: ${customers.length}`);
  console.log(`   - Orders in DB: ${orders.length}`);

  console.log('\n2. WHAT THIS MEANS:');
  if (customers.length === 0) {
    console.log('   ❌ NO customers registered in the database');
    console.log('   ❌ Customer registration is NOT saving to database');
  }

  if (orders.length === 0) {
    console.log('   ❌ NO orders created in the database');
  }

  console.log('\n3. THE ISSUE:');
  console.log('   The system shows a customer name from localStorage, but:');
  console.log('   - That customer ID was never actually created in the database');
  console.log('   - When you try to create an order, the API might reject it');
  console.log('   - OR it creates an orphaned order with a non-existent customerId');

  console.log('\n4. ROOT CAUSE:');
  console.log('   - Customer registration endpoint is not properly saving data');
  console.log('   - OR database connection is failing silently');
  console.log('   - OR the data is not being committed to the database');

  console.log('\n5. WHAT TO DO:');
  console.log('   1. Check browser console for errors during registration');
  console.log('   2. Check server logs (npm run dev terminal)');
  console.log('   3. Try registering a new customer');
  console.log('   4. Run this script again to see if customer appears in DB');
  console.log('   5. Then try placing an order and check again');

  console.log('\n6. TO TEST THE FIX:');
  console.log('   Create a customer manually in the database:');
  const testEmail = 'test@example.com';
  try {
    const bcryptjs = require('bcryptjs');
    const hashedPassword = await bcryptjs.hash('Password123', 10);
    
    const newCustomer = await prisma.customer.create({
      data: {
        email: testEmail,
        name: 'Test Customer',
        password: hashedPassword,
        phone: '1234567890',
      },
    });
    
    console.log('   ✅ Test customer created:');
    console.log(`      - ID: ${newCustomer.id}`);
    console.log(`      - Email: ${newCustomer.email}`);
    console.log('   You can now log in with:');
    console.log(`      - Email: ${testEmail}`);
    console.log(`      - Password: Password123`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log(`   ℹ  Customer ${testEmail} already exists`);
    } else {
      console.log(`   ❌ Error creating test customer: ${error.message}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);

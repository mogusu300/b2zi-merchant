const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('\n========== DEBUG AUTH FLOW ==========\n');

    // 1. Check customer in database
    console.log('1️⃣  Looking for test customer...');
    const customer = await prisma.customer.findUnique({
      where: { email: 'test-customer@b2zi.com' }
    });

    if (customer) {
      console.log('✅ Customer found:');
      console.log('  - ID:', customer.id);
      console.log('  - Email:', customer.email);
      console.log('  - Name:', customer.name);
      console.log('  - Password hash:', customer.password);
      
      // Test password comparison
      console.log('\n2️⃣  Testing password comparison...');
      const testPassword = 'TestPassword123';
      const matches = await bcrypt.compare(testPassword, customer.password);
      console.log('  - Test password: "' + testPassword + '"');
      console.log('  - Hash in DB: "' + customer.password + '"');
      console.log('  - Match result:', matches ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Customer NOT found in database');
      console.log('   Need to create test customer first!');
    }

    // 2. Check merchant in database
    console.log('\n3️⃣  Looking for test merchant...');
    const merchant = await prisma.merchant.findUnique({
      where: { email: 'test-merchant@b2zi.com' }
    });

    if (merchant) {
      console.log('✅ Merchant found:');
      console.log('  - ID:', merchant.id);
      console.log('  - Email:', merchant.email);
      console.log('  - Business:', merchant.businessName);
      console.log('  - Password hash:', merchant.password);
      
      // Test password comparison
      console.log('\n4️⃣  Testing password comparison...');
      const testPassword = 'TestPassword123';
      const matches = await bcrypt.compare(testPassword, merchant.password);
      console.log('  - Test password: "' + testPassword + '"');
      console.log('  - Hash in DB: "' + merchant.password + '"');
      console.log('  - Match result:', matches ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Merchant NOT found in database');
      console.log('   Need to create test merchant first!');
    }

    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();

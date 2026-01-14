const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    const password = 'TestPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create test customer
    const customer = await prisma.customer.create({
      data: {
        email: 'test-customer@b2zi.com',
        name: 'Test Customer',
        password: hashedPassword,
      }
    }).catch(err => {
      if (err.code === 'P2002') {
        console.log('⚠ Test customer already exists');
        return null;
      }
      throw err;
    });

    if (customer) {
      console.log('✅ Test customer created:');
      console.log('Email:', customer.email);
      console.log('Password:', password);
    }

    // Create test merchant
    const merchant = await prisma.merchant.create({
      data: {
        businessName: 'B2Zi Test Store',
        ownerName: 'Test Owner',
        email: 'test-merchant@b2zi.com',
        phone: '+263774123456',
        businessType: 'Retail',
        businessAddress: '123 Test Street',
        password: hashedPassword,
        idType: 'nrc',
        status: 'approved',
        isVerified: true,
      }
    }).catch(err => {
      if (err.code === 'P2002') {
        console.log('⚠ Test merchant already exists');
        return null;
      }
      throw err;
    });

    if (merchant) {
      console.log('✅ Test merchant created:');
      console.log('Email:', merchant.email);
      console.log('Password:', password);
    }

    console.log('\n📝 Login Credentials:');
    console.log('Customer - Email: test-customer@b2zi.com | Password: TestPassword123');
    console.log('Merchant - Email: test-merchant@b2zi.com | Password: TestPassword123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();

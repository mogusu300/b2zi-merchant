const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestMerchant() {
  try {
    // Hash a simple password
    const password = 'TestPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

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
    });

    console.log('✅ Test merchant created:');
    console.log('Email:', merchant.email);
    console.log('Password:', password);
    console.log('Full data:', merchant);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestMerchant();

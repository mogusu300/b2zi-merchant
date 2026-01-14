const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'Mogusuk@gmail.com';
  
  console.log('\n📋 MERCHANT PASSWORD DEBUG');
  console.log('=' .repeat(60));
  
  // Find the merchant
  const merchant = await prisma.merchant.findUnique({
    where: { email },
  });
  
  if (!merchant) {
    console.log('❌ Merchant not found:', email);
    return;
  }
  
  console.log('\n✅ Merchant found:');
  console.log('  ID:', merchant.id);
  console.log('  Email:', merchant.email);
  console.log('  Password Hash:', merchant.password);
  console.log('  Hash Length:', merchant.password.length);
  
  // Test different password variations
  const testPasswords = [
    'Password123',
    'password123',
    'Password123!',
    'TestPassword123',
    'mogusuk',
    'Mogusuk',
    'mogusuk123',
    'Mogusuk123',
    'Mogusuk@gmail.com',
    // Try without any password
  ];
  
  console.log('\n🔐 Testing Password Matches:');
  console.log('-' .repeat(60));
  
  for (const testPass of testPasswords) {
    try {
      const matches = await bcrypt.compare(testPass, merchant.password);
      const status = matches ? '✅' : '❌';
      console.log(`${status} "${testPass}" → ${matches}`);
    } catch (error) {
      console.log(`⚠️  "${testPass}" → ERROR: ${error.message}`);
    }
  }
  
  // Show hash details
  console.log('\n📊 Hash Analysis:');
  console.log('-' .repeat(60));
  const hashParts = merchant.password.split('$');
  console.log('Bcrypt version:', hashParts[1]);
  console.log('Salt rounds:', hashParts[2]);
  console.log('Salt + Hash:', hashParts[3]);
  
  // Try hashing a test password to compare structure
  console.log('\n🔄 Creating New Hash for "Password123":');
  console.log('-' .repeat(60));
  const newHash = await bcrypt.hash('Password123', 10);
  console.log('New hash:', newHash);
  console.log('Structure matches existing:', newHash.split('$')[1] === hashParts[1]);
  
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

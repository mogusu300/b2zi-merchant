const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'Mogusuk@gmail.com';
  
  console.log('\n🔍 DETAILED MERCHANT PASSWORD INVESTIGATION');
  console.log('=' .repeat(70));
  
  // Find the merchant
  const merchant = await prisma.merchant.findUnique({
    where: { email },
  });
  
  if (!merchant) {
    console.log('❌ Merchant not found:', email);
    console.log('\n📋 Available merchants:');
    const allMerchants = await prisma.merchant.findMany({
      select: { id: true, email: true, businessName: true }
    });
    allMerchants.forEach(m => console.log(`   ${m.email} (${m.businessName})`));
    process.exit(1);
  }
  
  console.log('\n✅ Merchant found:');
  console.log('  ID:', merchant.id);
  console.log('  Email:', merchant.email);
  console.log('  Business Name:', merchant.businessName);
  console.log('  Owner Name:', merchant.ownerName);
  console.log('  Status:', merchant.status);
  console.log('  Verified:', merchant.isVerified);
  
  console.log('\n🔐 PASSWORD HASH DETAILS:');
  console.log('-' .repeat(70));
  console.log('Hash:', merchant.password);
  console.log('Hash type:', merchant.password.startsWith('$2') ? 'bcryptjs' : 'Unknown');
  console.log('Hash length:', merchant.password.length);
  
  // Parse bcrypt hash
  const parts = merchant.password.split('$');
  if (parts.length === 4) {
    console.log('\nBcrypt structure:');
    console.log('  Version: $' + parts[1] + '$');
    console.log('  Rounds: ' + parts[2]);
    console.log('  Salt+Hash: ' + parts[3].substring(0, 20) + '... (truncated)');
  }
  
  // Test common passwords
  console.log('\n🧪 TESTING COMMON PASSWORDS:');
  console.log('-' .repeat(70));
  
  const testPasswords = [
    // Most likely candidates
    'Password123',
    'password123',
    'mogusuk',
    'Mogusuk',
    'mogusuk123',
    'Mogusuk123',
    'TestPassword123',
    'test123',
    'Test@123',
    '123456',
    'password',
    'admin',
    'admin123',
    'changeme',
    'Mogusuk@gmail.com',
    'b2zi',
    'B2Zi',
    'Welcome123',
    'Welcome@123',
  ];
  
  let foundMatch = false;
  
  for (const testPass of testPasswords) {
    try {
      const matches = await bcrypt.compare(testPass, merchant.password);
      const status = matches ? '✅ MATCH' : '  ';
      console.log(`${status}: "${testPass}"`);
      if (matches) {
        foundMatch = true;
      }
    } catch (error) {
      console.log(`⚠️  "${testPass}" → ERROR: ${error.message}`);
    }
  }
  
  if (!foundMatch) {
    console.log('\n⚠️  No password match found from common passwords');
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Check your original password when you created this account');
    console.log('2. If forgotten, you may need to reset the password');
    console.log('3. Or update the password directly in the database using:');
    console.log('\n   node update-merchant-password.js Mogusuk@gmail.com YourNewPassword');
  }
  
  process.exit(0);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

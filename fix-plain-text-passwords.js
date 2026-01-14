const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔒 FIXING PLAIN-TEXT PASSWORDS - HASHING ALL UNENCRYPTED PASSWORDS');
  console.log('=' .repeat(70));
  
  // Find merchants with plain-text passwords (not bcrypt)
  const merchants = await prisma.merchant.findMany();
  const customersData = await prisma.customer.findMany();
  
  let merchantsFixed = 0;
  let customersFixed = 0;
  
  console.log('\n👥 CHECKING MERCHANTS:');
  console.log('-' .repeat(70));
  
  for (const merchant of merchants) {
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    const isBcrypt = merchant.password && (
      merchant.password.startsWith('$2a$') ||
      merchant.password.startsWith('$2b$') ||
      merchant.password.startsWith('$2y$')
    );
    
    if (!isBcrypt) {
      console.log(`⚠️  PLAIN-TEXT: ${merchant.email}`);
      console.log(`   Current password: ${merchant.password}`);
      console.log(`   Hashing...`);
      
      const hashedPassword = await bcrypt.hash(merchant.password, 10);
      
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { password: hashedPassword }
      });
      
      console.log(`   ✅ Hashed successfully\n`);
      merchantsFixed++;
    } else {
      console.log(`✅ ALREADY HASHED: ${merchant.email}`);
    }
  }
  
  console.log('\n👤 CHECKING CUSTOMERS:');
  console.log('-' .repeat(70));
  
  for (const customer of customersData) {
    const isBcrypt = customer.password && (
      customer.password.startsWith('$2a$') ||
      customer.password.startsWith('$2b$') ||
      customer.password.startsWith('$2y$')
    );
    
    if (!isBcrypt) {
      console.log(`⚠️  PLAIN-TEXT: ${customer.email}`);
      console.log(`   Current password: ${customer.password}`);
      console.log(`   Hashing...`);
      
      const hashedPassword = await bcrypt.hash(customer.password, 10);
      
      await prisma.customer.update({
        where: { id: customer.id },
        data: { password: hashedPassword }
      });
      
      console.log(`   ✅ Hashed successfully\n`);
      customersFixed++;
    } else {
      console.log(`✅ ALREADY HASHED: ${customer.email}`);
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 SUMMARY:');
  console.log(`   Merchants fixed: ${merchantsFixed}`);
  console.log(`   Customers fixed: ${customersFixed}`);
  console.log(`   Total fixed: ${merchantsFixed + customersFixed}`);
  console.log('=' .repeat(70));
  
  if (merchantsFixed > 0 || customersFixed > 0) {
    console.log('\n✅ All plain-text passwords have been securely hashed!');
    console.log('🔐 Your authentication system is now secure.');
  } else {
    console.log('\n✅ All passwords are already hashed. No action needed!');
  }
  
  process.exit(0);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

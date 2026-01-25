/**
 * Test hunter login with a specific email and password
 * Usage: node test-hunter-login.mjs <email> <password>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin(email, password) {
  try {
    if (!email || !password) {
      console.log('❌ Usage: node test-hunter-login.mjs <email> <password>');
      console.log('\nExample:');
      console.log('  node test-hunter-login.mjs "Mogusu@gmail.com" "Test@123456"\n');
      process.exit(1);
    }

    console.log(`\n🔐 TESTING LOGIN FOR: ${email}`);
    console.log(`📝 PASSWORD: ${password}\n`);

    // Find the hunter (same as backend login)
    const hunter = await prisma.merchantHunter.findUnique({
      where: { email },
    });

    if (!hunter) {
      console.log(`❌ FAIL: No hunter found with email: ${email}\n`);
      process.exit(1);
    }

    console.log(`✅ Hunter found: ${hunter.firstName} ${hunter.lastName}`);

    // Verify password (same as backend login)
    const isPasswordValid = await bcrypt.compare(password, hunter.password);

    if (!isPasswordValid) {
      console.log(`❌ FAIL: Password is INVALID\n`);
      console.log(`   Entered password: "${password}"`);
      console.log(`   Hash in database: ${hunter.password.substring(0, 30)}...\n`);
      process.exit(1);
    }

    console.log(`✅ Password is VALID\n`);
    console.log(`✅ LOGIN WOULD SUCCEED!\n`);
    console.log(`Hunter ID: ${hunter.id}`);
    console.log(`Email: ${hunter.email}`);
    console.log(`Name: ${hunter.firstName} ${hunter.lastName}`);
    console.log(`Phone: ${hunter.phone}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

testLogin(email, password);

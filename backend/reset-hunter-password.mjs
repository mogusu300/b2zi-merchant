/**
 * Reset a hunter's password
 * Usage: node reset-hunter-password.mjs <email> <newPassword>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    if (!email || !newPassword) {
      console.log('❌ Usage: node reset-hunter-password.mjs <email> <newPassword>');
      console.log('\nExample:');
      console.log('  node reset-hunter-password.mjs "Mogusu@gmail.com" "Test@123456"\n');
      process.exit(1);
    }

    console.log(`\n🔐 RESETTING PASSWORD FOR: ${email}`);
    console.log(`📝 NEW PASSWORD: ${newPassword}\n`);

    // Find the hunter
    const hunter = await prisma.merchantHunter.findUnique({
      where: { email },
    });

    if (!hunter) {
      console.log(`❌ No hunter found with email: ${email}\n`);
      
      // List all hunters
      const allHunters = await prisma.merchantHunter.findMany({
        select: { email: true, firstName: true, lastName: true },
      });
      
      console.log('📋 Available hunters:');
      allHunters.forEach((h) => {
        console.log(`  - ${h.email} (${h.firstName} ${h.lastName})`);
      });
      console.log('');
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password
    const updated = await prisma.merchantHunter.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ PASSWORD RESET SUCCESSFUL!\n`);
    console.log(`Hunter: ${updated.firstName} ${updated.lastName}`);
    console.log(`Email: ${updated.email}`);
    console.log(`Password updated at: ${updated.updatedAt}\n`);

    // Verify the new password works
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`✅ Verification: ${isValid ? 'NEW PASSWORD IS VALID' : 'ERROR: Password not valid!'}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

resetPassword(email, password);

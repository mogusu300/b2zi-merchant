/**
 * Debug script to check if hunter account exists in database
 * Run this from the backend directory with: node check-hunter-account.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all hunters
    const hunters = await prisma.merchantHunter.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        password: true,
        createdAt: true,
      },
    });

    console.log('\n📋 HUNTERS IN DATABASE:');
    console.log('=======================\n');

    if (hunters.length === 0) {
      console.log('❌ NO HUNTERS FOUND IN DATABASE\n');
    } else {
      for (let i = 0; i < hunters.length; i++) {
        const h = hunters[i];
        console.log(`${i + 1}. ${h.firstName} ${h.lastName}`);
        console.log(`   Email: ${h.email}`);
        console.log(`   Phone: ${h.phone}`);
        console.log(`   ID: ${h.id}`);
        console.log(`   Password hash exists: ${!!h.password}`);
        console.log(`   Password hash (first 20 chars): ${h.password?.substring(0, 20)}...`);
        console.log(`   Created: ${h.createdAt}`);
        console.log('');
      }
    }

    // Check for merchants linked to hunters
    const merchantLinks = await prisma.merchantHunter.findMany({
      include: {
        merchants: {
          select: {
            id: true,
            businessName: true,
            status: true,
          },
        },
      },
    });

    console.log('\n📊 MERCHANTS LINKED TO HUNTERS:');
    console.log('=================================\n');

    merchantLinks.forEach((hunter, idx) => {
      console.log(`${idx + 1}. ${hunter.email}`);
      if (hunter.merchants.length === 0) {
        console.log('   ❌ No merchants linked');
      } else {
        console.log(`   ✅ ${hunter.merchants.length} merchant(s):`);
        hunter.merchants.forEach((m) => {
          console.log(`      - ${m.businessName} (${m.status})`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

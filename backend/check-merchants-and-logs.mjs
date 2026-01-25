/**
 * Check what merchants exist in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n📊 CHECKING DATABASE FOR MERCHANTS:\n');

    // Get all merchants
    const merchants = await prisma.merchant.findMany({
      include: {
        hunterMerchants: {
          include: {
            merchantHunter: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (merchants.length === 0) {
      console.log('❌ NO MERCHANTS FOUND IN DATABASE\n');
      process.exit(0);
    }

    console.log(`✅ FOUND ${merchants.length} MERCHANTS:\n`);

    merchants.forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.businessName}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Email: ${m.email}`);
      console.log(`   Phone: ${m.phone || 'N/A'}`);
      console.log(`   Status: ${m.status}`);
      
      if (m.hunterMerchants && m.hunterMerchants.length > 0) {
        console.log(`   📌 Linked to hunters:`);
        m.hunterMerchants.forEach((mh) => {
          console.log(`      - ${mh.merchantHunter.email} (${mh.merchantHunter.firstName} ${mh.merchantHunter.lastName})`);
        });
      } else {
        console.log(`   ❌ NOT LINKED TO ANY HUNTER`);
      }

      console.log('');
    });

    // Get hunter for Mogusu@gmail.com with merchants
    console.log('\n🔍 CHECKING MERCHANTS FOR MOGUSU@GMAIL.COM:\n');
    const hunter = await prisma.merchantHunter.findUnique({
      where: { email: 'Mogusu@gmail.com' },
      include: {
        merchants: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!hunter) {
      console.log('❌ Hunter not found\n');
      process.exit(0);
    }

    console.log(`✅ Hunter: ${hunter.firstName} ${hunter.lastName}`);
    console.log(`Email: ${hunter.email}`);
    console.log(`Has ${hunter.merchants.length} merchant(s)\n`);

    if (hunter.merchants.length === 0) {
      console.log('❌ NO MERCHANTS LINKED TO THIS HUNTER\n');
    } else {
      hunter.merchants.forEach((mh) => {
        const m = mh.merchant;
        console.log(`📦 ${m.businessName}`);
        console.log(`   Status: ${m.status}`);
        console.log(`   Owner: ${m.ownerName}`);
        console.log(`   Location: ${m.businessAddress}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

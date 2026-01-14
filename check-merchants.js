const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMerchants() {
  try {
    const merchants = await prisma.merchant.findMany({
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        email: true,
        status: true,
        createdAt: true,
      }
    });

    if (merchants.length === 0) {
      console.log('❌ No merchants found in database');
    } else {
      console.log(`✅ Found ${merchants.length} merchant(s):`);
      console.table(merchants);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMerchants();

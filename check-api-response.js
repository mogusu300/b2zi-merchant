const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get first merchant hunter
    const hunter = await prisma.merchantHunter.findFirst();
    if (!hunter) {
      console.log('No hunters found');
      process.exit(1);
    }

    console.log('Hunter ID:', hunter.id);
    console.log('\n--- Fetching as the API does ---\n');

    // Fetch merchants exactly as the API does
    const result = await prisma.merchantHunterMerchant.findMany({
      where: { merchantHunterId: hunter.id },
      include: {
        merchants: {
          include: {
            merchant_activity_logs: {
              orderBy: { createdAt: 'desc' },
            },
            merchant_onboarding_documents: true,
            merchant_logins: true,
          },
        },
      },
    });

    console.log(`Found ${result.length} merchants for this hunter\n`);

    result.forEach((hunterMerchant, idx) => {
      const merchant = hunterMerchant.merchants;
      console.log(`\n${idx + 1}. ${merchant.businessName}`);
      console.log(`   Merchant ID: ${merchant.id}`);
      console.log(`   Status: ${hunterMerchant.status}`);
      console.log(`   Activity Logs: ${merchant.merchant_activity_logs.length}`);
      
      if (merchant.merchant_activity_logs.length > 0) {
        console.log('   Recent logs:');
        merchant.merchant_activity_logs.slice(0, 3).forEach((log, i) => {
          console.log(`     ${i + 1}. [${new Date(log.createdAt).toLocaleString()}] ${log.action}`);
          console.log(`        ${log.description}`);
        });
      }
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();

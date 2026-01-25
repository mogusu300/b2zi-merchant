const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const merchants = await prisma.merchants.findMany({
      include: {
        merchant_activity_logs: { orderBy: { createdAt: 'desc' } },
        merchant_onboarding_documents: true,
        merchant_logins: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Total merchants:', merchants.length);
    console.log('\nMerchants with activity logs:');
    merchants.slice(0, 5).forEach(m => {
      console.log(`- ${m.businessName}: ${m.merchant_activity_logs.length} logs`);
      if (m.merchant_activity_logs.length > 0) {
        m.merchant_activity_logs.slice(0, 2).forEach((log, i) => {
          console.log(`  ${i + 1}. ${log.action} - ${new Date(log.createdAt).toLocaleString()}`);
        });
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();

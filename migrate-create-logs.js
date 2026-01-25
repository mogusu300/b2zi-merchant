const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== CREATING ACTIVITY LOGS FOR MERCHANTS WITHOUT LOGS ===\n');

    // Get all merchants without activity logs
    const merchants = await prisma.merchants.findMany({
      include: { merchant_activity_logs: true },
    });

    console.log(`Total merchants: ${merchants.length}`);
    
    let createdLogs = 0;
    for (const merchant of merchants) {
      if (merchant.merchant_activity_logs.length === 0) {
        console.log(`\nCreating log for: ${merchant.businessName}`);
        
        // Create MERCHANT_CREATED log for this merchant
        await prisma.merchantActivityLog.create({
          data: {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            merchantId: merchant.id,
            action: 'MERCHANT_CREATED',
            description: `Merchant account created. Business: ${merchant.businessName}. Owner: ${merchant.ownerName}`,
            performedByRole: 'SYSTEM',
            performedByIp: 'system-migration',
            metadata: {
              email: merchant.email,
              businessType: merchant.businessType,
              registrationDate: merchant.createdAt.toISOString(),
            },
          },
        });
        createdLogs++;
      }
    }

    console.log(`\n✅ Created ${createdLogs} activity logs`);

    // Now show summary
    console.log('\n=== SUMMARY ===');
    const updated = await prisma.merchants.findMany({
      include: { merchant_activity_logs: true },
      orderBy: { createdAt: 'desc' },
    });

    updated.forEach(m => {
      console.log(`${m.businessName}: ${m.merchant_activity_logs.length} logs`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();

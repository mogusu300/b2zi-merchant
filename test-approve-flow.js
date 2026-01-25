const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get first merchant hunter and merchant relationship
    const relationship = await prisma.merchantHunterMerchant.findFirst({
      include: {
        merchant_hunters: true,
        merchants: true,
      },
    });

    if (!relationship) {
      console.log('No merchant-hunter relationships found');
      process.exit(1);
    }

    console.log('Testing with:');
    console.log('Hunter ID:', relationship.merchantHunterId);
    console.log('Merchant ID:', relationship.merchantId);
    console.log('Current Status:', relationship.status);

    // Simulate the PUT request manually
    console.log('\n--- Simulating Approve Action ---');
    
    // Step 1: Update MerchantHunterMerchant status
    const updated = await prisma.merchantHunterMerchant.update({
      where: { id: relationship.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    console.log('✅ Updated MerchantHunterMerchant to:', updated.status);

    // Step 2: Create activity log (EXACTLY as the API does)
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const activityLog = await prisma.merchantActivityLog.create({
      data: {
        id: logId,
        merchantId: relationship.merchantId,
        merchantHunterId: relationship.merchantHunterId,
        action: 'STATUS_UPDATE',
        description: `Status updated from ${relationship.status} to completed. Merchant: approved`,
        performedByRole: 'MERCHANT_HUNTER',
        performedByIp: '127.0.0.1',
        performedByUserAgent: 'manual-test',
        metadata: {
          previousOnboardingStatus: relationship.status,
          newOnboardingStatus: 'completed',
          merchantStatus: 'approved',
          timestamp: new Date().toISOString(),
        },
      },
    });
    console.log('✅ Created Activity Log:', logId);

    // Verify
    const savedLog = await prisma.merchantActivityLog.findUnique({
      where: { id: logId },
    });
    console.log('✅ Verified Log:', savedLog.id);

    // Check merchant activity logs
    const merchant = await prisma.merchants.findUnique({
      where: { id: relationship.merchantId },
      include: {
        merchant_activity_logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    console.log('\n--- Merchant Activity Logs ---');
    console.log('Total Logs for merchant:', merchant.merchant_activity_logs.length);
    merchant.merchant_activity_logs.forEach((log, i) => {
      console.log(`${i + 1}. ${log.action} - ${log.description}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Create test merchant
    const merchant = await prisma.merchants.create({
      data: {
        id: `test_${Date.now()}`,
        businessName: 'Test Merchant ' + Date.now(),
        ownerName: 'Test Owner',
        email: `test_${Date.now()}@example.com`,
        phone: '+1234567890',
        businessType: 'Retail',
        businessAddress: '123 Test St',
        password: 'hashed_password_here',
        idType: 'nrc',
        status: 'pending',
        updatedAt: new Date(),
      },
    });
    console.log('✅ Created merchant:', merchant.businessName);

    // Create activity log for the merchant
    const log = await prisma.merchantActivityLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId: merchant.id,
        action: 'MERCHANT_CREATED',
        description: `Merchant account created. Business: ${merchant.businessName}. Owner: ${merchant.ownerName}`,
        performedByRole: 'SYSTEM',
        performedByIp: 'test-ip',
        metadata: {
          email: merchant.email,
          businessType: merchant.businessType,
          registrationDate: new Date().toISOString(),
        },
      },
    });
    console.log('✅ Created activity log:', log.id);

    // Now fetch the merchant with all its logs
    const merchantWithLogs = await prisma.merchants.findUnique({
      where: { id: merchant.id },
      include: {
        merchant_activity_logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    console.log('\n=== MERCHANT WITH LOGS ===');
    console.log('Business:', merchantWithLogs.businessName);
    console.log('Total Activity Logs:', merchantWithLogs.merchant_activity_logs.length);
    merchantWithLogs.merchant_activity_logs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${new Date(log.createdAt).toLocaleString()}] ${log.action}`);
      console.log(`     ${log.description}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();

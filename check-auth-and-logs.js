const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== CHECKING AUTHENTICATION & MERCHANT CREATION ===\n');

    // 1. Check if there are any authenticated sessions
    console.log('--- Checking Sessions ---');
    const sessions = await prisma.sessions.findMany({
      take: 5,
    });
    console.log('Total sessions:', sessions.length);
    if (sessions.length > 0) {
      sessions.slice(0, 3).forEach(s => {
        console.log(`- Session: ${s.id.substring(0, 20)}... (User: ${s.userType})`);
      });
    }

    // 2. Check merchant hunters
    console.log('\n--- Merchant Hunters ---');
    const hunters = await prisma.merchantHunter.findMany({
      take: 3,
    });
    console.log('Total hunters:', hunters.length);
    hunters.forEach(h => {
      console.log(`- ${h.firstName} ${h.lastName} (${h.email})`);
    });

    // 3. Test creating a merchant and activity log
    console.log('\n--- Testing Merchant Creation ---');
    const testMerchant = await prisma.merchants.create({
      data: {
        id: `test_${Date.now()}`,
        businessName: `Test Merchant ${Date.now()}`,
        ownerName: 'Test Owner',
        email: `test_${Date.now()}@example.com`,
        phone: '+1234567890',
        businessType: 'Retail',
        businessAddress: '123 Test St',
        password: 'hashed_password',
        idType: 'nrc',
        status: 'pending',
        updatedAt: new Date(),
      },
    });
    console.log('✅ Merchant created:', testMerchant.id);

    // Create activity log manually
    const log = await prisma.merchantActivityLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId: testMerchant.id,
        action: 'MERCHANT_CREATED',
        description: `Test log for ${testMerchant.businessName}`,
        performedByRole: 'SYSTEM',
        performedByIp: '127.0.0.1',
      },
    });
    console.log('✅ Activity log created:', log.id);

    // Verify
    const merchantWithLogs = await prisma.merchants.findUnique({
      where: { id: testMerchant.id },
      include: { merchant_activity_logs: true },
    });
    console.log(`✅ Verification: Merchant has ${merchantWithLogs.merchant_activity_logs.length} logs`);

    // 4. Check all merchants and their log counts
    console.log('\n--- All Merchants & Activity Logs ---');
    const allMerchants = await prisma.merchants.findMany({
      include: { merchant_activity_logs: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    console.log(`Total merchants: ${allMerchants.length}`);
    allMerchants.forEach(m => {
      console.log(`${m.businessName}: ${m.merchant_activity_logs.length} logs`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();

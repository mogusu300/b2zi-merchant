const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get all activity logs
    const logs = await prisma.merchantActivityLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('=== ACTIVITY LOGS IN DATABASE ===');
    console.log('Total Logs:', logs.length);
    console.log('\n--- Recent Logs ---');
    logs.forEach((log, i) => {
      console.log(`\n${i + 1}. [${new Date(log.createdAt).toLocaleString()}]`);
      console.log(`   Merchant ID: ${log.merchantId}`);
      console.log(`   Action: ${log.action}`);
      console.log(`   Description: ${log.description}`);
    });
    
    // Get merchants with their logs
    const merchants = await prisma.merchants.findMany({
      include: {
        merchant_activity_logs: { orderBy: { createdAt: 'desc' } }
      },
      take: 5
    });
    
    console.log('\n\n=== MERCHANTS WITH ACTIVITY LOGS ===');
    merchants.forEach(merchant => {
      console.log(`\nMerchant: ${merchant.businessName} (${merchant.id})`);
      console.log(`  Total Logs: ${merchant.merchant_activity_logs.length}`);
      merchant.merchant_activity_logs.slice(0, 3).forEach(log => {
        console.log(`    - ${log.action} (${new Date(log.createdAt).toLocaleString()})`);
      });
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();

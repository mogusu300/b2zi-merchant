const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get a merchant hunter and merchant to test with
    const hunter = await prisma.merchantHunter.findFirst();
    const merchant = await prisma.merchants.findFirst();
    
    if (!hunter || !merchant) {
      console.error('No hunter or merchant found');
      process.exit(1);
    }
    
    console.log('Hunter ID:', hunter.id);
    console.log('Merchant ID:', merchant.id);
    
    // Check if merchantHunterMerchant relationship exists
    const relationship = await prisma.merchantHunterMerchant.findUnique({
      where: {
        merchantHunterId_merchantId: {
          merchantHunterId: hunter.id,
          merchantId: merchant.id,
        },
      },
    });
    
    if (!relationship) {
      console.log('\n⚠️  No relationship found between this hunter and merchant');
      
      // Create one
      const newRel = await prisma.merchantHunterMerchant.create({
        data: {
          id: `rel_${Date.now()}`,
          merchantHunterId: hunter.id,
          merchantId: merchant.id,
          status: 'in_progress',
          updatedAt: new Date(),
        },
      });
      console.log('Created relationship:', newRel.id);
    } else {
      console.log('Relationship exists:', relationship.id);
    }
    
    // Now test creating an activity log
    console.log('\n--- Testing Activity Log Creation ---');
    const testLog = await prisma.merchantActivityLog.create({
      data: {
        id: `log_test_${Date.now()}`,
        merchantId: merchant.id,
        merchantHunterId: hunter.id,
        action: 'STATUS_UPDATE',
        description: 'Test log creation',
        performedByRole: 'MERCHANT_HUNTER',
        performedByIp: '127.0.0.1',
      },
    });
    
    console.log('✅ Activity log created:', testLog.id);
    
    // Verify it was saved
    const savedLog = await prisma.merchantActivityLog.findUnique({
      where: { id: testLog.id },
    });
    
    console.log('✅ Activity log verified in database:', savedLog.id);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();

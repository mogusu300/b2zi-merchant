const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Check if table exists
    const result = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'merchant_activity_logs'"
    );
    
    console.log('Table exists:', result.length > 0);
    if (result.length === 0) {
      console.log('\n❌ merchant_activity_logs table does NOT exist in database');
      console.log('\nYou need to run: npx prisma migrate dev --name add_merchant_activity_logs');
    } else {
      console.log('✅ merchant_activity_logs table found');
      
      // Get table columns
      const columns = await prisma.$queryRawUnsafe(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'merchant_activity_logs'"
      );
      console.log('\nTable columns:', columns);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();

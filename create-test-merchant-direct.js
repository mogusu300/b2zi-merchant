#!/usr/bin/env node

/**
 * DIRECT FIX: Create test merchant directly in database with proper relationship
 * This bypasses the API and tests if the frontend can fetch merchants
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Creating test merchant with relationship...\n');

    // Step 1: Create a test hunter if needed
    console.log('Step 1: Checking for test hunter...');
    let hunter = await prisma.merchantHunter.findFirst({
      where: { email: 'testhunter@example.com' }
    });

    if (!hunter) {
      console.log('  Creating test hunter...');
      hunter = await prisma.merchantHunter.create({
        data: {
          id: uuidv4(),
          email: 'testhunter@example.com',
          name: 'Test Hunter',
          phone: '+263700000000',
          password: 'hashedpassword', // In real app, this would be hashed
          type: 'HUNTER',
          status: 'active'
        }
      });
      console.log('  ✅ Hunter created:', hunter.id);
    } else {
      console.log('  ✅ Hunter exists:', hunter.id);
    }

    // Step 2: Create test merchant
    console.log('\nStep 2: Creating test merchant...');
    const merchant = await prisma.merchant.create({
      data: {
        id: uuidv4(),
        businessName: 'Test Store Direct ' + Date.now(),
        ownerName: 'Test Owner',
        email: 'test' + Date.now() + '@store.com',
        phone: '+263700000001',
        businessType: 'Retail',
        businessAddress: 'Test Address',
        password: 'hashedpassword',
        idType: 'nrc',
        status: 'active'
      }
    });
    console.log('  ✅ Merchant created:', merchant.id);
    console.log('     Business:', merchant.businessName);

    // Step 3: Create relationship
    console.log('\nStep 3: Creating merchant-hunter relationship...');
    const relationship = await prisma.merchantHunterMerchant.create({
      data: {
        id: uuidv4(),
        merchantHunterId: hunter.id,
        merchantId: merchant.id,
        status: 'not_started',
        onboardingStartedAt: new Date(),
        onboardingDaysElapsed: 0
      }
    });
    console.log('  ✅ Relationship created:', relationship.id);

    // Step 4: Create activity log
    console.log('\nStep 4: Creating activity log...');
    const log = await prisma.merchantActivityLog.create({
      data: {
        id: uuidv4(),
        merchantId: merchant.id,
        merchantHunterId: hunter.id,
        action: 'REGISTERED',
        description: 'Test merchant created directly',
        performedByRole: 'HUNTER'
      }
    });
    console.log('  ✅ Activity log created:', log.id);

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST MERCHANT CREATED SUCCESSFULLY\n');
    console.log('Hunter ID:', hunter.id);
    console.log('Merchant ID:', merchant.id);
    console.log('Merchant Name:', merchant.businessName);
    console.log('Merchant Email:', merchant.email);
    console.log('='.repeat(60));

    console.log('\n📋 NOW TEST THE API:\n');
    console.log('1. Open browser console (F12)');
    console.log('2. Paste this command:');
    console.log(`\nfetch('/api/v1/hunters/${hunter.id}/merchants').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))\n`);
    console.log('3. You should see your test merchant in the response');
    console.log('4. If you do, the API works and the frontend fetch is the issue');
    console.log('5. If you dont, the API filtering is broken\n');

    console.log('📋 TO TEST FROM FRONTEND:\n');
    console.log('Add this to browser console:');
    console.log(`\nconst hunterId = '${hunter.id}';\nfetch('/api/v1/hunters/me/merchants', { headers: { 'Authorization': 'Bearer ANY_TOKEN' } }).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nLikely causes:');
    console.error('1. Database not accessible (check DATABASE_URL in .env)');
    console.error('2. Tables not created (run: npx prisma migrate dev)');
    console.error('3. UUID package not installed (run: npm install uuid)');
  } finally {
    await prisma.$disconnect();
  }
}

main();

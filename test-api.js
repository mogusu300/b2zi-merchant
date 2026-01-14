#!/usr/bin/env node

/**
 * Test the authentication endpoints to identify where failures occur
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('\n========== TESTING AUTHENTICATION FLOW ==========\n');

    // 1. Test Customer Login
    console.log('1️⃣  Testing Customer Login API...');
    console.log('   POST ' + BASE_URL + '/api/customers/login');
    
    const customerLoginRes = await fetch(BASE_URL + '/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-customer@b2zi.com',
        password: 'TestPassword123'
      })
    });

    console.log('   Status:', customerLoginRes.status);
    const customerData = await customerLoginRes.json();
    console.log('   Response:', JSON.stringify(customerData, null, 2));

    if (customerLoginRes.ok) {
      console.log('   ✅ Customer login SUCCESS');
    } else {
      console.log('   ❌ Customer login FAILED');
    }

    // 2. Test Merchant Login
    console.log('\n2️⃣  Testing Merchant Login API...');
    console.log('   POST ' + BASE_URL + '/api/merchant/login');
    
    const merchantLoginRes = await fetch(BASE_URL + '/api/merchant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-merchant@b2zi.com',
        password: 'TestPassword123'
      })
    });

    console.log('   Status:', merchantLoginRes.status);
    const merchantData = await merchantLoginRes.json();
    console.log('   Response:', JSON.stringify(merchantData, null, 2));

    if (merchantLoginRes.ok) {
      console.log('   ✅ Merchant login SUCCESS');
    } else {
      console.log('   ❌ Merchant login FAILED');
    }

    // 3. Test wrong password
    console.log('\n3️⃣  Testing Customer Login with WRONG password...');
    const wrongPassRes = await fetch(BASE_URL + '/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-customer@b2zi.com',
        password: 'WrongPassword'
      })
    });

    console.log('   Status:', wrongPassRes.status);
    const wrongPassData = await wrongPassRes.json();
    console.log('   Response:', JSON.stringify(wrongPassData, null, 2));
    
    if (!wrongPassRes.ok) {
      console.log('   ✅ Correctly rejected wrong password');
    }

    console.log('\n✅ API testing complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(testAPI, 1000);

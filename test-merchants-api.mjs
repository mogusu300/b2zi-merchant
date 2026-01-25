const BASE_URL = 'http://localhost:5000';

async function testMerchantsAPI() {
  try {
    // First login
    console.log('🔐 Logging in hunter...');
    const loginRes = await fetch(`${BASE_URL}/api/v1/hunters/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Mogusu@gmail.com',
        password: 'Test@123456'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful, token:', token.slice(0, 20) + '...');

    // Now fetch merchants
    console.log('\n📦 Fetching merchants...');
    const merchantsRes = await fetch(`${BASE_URL}/api/v1/hunters/me/merchants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const merchantsData = await merchantsRes.json();
    console.log('Merchants Response:', JSON.stringify(merchantsData, null, 2));

    if (merchantsData.success && Array.isArray(merchantsData.data)) {
      console.log(`\n✅ Found ${merchantsData.data.length} merchants:`);
      merchantsData.data.forEach((m, i) => {
        const merchant = m.merchant || m;
        console.log(`  ${i+1}. ${merchant.businessName || merchant.name} - ${merchant.businessAddress || merchant.location}`);
      });
    } else {
      console.log('❌ No merchants found or error:', merchantsData);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testMerchantsAPI();

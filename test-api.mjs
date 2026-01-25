#!/usr/bin/env node

const BASE_URL = 'http://localhost:5000';

async function test() {
  console.log('Testing hunter login...\n');
  
  try {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/hunter/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Mogusu@gmail.com',
        password: 'Test@123456'
      })
    });

    console.log('Login Status:', loginRes.status);
    console.log('Login Headers:', loginRes.headers.get('content-type'));
    
    const loginText = await loginRes.text();
    console.log('Login Response (raw):', loginText.slice(0, 500));
    
    let loginData;
    try {
      loginData = JSON.parse(loginText);
      console.log('\n✅ Login parsed successfully');
      console.log('Success:', loginData.success);
      
      if (loginData.success) {
        const token = loginData.data.accessToken;
        console.log('Token received:', token.slice(0, 30) + '...\n');
        
        // Now test merchants endpoint
        console.log('Testing /api/v1/hunters/me/merchants...\n');
        
        const merchantsRes = await fetch(`${BASE_URL}/api/v1/hunters/me/merchants`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Merchants Status:', merchantsRes.status);
        console.log('Merchants Headers:', merchantsRes.headers.get('content-type'));
        
        const merchantsText = await merchantsRes.text();
        console.log('Merchants Response (first 500 chars):');
        console.log(merchantsText.slice(0, 500));
        
        try {
          const merchantsData = JSON.parse(merchantsText);
          console.log('\n✅ Merchants parsed successfully');
          console.log('Success:', merchantsData.success);
          console.log('Count:', merchantsData.count);
          console.log('Data length:', merchantsData.data?.length);
          if (merchantsData.data?.length > 0) {
            console.log('First merchant:', JSON.stringify(merchantsData.data[0], null, 2));
          }
        } catch (e) {
          console.error('\n❌ Failed to parse merchants response as JSON');
          console.error('Error:', e.message);
        }
      } else {
        console.error('Login failed:', loginData.error?.message);
      }
    } catch (e) {
      console.error('\n❌ Failed to parse login response as JSON');
      console.error('Error:', e.message);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();

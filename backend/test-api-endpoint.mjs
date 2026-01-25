/**
 * Test the actual API endpoint
 */

import jwt from 'jsonwebtoken';

// Create a test token for Mogusu@gmail.com (same as what the backend would create)
const testToken = jwt.sign(
  {
    id: 'cmkqpv5c60006k7ecakdiwhdh', // This is the hunter ID from database
    email: 'Mogusu@gmail.com',
    type: 'HUNTER',
  },
  'secret', // Using default secret if JWT_SECRET not in env
  { expiresIn: '1h' }
);

console.log('\n🔐 TEST TOKEN CREATED:');
console.log('Token:', testToken);
console.log('');

// Now test the API call
console.log('🌐 CALLING API ENDPOINT...\n');

const apiUrl = 'http://localhost:5000';
const endpoint = '/api/v1/hunters/me/merchants';

fetch(`${apiUrl}${endpoint}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json',
  },
})
.then(res => {
  console.log('Response Status:', res.status, res.statusText);
  console.log('Content-Type:', res.headers.get('content-type'));
  return res.text();
})
.then(text => {
  console.log('\nResponse Body:');
  console.log(text);
  
  // Try to parse as JSON
  try {
    const json = JSON.parse(text);
    console.log('\n✅ Parsed as JSON:');
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('\n❌ Could not parse as JSON');
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
});

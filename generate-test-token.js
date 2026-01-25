#!/usr/bin/env node

/**
 * Generate Test Hunter Token
 * Use this token in browser localStorage to test merchant registration
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Create a test hunter token
const hunterId = 'test-hunter-' + Date.now();

const token = jwt.sign(
  {
    id: hunterId,
    type: 'HUNTER',
    email: 'testhunter@example.com',
    name: 'Test Hunter'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('\n' + '='.repeat(70));
console.log('🎫 TEST HUNTER TOKEN');
console.log('='.repeat(70));
console.log('\nHunter ID:', hunterId);
console.log('\nToken:');
console.log(token);
console.log('\n' + '='.repeat(70));
console.log('📋 HOW TO USE:');
console.log('='.repeat(70));
console.log('\n1. Open your app in browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Paste this command:');
console.log('\nlocalStorage.setItem("hunterToken", ' + JSON.stringify(token) + ');');
console.log('localStorage.setItem("hunterData", JSON.stringify({id: ' + JSON.stringify(hunterId) + ', name: "Test Hunter"}));');
console.log('\n5. Refresh page (F5)');
console.log('6. You should see the dashboard');
console.log('7. Click "Onboard Merchant"');
console.log('8. Fill form and register');
console.log('9. Merchant should appear!');
console.log('10. Refresh (F5) - merchant should persist!');
console.log('\n' + '='.repeat(70));
console.log('🔑 TOKEN INFO:');
console.log('='.repeat(70));
console.log('\nThis token will work for:', hunterId);
console.log('Token expires in: 24 hours');
console.log('\n⚠️  This is for testing only!');
console.log('For production, use proper hunter login.\n');

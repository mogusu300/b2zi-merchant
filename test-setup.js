#!/usr/bin/env node

/**
 * Quick Setup Test
 * Verifies if merchant tracking system is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('✅ MERCHANT TRACKING SETUP TEST');
console.log('='.repeat(70));

// Test 1: Check backend exists
console.log('\n1️⃣  Checking backend code changes...');
const merchantsOnboardPath = path.join(__dirname, 'backend/src/routes/merchants.onboard.ts');

try {
  const content = fs.readFileSync(merchantsOnboardPath, 'utf8');
  
  const checks = [
    ['jwt token decoding', content.includes('jwt.decode')],
    ['relationship creation', content.includes('merchantHunterMerchant')],
    ['activity logging', content.includes('merchant_activity_logs')],
  ];
  
  let allPass = true;
  checks.forEach(([name, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  });
  
  if (!allPass) {
    console.log('\n   ⚠️  Backend changes might not be deployed!');
    console.log('   Code changes needed in: backend/src/routes/merchants.onboard.ts');
  }
} catch (err) {
  console.log('   ❌ Cannot find backend code');
}

// Test 2: Check frontend changes
console.log('\n2️⃣  Checking frontend code changes...');
const appPath = path.join(__dirname, 'fieldprohararemerchantonboardingportal (1)/App.tsx');

try {
  const content = fs.readFileSync(appPath, 'utf8');
  
  const checks = [
    ['API fetch added', content.includes('/api/v1/hunters/me/merchants')],
    ['console logging', content.includes('[APP]')],
  ];
  
  let allPass = true;
  checks.forEach(([name, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  });
} catch (err) {
  console.log('   ❌ Cannot find App.tsx');
}

const onboardFormPath = path.join(__dirname, 'fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx');

try {
  const content = fs.readFileSync(onboardFormPath, 'utf8');
  
  const checks = [
    ['hunterToken prop', content.includes('hunterToken')],
    ['console logging', content.includes('[PWA]')],
  ];
  
  let allPass = true;
  checks.forEach(([name, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  });
} catch (err) {
  console.log('   ❌ Cannot find OnboardingForm.tsx');
}

// Test 3: Check backend running
console.log('\n3️⃣  Checking if backend is running...');
(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/status', {
      timeout: 3000
    });
    console.log('   ✅ Backend is running at http://localhost:5000');
  } catch (err) {
    console.log('   ❌ Backend NOT running at http://localhost:5000');
    console.log('   Fix: cd backend && npm run dev');
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(70));
  console.log('\n1. Make sure backend is running:');
  console.log('   cd backend && npm run dev\n');
  console.log('2. Open your PWA app in browser');
  console.log('3. Press F12 to open DevTools');
  console.log('4. Go to Console tab');
  console.log('5. Register a test merchant');
  console.log('6. Watch for [APP] and [PWA] logs');
  console.log('7. Check if merchant appears AND persists on refresh\n');
  console.log('📖 For detailed debugging:');
  console.log('   - Read: DEBUG_STEP_BY_STEP.md');
  console.log('   - Read: EXPECTED_VS_ACTUAL.md\n');
  console.log('='.repeat(70));
})();

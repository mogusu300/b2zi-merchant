#!/usr/bin/env node

/**
 * Debug: Check Hunter Status & Merchant Relationships
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MERCHANT TRACKING DEBUG\n');

// Check if there's a hunterToken in localStorage simulation
console.log('📋 Frontend Setup:');
const appPath = path.join(__dirname, 'fieldprohararemerchantonboardingportal (1)/App.tsx');

try {
  const content = fs.readFileSync(appPath, 'utf8');
  
  // Check for hunterToken usage
  if (content.includes('hunterToken')) {
    console.log('✅ App.tsx has hunterToken');
  } else {
    console.log('❌ App.tsx missing hunterToken');
  }
  
  // Check if OnboardingForm receives token
  if (content.includes('hunterToken={hunterToken}')) {
    console.log('✅ App.tsx passes hunterToken to OnboardingForm');
  } else {
    console.log('❌ App.tsx NOT passing hunterToken to OnboardingForm');
  }
} catch (err) {
  console.log('❌ Could not read App.tsx');
}

// Check OnboardingForm
console.log('\n📋 OnboardingForm Setup:');
const formPath = path.join(__dirname, 'fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx');

try {
  const content = fs.readFileSync(formPath, 'utf8');
  
  if (content.includes('hunterToken')) {
    console.log('✅ OnboardingForm accepts hunterToken prop');
  } else {
    console.log('❌ OnboardingForm does NOT accept hunterToken prop');
  }
  
  if (content.includes('Authorization') && content.includes('Bearer')) {
    console.log('✅ OnboardingForm sends Authorization header');
  } else {
    console.log('❌ OnboardingForm NOT sending Authorization header');
  }
} catch (err) {
  console.log('❌ Could not read OnboardingForm.tsx');
}

// Check backend
console.log('\n📋 Backend Setup:');
const backendPath = path.join(__dirname, 'backend/src/routes/merchants.onboard.ts');

try {
  const content = fs.readFileSync(backendPath, 'utf8');
  
  if (content.includes('merchantHunterMerchant.create')) {
    console.log('✅ Backend creates merchantHunterMerchant relationship');
  } else {
    console.log('❌ Backend does NOT create relationship');
  }
  
  if (content.includes('decoded.type === \'HUNTER\'')) {
    console.log('✅ Backend checks token type');
  } else {
    console.log('❌ Backend does NOT check token type');
  }
} catch (err) {
  console.log('❌ Could not read merchants.onboard.ts');
}

console.log('\n📋 THE PROBLEM:\n');
console.log('Merchants are being created, but the hunter-merchant relationship is NOT being created.');
console.log('This happens when:');
console.log('  1. Hunter is NOT logged in (no valid hunterToken)');
console.log('  2. Token is invalid or expired');
console.log('  3. Token is not being passed to the registration form');
console.log('\n📋 THE SOLUTION:\n');
console.log('1. Make sure you are LOGGED IN as a hunter');
console.log('2. Your login should create a hunterToken');
console.log('3. Then register a merchant - the form should use that token');
console.log('4. The merchant will be linked to your hunter account');
console.log('\n📋 TO TEST:\n');
console.log('1. Go to the LOGIN page (not onboarding)');
console.log('2. Login with a hunter account');
console.log('3. Wait for dashboard to load');
console.log('4. THEN go to Onboard Merchant');
console.log('5. Register a merchant');
console.log('6. Check if merchant appears');
console.log('7. Refresh page - merchant should persist');
console.log('\n📋 IF STILL NOT WORKING:\n');
console.log('Check the browser console (F12) for:');
console.log('  [PWA] Token available: true (or false)')
console.log('\nIf it says FALSE, you are not logged in as a hunter!');
console.log('If it says TRUE, check the database for the relationship record.');

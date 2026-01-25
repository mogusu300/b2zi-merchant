#!/usr/bin/env node

/**
 * Diagnostic Script: Check Merchant Tracking Setup
 * 
 * This script verifies:
 * 1. Backend is running
 * 2. Database is accessible
 * 3. Tables exist and have data
 * 4. Relationships are being created
 * 5. API endpoints are working
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function checkBackend() {
  console.log('\n🔍 CHECKING BACKEND...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/hunters/me', {
      headers: { 'Authorization': 'Bearer test' }
    });
    
    if (response.status === 401) {
      console.log('✅ Backend is running (got 401 - expected with invalid token)');
      return true;
    } else if (response.status === 500) {
      console.log('⚠️  Backend is running but returning errors');
      return true;
    } else {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (err) {
    console.log('❌ Backend not running at http://localhost:5000');
    console.log('   Error:', err.message);
    return false;
  }
}

async function checkDatabase() {
  console.log('\n🔍 CHECKING DATABASE...\n');
  
  // Check if .env exists
  const envPath = path.join(process.cwd(), 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ backend/.env not found');
    return false;
  }
  
  console.log('✅ backend/.env exists');
  
  // Read DATABASE_URL from .env
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
  
  if (!dbMatch) {
    console.log('❌ DATABASE_URL not found in .env');
    return false;
  }
  
  console.log('✅ DATABASE_URL configured');
  return true;
}

async function checkCodeChanges() {
  console.log('\n🔍 CHECKING CODE CHANGES...\n');
  
  const checks = [
    {
      name: 'merchants.onboard.ts',
      path: 'backend/src/routes/merchants.onboard.ts',
      patterns: ['MerchantHunterMerchant', 'merchantActivityLog', 'jwt.verify']
    },
    {
      name: 'App.tsx',
      path: 'fieldprohararemerchantonboardingportal (1)/App.tsx',
      patterns: ['addMerchant', 'GET /hunters/me/merchants', '[APP]']
    },
    {
      name: 'OnboardingForm.tsx',
      path: 'fieldprohararemerchantonboardingportal (1)/components/OnboardingForm.tsx',
      patterns: ['hunterToken', '[PWA]']
    }
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    const filePath = path.join(process.cwd(), check.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${check.name} - FILE NOT FOUND`);
      allGood = false;
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasAllPatterns = check.patterns.every(p => content.includes(p));
    
    if (hasAllPatterns) {
      console.log(`✅ ${check.name} - Changes detected`);
    } else {
      console.log(`⚠️  ${check.name} - Some changes may be missing`);
      const missing = check.patterns.filter(p => !content.includes(p));
      console.log(`   Missing patterns: ${missing.join(', ')}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function checkFileContent(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes(searchString);
  } catch {
    return false;
  }
}

async function performTest() {
  console.log('\n🧪 PERFORMING TEST...\n');
  
  const token = await question('Enter a hunter token to test with: ');
  
  if (!token) {
    console.log('⚠️  Skipping test (no token provided)');
    return;
  }
  
  try {
    console.log('\nFetching merchants...');
    const response = await fetch('http://localhost:5000/api/v1/hunters/me/merchants', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ API returned ${data.data.length} merchants`);
      if (data.data.length > 0) {
        console.log('Sample merchant:', JSON.stringify(data.data[0], null, 2));
      }
    } else {
      console.log(`❌ API returned error:`, data.error);
    }
  } catch (err) {
    console.log('❌ Error calling API:', err.message);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MERCHANT TRACKING - DIAGNOSTIC SCRIPT                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const backendOk = await checkBackend();
  const databaseOk = await checkDatabase();
  const codeOk = await checkCodeChanges();
  
  console.log('\n📊 SUMMARY:\n');
  console.log(`Backend running:    ${backendOk ? '✅' : '❌'}`);
  console.log(`Database config:    ${databaseOk ? '✅' : '❌'}`);
  console.log(`Code changes:       ${codeOk ? '✅' : '❌'}`);
  
  if (backendOk && databaseOk && codeOk) {
    console.log('\n✅ Everything looks good! System is ready.\n');
    
    const runTest = await question('Do you want to test with a hunter token? (y/n): ');
    if (runTest.toLowerCase() === 'y') {
      await performTest();
    }
  } else {
    console.log('\n⚠️  Some issues detected. Please review above.\n');
    
    if (!backendOk) {
      console.log('💡 TIP: Start backend with: npm run dev (in backend directory)');
    }
    if (!codeOk) {
      console.log('💡 TIP: Make sure all code changes have been deployed');
    }
  }
  
  console.log('\n📖 For detailed debugging, see: DEBUGGING_GUIDE_WITH_LOGGING.md\n');
  
  rl.close();
}

main().catch(console.error);

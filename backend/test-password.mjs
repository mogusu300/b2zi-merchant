/**
 * Test password verification
 */

import bcrypt from 'bcryptjs';

async function test() {
  // Try different password variations
  const testPassword = 'Test@123456';  // Password the user said they used
  
  // These are the hashes from the database
  const hashes = [
    '$2b$12$OGobOjQqmJN4xKGJ7zKBfePV.p1xVrQw/sZF7k1vKUUvZ1zZZ0/VW', // Mogusukerini37@gmail.com
    '$2b$12$2fyZErcM5PZdPKM7MlXKJOMNT0I/fLqn.1kxT8rp7YnB5g5V7HQ.O', // mogusukerini7@gmail.com
    '$2b$12$PuwXadNVYb0Mw3cKwBhMkekzZHRz9hKvpJxY8UTi6xM9sZhVSKL7C', // Mogusu@gmail.com
  ];

  console.log('\n🔐 PASSWORD VERIFICATION TEST:');
  console.log('================================\n');
  console.log(`Testing password: "${testPassword}"\n`);

  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i];
    const isValid = await bcrypt.compare(testPassword, hash);
    console.log(`Hash ${i + 1}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`  Hash: ${hash.substring(0, 30)}...\n`);
  }

  // Also try some other common variations
  console.log('\n🔄 TESTING OTHER PASSWORD VARIATIONS:\n');
  const variations = [
    'Test@123456',
    'test@123456',
    'Test123456',
    'test123456',
    'Test@123456 ',
    ' Test@123456',
  ];

  for (const pwd of variations) {
    const result = await bcrypt.compare(pwd, hashes[0]);
    console.log(`"${pwd}": ${result ? '✅ VALID' : '❌ INVALID'}`);
  }
}

test().catch(console.error);

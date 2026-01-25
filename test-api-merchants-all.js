const fetch = require('node-fetch');

(async () => {
  try {
    console.log('Testing /api/merchants-all endpoint...\n');
    const response = await fetch('http://localhost:3000/api/merchants-all');
    const data = await response.json();
    
    console.log('✅ API Response:');
    console.log(`- Success: ${data.success}`);
    console.log(`- Total merchants: ${data.merchants.length}`);
    console.log(`- Merchants with logs:`);
    
    data.merchants.slice(0, 5).forEach(m => {
      console.log(`  - ${m.businessName}: ${m.activityLog.length} logs, status: ${m.merchantStatus}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();

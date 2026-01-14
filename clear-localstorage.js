// Script to clear mock data from localStorage
// This helps reset the app to a clean state for testing

const mockDataKeys = [
  'b2zi_user',
  'b2zi_merchant', 
  'b2zi_cart',
  'b2zi_preferences',
  'b2zi_favorites',
  'b2zi_search_history',
  'b2zi_viewed_products',
  'b2zi_activity',
  'auth-token-backup',
];

console.log('This script is for browser use only!');
console.log('Copy and paste this into your browser console at http://localhost:3000');
console.log('');
console.log(`
// Clear all localStorage data
${mockDataKeys.map(key => `localStorage.removeItem('${key}');`).join('\n')}

// Verify cleared
console.log('LocalStorage cleared!');
console.log('Keys remaining:', Object.keys(localStorage));

// Refresh page
location.reload();
`);

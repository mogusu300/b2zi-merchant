/**
 * Diagnostic script to check what merchants exist in database for your hunter
 * Run this from your browser console on the hunter dashboard
 */

(async () => {
  try {
    console.log('🔍 Checking merchants in database...\n')
    
    // Get token from localStorage
    const token = localStorage.getItem('hunterToken')
    const hunterData = localStorage.getItem('hunterData')
    
    console.log('📋 Current session info:')
    console.log('- Token exists?', !!token)
    console.log('- Token length:', token?.length)
    console.log('- Token starts with:', token?.slice(0, 30))
    console.log('- Hunter data:', hunterData)
    
    if (!token) {
      console.error('❌ No hunter token found in localStorage')
      return
    }
    
    // Try to decode the token
    try {
      const parts = token.split('.')
      const decoded = JSON.parse(atob(parts[1]))
      console.log('\n🔐 Token claims:')
      console.log('- ID:', decoded.id)
      console.log('- Email:', decoded.email)
      console.log('- Type:', decoded.type)
      console.log('- Expires:', new Date(decoded.exp * 1000).toISOString())
      console.log('- Is expired?', Math.floor(Date.now() / 1000) > decoded.exp)
    } catch (e) {
      console.error('Could not decode token:', e.message)
    }
    
    // Call the API
    const apiUrl = window.location.origin
    console.log('\n🌐 API call details:')
    console.log('- URL:', `${apiUrl}/api/v1/hunters/me/merchants`)
    console.log('- Method: GET')
    console.log('- Authorization header: Bearer [token]')
    
    const response = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('\n📊 API response:')
    console.log('- Status:', response.status, response.statusText)
    console.log('- Headers:', {
      'content-type': response.headers.get('content-type'),
      'x-powered-by': response.headers.get('x-powered-by')
    })
    
    const data = await response.json()
    console.log('- Response body:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.success) {
      console.log(`\n✅ SUCCESS: Found ${data.data?.length || 0} merchants`)
      if (data.data?.length > 0) {
        console.log('\n📦 Merchants:')
        data.data.forEach((item, idx) => {
          const m = item.merchant || item
          console.log(`${idx + 1}. ${m.businessName || m.name} (ID: ${m.id})`)
          console.log(`   - Owner: ${m.ownerName}`)
          console.log(`   - Status: ${m.status || item.onboardingStatus}`)
        })
      } else {
        console.warn('⚠️  No merchants found for this hunter!')
      }
    } else {
      console.error('❌ API error:', data.message || 'Unknown error')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
})()

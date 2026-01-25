'use client'

import { useEffect } from 'react'

export default function MerchantHunter() {
  useEffect(() => {
    // Redirect to index.html via the route handler
    window.location.href = '/merchanthunter/index.html'
  }, [])

  return <div style={{ padding: '20px' }}>Loading PWA...</div>
}

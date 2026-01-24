'use client'

import { useEffect, useState } from 'react'

export default function MerchantHunter() {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchPWA = async () => {
      try {
        const response = await fetch('/api/pwa-html')
        if (!response.ok) {
          throw new Error(`Failed to load PWA: ${response.status}`)
        }
        const htmlContent = await response.text()
        setHtml(htmlContent)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPWA()
  }, [])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading PWA...</div>
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

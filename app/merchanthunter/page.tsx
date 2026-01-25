'use client'

import { useEffect, useState } from 'react'

export default function MerchantHunterPage() {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHTML = async () => {
      try {
        const response = await fetch('/merchanthunter/index.html')
        let content = await response.text()
        
        // Rewrite asset paths
        content = content
          .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
          .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
          .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
          .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
        
        setHtml(content)
      } catch (error) {
        console.error('Failed to load PWA:', error)
        setHtml('<h1>Error loading PWA</h1>')
      } finally {
        setLoading(false)
      }
    }

    loadHTML()
  }, [])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

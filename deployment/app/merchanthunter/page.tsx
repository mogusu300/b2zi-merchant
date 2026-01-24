'use client'

import { useEffect, useState } from 'react'

export default function MerchantHunter() {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    // Fetch the PWA HTML and modify asset paths
    fetch('/merchanthunter/index.html')
      .then(res => res.text())
      .then(text => {
        // Rewrite asset paths to include /merchanthunter prefix
        const modified = text
          .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
          .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
          .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
          .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
          .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
          .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
        
        setHtml(modified)
      })
      .catch(err => console.error('Failed to load PWA:', err))
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

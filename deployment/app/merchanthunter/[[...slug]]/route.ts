import { readFileSync } from 'fs'
import { join } from 'path'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { slug?: string[] } }) {
  try {
    const slug = params.slug ? params.slug.join('/') : ''
    
    // Try to serve the requested file
    let filePath: string
    
    if (!slug || slug === '') {
      filePath = join(process.cwd(), 'public/merchanthunter/index.html')
    } else {
      // Try exact file first
      try {
        filePath = join(process.cwd(), `public/merchanthunter/${slug}`)
        readFileSync(filePath)
      } catch {
        // If not found and it's not a known asset, serve index.html (SPA routing)
        if (!slug.includes('.')) {
          filePath = join(process.cwd(), 'public/merchanthunter/index.html')
        } else {
          filePath = join(process.cwd(), `public/merchanthunter/${slug}`)
        }
      }
    }

    const file = readFileSync(filePath)
    
    // Set correct content type
    let contentType = 'application/octet-stream'
    if (filePath.endsWith('.html')) contentType = 'text/html'
    if (filePath.endsWith('.css')) contentType = 'text/css'
    if (filePath.endsWith('.js')) contentType = 'application/javascript'
    if (filePath.endsWith('.json')) contentType = 'application/json'
    if (filePath.endsWith('.png')) contentType = 'image/png'
    if (filePath.endsWith('.svg')) contentType = 'image/svg+xml'
    if (filePath.endsWith('.jpeg') || filePath.endsWith('.jpg')) contentType = 'image/jpeg'
    if (filePath.endsWith('.gif')) contentType = 'image/gif'
    if (filePath.endsWith('.webp')) contentType = 'image/webp'
    if (filePath.endsWith('.woff')) contentType = 'font/woff'
    if (filePath.endsWith('.woff2')) contentType = 'font/woff2'

    // For HTML, rewrite asset paths to include /merchanthunter prefix
    let content = file.toString()
    if (filePath.endsWith('.html')) {
      content = content
        .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
        .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
        .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
        .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
        .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
        .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000',
      },
    })
  } catch (error) {
    // Serve index.html for SPA routing
    try {
      const indexPath = join(process.cwd(), 'public/merchanthunter/index.html')
      let file = readFileSync(indexPath).toString()
      
      // Rewrite asset paths
      file = file
        .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
        .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
        .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
        .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
        .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
        .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      })
    } catch {
      return new NextResponse('404 - Not Found', { status: 404 })
    }
  }
}

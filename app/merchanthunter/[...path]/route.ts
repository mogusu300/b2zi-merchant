import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const pathArray = resolvedParams.path || []
    const filePath = pathArray.join('/')

    // For root path, serve the rewritten HTML
    if (!filePath || filePath === '' || filePath === 'index.html') {
      try {
        const htmlPath = join(process.cwd(), 'public', 'merchanthunter', 'index.html')
        let html = readFileSync(htmlPath, 'utf-8')
        
        // Rewrite asset paths from /assets/ to /merchanthunter/assets/
        html = html
          .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
          .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
          .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
          .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
        
        return new NextResponse(html, {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=3600, must-revalidate',
          },
        })
      } catch (err) {
        // Fallback if file reading fails
        console.error('Failed to read index.html:', err)
        return new NextResponse('<h1>Error loading PWA</h1>', { status: 500 })
      }
    }

    // For all other paths, return 404
    return NextResponse.json(
      { error: 'Not found', path: filePath },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

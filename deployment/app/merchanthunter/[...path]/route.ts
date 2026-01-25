import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    // Handle params that might be a promise in Next.js 15+
    const resolvedParams = await Promise.resolve(params)
    const pathArray = resolvedParams.path || []
    const filePath = pathArray.length === 0 ? 'index.html' : pathArray.join('/')
    const fullPath = join(process.cwd(), 'public', 'merchanthunter', filePath)

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Not found', path: filePath },
        { status: 404 }
      )
    }

    // Read the file
    const content = readFileSync(fullPath, 'utf-8')

    // Determine content type
    let contentType = 'text/plain'
    if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8'
    else if (filePath.endsWith('.js')) contentType = 'application/javascript'
    else if (filePath.endsWith('.css')) contentType = 'text/css'
    else if (filePath.endsWith('.json')) contentType = 'application/json'
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml'
    else if (filePath.endsWith('.png')) contentType = 'image/png'
    else if (filePath.endsWith('.jpg')) contentType = 'image/jpeg'

    // For HTML files, rewrite asset paths
    let responseContent = content
    if (filePath.endsWith('.html')) {
      responseContent = content
        .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
        .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
        .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
        .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
        .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
        .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
    }

    return new NextResponse(responseContent, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error serving PWA file:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

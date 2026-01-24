import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Fetch the PWA index.html from the public folder
    const baseUrl = new URL('/', request.url).origin
    const pwaBuildUrl = `${baseUrl}/merchanthunter/index.html`
    
    const response = await fetch(pwaBuildUrl)
    let html = await response.text()
    
    // Rewrite asset paths from /assets/ to /merchanthunter/assets/
    html = html
      .replace(/src="\/assets\//g, 'src="/merchanthunter/assets/')
      .replace(/href="\/assets\//g, 'href="/merchanthunter/assets/')
      .replace(/src="\/service-worker\.js/g, 'src="/merchanthunter/service-worker.js')
      .replace(/href="\/manifest\.json/g, 'href="/merchanthunter/manifest.json')
      .replace(/href="\/icon/g, 'href="/merchanthunter/icon')
      .replace(/href="\/apple-icon/g, 'href="/merchanthunter/apple-icon')
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load PWA', details: String(error) },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

// Hardcoded PWA HTML at build time - no filesystem access needed on Vercel
const pwaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
    <meta name="theme-color" content="#b1c98d">
    <meta name="description" content="Professional merchant onboarding and management platform.">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="b2zi">
    <link rel="manifest" href="/merchanthunter/manifest.json">
    <title>b2zi - Merchant Onboarding</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/merchanthunter/assets/index-CXvVwfMT.js"><\/script>
    <link rel="stylesheet" href="/merchanthunter/assets/index-DPVrGN2D.css">
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/merchanthunter/service-worker.js')
                .catch(e => console.log('SW registration failed:', e));
        }
    </script>
</body>
</html>`

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const pathArray = resolvedParams.path || []
    const filePath = pathArray.join('/')

    // For root path, serve the HTML
    if (!filePath || filePath === '' || filePath === 'index.html') {
      return new NextResponse(pwaHtml, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600, must-revalidate',
        },
      })
    }

    // For all other paths, return 404
    // (assets, manifest, service-worker should be served from public/)
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

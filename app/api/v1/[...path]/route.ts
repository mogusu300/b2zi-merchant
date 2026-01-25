import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy Route
 * Forwards all /api/v1/* requests to the Express backend
 */
export async function handler(req: NextRequest) {
  try {
    // Get the path segments
    const pathSegments = req.nextUrl.pathname.replace('/api/v1/', '')
    
    // Determine backend URL based on environment
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const proxyUrl = `${backendUrl}/api/v1/${pathSegments}`
    
    // Build query string if exists
    const queryString = req.nextUrl.search
    const fullUrl = `${proxyUrl}${queryString}`

    console.log(`[PROXY] ${req.method} ${fullUrl}`)

    // Prepare request body
    let body = null
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Check content type to handle different body types
      const contentType = req.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await req.json())
      } else if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass the form data directly
        body = await req.formData()
      } else {
        body = await req.text()
      }
    }

    // Prepare headers to forward
    const headers = new Headers()
    req.headers.forEach((value, key) => {
      // Skip headers that should not be forwarded
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.append(key, value)
      }
    })

    // Make request to backend
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: headers,
      body: body,
    })

    // Forward response
    const responseBody = await response.text()
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('[PROXY ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy error',
      },
      { status: 500 }
    )
  }
}

// Handle all HTTP methods
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const OPTIONS = handler

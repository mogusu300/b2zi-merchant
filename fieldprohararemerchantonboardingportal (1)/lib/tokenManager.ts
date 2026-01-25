/**
 * Token Manager - Handle token expiration and refresh
 * Automatically refreshes tokens before they expire
 */

interface TokenPayload {
  id: string
  email?: string
  type: string
  iat: number
  exp: number
}

/**
 * Decode JWT token without verification (safe for checking expiration client-side)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[TOKEN MANAGER] Invalid token format (not 3 parts)')
      return null
    }

    const decoded = JSON.parse(atob(parts[1]))
    console.log('[TOKEN MANAGER] Token decoded:', {
      id: decoded.id,
      type: decoded.type,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString(),
    })
    return decoded
  } catch (err) {
    console.error('[TOKEN MANAGER] Failed to decode token:', err)
    return null
  }
}

/**
 * Check if token is expired
 * Returns true if token is expired or within 5 minutes of expiration
 */
export function isTokenExpired(token: string | null, bufferMinutes: number = 5): boolean {
  if (!token) {
    console.log('[TOKEN MANAGER] No token provided')
    return true
  }

  const decoded = decodeToken(token)
  if (!decoded) {
    console.log('[TOKEN MANAGER] Could not decode token')
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  const bufferSeconds = bufferMinutes * 60
  const willExpire = decoded.exp - bufferSeconds

  if (now >= decoded.exp) {
    console.log('[TOKEN MANAGER] ❌ Token is EXPIRED')
    return true
  }

  if (now >= willExpire) {
    console.log('[TOKEN MANAGER] ⚠️  Token will expire soon (within', bufferMinutes, 'minutes)')
    return true
  }

  const minutesRemaining = (decoded.exp - now) / 60
  console.log('[TOKEN MANAGER] ✅ Token is valid for ~', Math.floor(minutesRemaining), 'more minutes')
  return false
}

/**
 * Refresh hunter access token using refresh token
 */
export async function refreshHunterToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  try {
    console.log('[TOKEN MANAGER] Attempting to refresh hunter token...')

    const apiUrl = (import.meta && import.meta.env && (import.meta.env.VITE_API_URL as string)) || window.location.origin
    
    const res = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[TOKEN MANAGER] ❌ Token refresh failed:', data.message || 'Unknown error')
      return null
    }

    if (data.success && data.data) {
      console.log('[TOKEN MANAGER] ✅ Token refreshed successfully')
      return {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      }
    }

    console.error('[TOKEN MANAGER] ❌ Unexpected refresh response:', data)
    return null
  } catch (err) {
    console.error('[TOKEN MANAGER] ❌ Token refresh error:', err)
    return null
  }
}

/**
 * Ensure hunter token is valid, refresh if necessary
 * Returns the valid token or null if refresh failed
 */
export async function ensureHunterTokenValid(): Promise<string | null> {
  const token = localStorage.getItem('hunterToken')
  const refreshToken = localStorage.getItem('hunterRefreshToken')

  if (!token) {
    console.log('[TOKEN MANAGER] No hunter token found')
    return null
  }

  if (!isTokenExpired(token, 5)) {
    console.log('[TOKEN MANAGER] Token is still valid')
    return token
  }

  if (!refreshToken) {
    console.error('[TOKEN MANAGER] ❌ Token expired but no refresh token available')
    // Clear invalid tokens
    localStorage.removeItem('hunterToken')
    localStorage.removeItem('hunterRefreshToken')
    return null
  }

  console.log('[TOKEN MANAGER] Token expired, attempting refresh...')
  const result = await refreshHunterToken(refreshToken)

  if (result) {
    // Update tokens in localStorage
    localStorage.setItem('hunterToken', result.accessToken)
    localStorage.setItem('hunterRefreshToken', result.refreshToken)
    console.log('[TOKEN MANAGER] ✅ Tokens updated in localStorage')
    return result.accessToken
  }

  // Refresh failed, clear tokens
  console.error('[TOKEN MANAGER] ❌ Could not refresh token, clearing stored tokens')
  localStorage.removeItem('hunterToken')
  localStorage.removeItem('hunterRefreshToken')
  localStorage.removeItem('hunterData')
  return null
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  type: 'merchant' | 'customer'
  name?: string
  businessName?: string
}

export interface AuthSession {
  createdAt: string
  expiresAt: string
  ipAddress: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.authenticated) {
        setIsAuthenticated(true)
        setUser(data.user)
        setSession(data.session)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string, type: 'merchant' | 'customer') => {
      try {
        const endpoint = type === 'merchant' 
          ? '/api/merchant/login' 
          : '/api/customers/login'

        console.log('[AUTH HOOK] Login attempt:', { email, type, endpoint })

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        console.log('[AUTH HOOK] Response status:', response.status)
        const data = await response.json()
        console.log('[AUTH HOOK] Response data:', data)

        if (!response.ok || !data.success) {
          const error = data.error || 'Login failed'
          console.error('[AUTH HOOK] Login failed:', error)
          throw new Error(error)
        }

        // Use user object from response (consistent structure)
        const userData: AuthUser = data.user || {
          id: type === 'merchant' ? data.merchant?.id : data.customer?.id,
          email: type === 'merchant' ? data.merchant?.email : data.customer?.email,
          type,
          ...(type === 'merchant' 
            ? { businessName: data.merchant?.businessName, name: data.merchant?.ownerName }
            : { name: data.customer?.name }
          ),
        }

        console.log('[AUTH HOOK] User data:', userData)

        setUser(userData)
        setIsAuthenticated(true)

        // Store token locally as backup (cookie is httpOnly)
        if (data.token) {
          localStorage.setItem('auth-token-backup', data.token)
          console.log('[AUTH HOOK] Token stored in localStorage')
        }

        console.log('[AUTH HOOK] ✅ Login successful!')
        return { success: true, user: userData }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        console.error('[AUTH HOOK] ❌ Login error:', message)
        return { success: false, error: message }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      const userType = user?.type || 'customer'
      console.log('[AUTH HOOK] 🔌 LOGOUT STARTING - User type:', userType)
      
      // Call logout API - don't wait for response, just fire and forget
      const logoutPromise = fetch(
        userType === 'merchant' 
          ? '/api/merchant/logout' 
          : '/api/customers/logout',
        { method: 'POST' }
      ).catch(() => {
        console.log('[AUTH HOOK] ⚠️ Logout API failed (continuing anyway)')
      })

      // Clear all React state IMMEDIATELY
      console.log('[AUTH HOOK] Clearing React state...')
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      
      // Clear all localStorage auth items IMMEDIATELY
      console.log('[AUTH HOOK] Clearing localStorage...')
      localStorage.removeItem('auth-token-backup')
      localStorage.removeItem('b2zi_merchant')
      localStorage.removeItem('b2zi_user')
      console.log('[AUTH HOOK] ✅ All state and localStorage cleared')

      // Redirect IMMEDIATELY using replace (not push)
      console.log('[AUTH HOOK] 🚀 REDIRECTING TO / with replace()...')
      router.replace('/')
      
      // Wait for API response in background
      await logoutPromise
      console.log('[AUTH HOOK] API response received')
    } catch (error) {
      console.error('[AUTH HOOK] ❌ Logout error:', error)
      // Force cleanup and redirect anyway
      localStorage.removeItem('auth-token-backup')
      localStorage.removeItem('b2zi_merchant')
      localStorage.removeItem('b2zi_user')
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      router.replace('/')
    }
  }, [user?.type, router])

  const register = useCallback(
    async (data: any, type: 'merchant' | 'customer') => {
      try {
        const endpoint = type === 'merchant' 
          ? '/api/register' 
          : '/api/customers/register'

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Registration failed')
        }

        return { success: true, message: result.message }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        return { success: false, error: message }
      }
    },
    []
  )

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    checkSession,
    login,
    logout,
    register,
  }
}

/**
 * Hook to protect routes - redirects if not authenticated
 */
export function useProtectedRoute(requiredType?: 'merchant' | 'customer') {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const redirectPath = requiredType === 'merchant' 
        ? '/sellers/login' 
        : '/customers/login'
      router.push(redirectPath)
      return
    }

    if (requiredType && user?.type !== requiredType) {
      const redirectPath = user?.type === 'merchant' 
        ? '/sellers/dashboard' 
        : '/marketplace'
      router.push(redirectPath)
    }
  }, [isLoading, isAuthenticated, user, requiredType, router])

  return { user, isLoading }
}

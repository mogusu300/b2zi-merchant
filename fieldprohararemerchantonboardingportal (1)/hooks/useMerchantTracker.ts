import { useState, useCallback } from 'react'

interface Merchant {
  merchantId: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  status: string
  [key: string]: any
}

interface Summary {
  total: number
  approved: number
  pending: number
  rejected: number
  totalMerchants: number
  onboarded: number
  inProgress: number
  notStarted: number
}

// Get API URL dynamically
const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000'
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const backendPort = "5000"
  return `${protocol}//${hostname}:${backendPort}`
}

export function useMerchantTracker(hunterId: string | null) {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summary: Summary = {
    total: merchants.length,
    approved: merchants.filter(m => m.status === 'approved' || m.status === 'Onboarded' || m.status === 'completed').length,
    pending: merchants.filter(m => m.status === 'pending' || m.status === 'Pending' || m.status === 'in_progress').length,
    rejected: merchants.filter(m => m.status === 'rejected' || m.status === 'Rejected').length,
    totalMerchants: merchants.length,
    onboarded: merchants.filter(m => m.status === 'approved' || m.status === 'Onboarded' || m.status === 'completed').length,
    inProgress: merchants.filter(m => m.status === 'pending' || m.status === 'Pending' || m.status === 'in_progress').length,
    notStarted: merchants.filter(m => m.status === 'not_started' || m.status === 'Not Started').length,
  }

  const refreshData = useCallback(async () => {
    if (!hunterId) return
    
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('hunterToken')
      
      if (!token) {
        setError('No authentication token found')
        return
      }

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        // Unauthorized - clear tokens and set error
        localStorage.removeItem('hunterToken')
        localStorage.removeItem('hunterRefreshToken')
        localStorage.removeItem('hunterData')
        setError('Session expired. Please log in again.')
        setMerchants([])
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch merchants')
      }

      const data = await response.json()
      setMerchants(Array.isArray(data) ? data : data.merchants || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setMerchants([])
    } finally {
      setLoading(false)
    }
  }, [hunterId])

  const fetchActivityLogs = useCallback(async (merchantId: string) => {
    try {
      const token = localStorage.getItem('hunterToken')
      if (!token) return []

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/v1/merchants/${merchantId}/activity-log`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem('hunterToken')
        localStorage.removeItem('hunterRefreshToken')
        localStorage.removeItem('hunterData')
        return []
      }

      if (!response.ok) return []
      const data = await response.json()
      return Array.isArray(data) ? data : data.logs || []
    } catch (err) {
      console.error('Failed to fetch activity logs:', err)
      return []
    }
  }, [])

  const updateMerchantStatus = useCallback(async (merchantId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('hunterToken')
      if (!token) return false

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/v1/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) return false
      
      // Update local state
      setMerchants(merchants.map(m => 
        m.merchantId === merchantId ? { ...m, status: newStatus } : m
      ))
      return true
    } catch (err) {
      console.error('Failed to update merchant status:', err)
      return false
    }
  }, [merchants])

  return {
    merchants,
    summary,
    loading,
    error,
    refreshData,
    fetchActivityLogs,
    updateMerchantStatus,
  }
}

/**
 * Example page showing how to integrate the merchant tracking system
 * This demonstrates how to use the DashboardLive component with real data
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLive from '../fieldprohararemerchantonboardingportal (1)/components/DashboardLive'

export default function MerchantDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated' && isMounted) {
      router.push('/login')
    }
  }, [status, isMounted, router])

  if (status === 'loading' || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Merchant Onboarding Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage merchant onboarding for your region
          </p>
        </div>

        {/* Session Info */}
        {session?.user && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Logged in as:</strong> {session.user.name || session.user.email}
            </p>
            {/* @ts-ignore */}
            {session.user.id && (
              <p className="text-xs text-blue-600 mt-1">
                {/* @ts-ignore */}
                Hunter ID: {session.user.id}
              </p>
            )}
          </div>
        )}

        {/* Dashboard Component - Pass the Hunter ID */}
        {/* @ts-ignore */}
        <DashboardLive hunterId={session?.user?.id} />
      </div>
    </div>
  )
}

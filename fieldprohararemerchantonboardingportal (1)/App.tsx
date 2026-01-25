"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LayoutDashboard, MapPin, ClipboardList, UserPlus, Search, Bell, Menu, Store } from "lucide-react"
import DashboardLive from "./components/DashboardLive"
import MerchantList from "./components/MerchantList"
import OnboardingForm from "./components/OnboardingForm"
import Sidebar from "./components/Sidebar"
import { HunterLogin } from "./components/HunterLogin"
import { HunterRegister } from "./components/HunterRegister"
import { MerchantLogin } from "./components/MerchantLogin"
import { MerchantPortal } from "./components/MerchantPortal"
import { PWAInstallPrompt } from "./components/PWAInstallPrompt"
import { ensureHunterTokenValid, isTokenExpired } from "./lib/tokenManager"
import type { Merchant } from "./types"

type AppMode = "hunter" | "hunter-login" | "hunter-register" | "merchant-login" | "merchant-portal"

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>("hunter-login")
  const [hunterToken, setHunterToken] = useState<string | null>(null)
  const [hunterData, setHunterData] = useState<any>(null)
  const [merchantToken, setMerchantToken] = useState<string | null>(null)
  const [merchantData, setMerchantData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"dashboard" | "merchants" | "onboard" | "analytics" | "targets">("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previousTab, setPreviousTab] = useState<"dashboard" | "merchants" | "onboard" | "analytics" | "targets">("dashboard")

  // Get API URL dynamically based on current host
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL as string
    }
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const backendPort = "5000"
    return `${protocol}//${hostname}:${backendPort}`
  }

  // Check for stored merchant session
  useEffect(() => {
    console.log('[APP init-effect] Starting initialization...')
    
    // Restore sessions from localStorage first
    const storedHunterToken = localStorage.getItem('hunterToken')
    const storedHunterData = localStorage.getItem('hunterData')
    console.log('[APP init-effect] Found hunterToken in localStorage?', !!storedHunterToken)
    
    if (storedHunterToken && storedHunterData) {
      console.log('[APP] Hunter token restored from localStorage - token length:', storedHunterToken.length)
      setHunterToken(storedHunterToken)
      setHunterData(JSON.parse(storedHunterData))
      setAppMode('hunter')
      setIsInitialized(true)
      return
    }

    const storedToken = localStorage.getItem('merchantToken')
    const storedData = localStorage.getItem('merchantData')
    if (storedToken && storedData) {
      console.log('[APP] Merchant token restored from localStorage')
      setMerchantToken(storedToken)
      setMerchantData(JSON.parse(storedData))
      setAppMode('merchant-portal')
      setIsInitialized(true)
      return
    }

    // Check URL path to determine which login page
    const pathname = window.location.pathname || '/'
    console.log('[APP init-effect] Current pathname:', pathname)
    if (pathname.startsWith('/hunter/register')) {
      setAppMode('hunter-register')
    } else if (pathname.startsWith('/merchant/login')) {
      setAppMode('merchant-login')
    } else {
      // Default to hunter login
      console.log('[APP] No tokens found, requiring login')
      setAppMode('hunter-login')
    }
    
    // expose logout for legacy callers inside sidebar
    try { (window as any).handleHunterLogout = handleHunterLogout } catch {}
    
    // Mark initialization complete
    console.log('[APP init-effect] Initialization complete')
    setIsInitialized(true)
  }, [])

  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [merchantsLoading, setMerchantsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleMerchantLoginSuccess = (token: string, merchant: any) => {
    setMerchantToken(token)
    setMerchantData(merchant)
    setAppMode("merchant-portal")
  }

  const handleHunterLoginSuccess = (token: string, hunter: any) => {
    setHunterToken(token)
    setHunterData(hunter)
    localStorage.setItem("hunterToken", token)
    if ((hunter as any).refreshToken) localStorage.setItem("hunterRefreshToken", (hunter as any).refreshToken)
    localStorage.setItem("hunterData", JSON.stringify(hunter))
    setAppMode("hunter")
  }

  const handleHunterLogout = () => {
    localStorage.removeItem("hunterToken")
    localStorage.removeItem("hunterRefreshToken")
    localStorage.removeItem("hunterData")
    setHunterToken(null)
    setHunterData(null)
    setAppMode("hunter-login")
  }

  // Fetch hunter's merchants when hunter logs in or page loads with existing token
  useEffect(() => {
    console.log('[APP merchants-fetch-effect] Running... hunterToken=', hunterToken?.slice(0, 20), 'appMode=', appMode)
    
    // Only fetch if we're in hunter mode and have a token
    if (appMode !== 'hunter' || !hunterToken) {
      console.log('[APP useEffect] Skipping fetch - appMode:', appMode, 'hasToken:', !!hunterToken)
      return
    }
    
    const fetchMerchants = async () => {
      console.log('[APP useEffect] Fetching merchants for hunter:', hunterToken.slice(0, 20) + '...')
      setMerchantsLoading(true)
      try {
        let token = hunterToken
        
        // CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
        if (isTokenExpired(token, 5)) {
          console.log('[APP useEffect] ⚠️  Token expired or expiring soon, attempting refresh...')
          const validToken = await ensureHunterTokenValid()
          if (validToken) {
            token = validToken
            console.log('[APP useEffect] ✅ Token refreshed successfully')
          } else {
            console.error('[APP useEffect] ❌ Token refresh failed - clearing session')
            handleHunterLogout()
            return
          }
        }
        
        const apiUrl = getApiUrl()
        console.log('[APP useEffect] API URL:', apiUrl)
        
        const res = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        console.log('[APP useEffect] Response status:', res.status)
        console.log('[APP useEffect] Response headers:', res.headers.get('content-type'))
        
        const responseText = await res.text()
        console.log('[APP useEffect] Response text (first 500 chars):', responseText.slice(0, 500))
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseErr) {
          console.error('[APP useEffect] Failed to parse JSON, raw response:', responseText)
          throw new Error(`API returned non-JSON response: ${responseText.slice(0, 100)}...`)
        }
        
        console.log('[APP useEffect] Response:', JSON.stringify(data, null, 2))
        
        if (data?.success && Array.isArray(data.data)) {
          console.log('[APP useEffect] Got', data.data.length, 'merchants from API')
          const mapped: Merchant[] = data.data.map((mhm: any) => {
            const merchant = mhm.merchant || mhm
            return {
              id: merchant.id,
              name: merchant.businessName || merchant.name || merchant.business_name || 'Merchant',
              owner: merchant.ownerName || merchant.owner || merchant.owner_name || '',
              location: merchant.businessAddress || merchant.location || '',
              status: (merchant.status || mhm.onboardingStatus || merchant.onboardingStatus || 'pending')
                .toString()
                .toLowerCase() === 'approved' || (merchant.status || mhm.onboardingStatus || '').toString().toLowerCase() === 'onboarded'
                ? 'Onboarded'
                : 'Pending',
              category: merchant.category?.name || merchant.category || '',
              dateAdded: merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : (merchant.dateAdded || ''),
            }
          })
          console.log('[APP useEffect] Setting merchants to:', mapped)
          setMerchants(mapped)
        } else {
          console.warn('[APP useEffect] Unexpected response format:', data)
          setMerchants([])
        }
      } catch (err) {
        console.error('[APP useEffect] Failed to load hunter merchants', err)
        console.error('[APP useEffect] Error details:', (err as any).message, (err as any).stack)
        setMerchants([])
      } finally {
        setMerchantsLoading(false)
        console.log('[APP useEffect] Fetch complete')
      }
    }

    fetchMerchants()
  }, [hunterToken, appMode])

  const handleMerchantLogout = () => {
    localStorage.removeItem("merchantToken")
    localStorage.removeItem("merchantData")
    localStorage.removeItem("refreshToken")
    setMerchantToken(null)
    setMerchantData(null)
    setAppMode("hunter")
  }

  // Merchant login view
  if (appMode === "merchant-login") {
    return (
      <MerchantLogin
        onBack={() => setAppMode("hunter")}
        onLoginSuccess={handleMerchantLoginSuccess}
      />
    )
  }

  // Hunter login view
  if (appMode === "hunter-login") {
    return (
      <HunterLogin
        onBack={() => setAppMode("hunter")}
        onLoginSuccess={handleHunterLoginSuccess}
        onShowRegister={() => setAppMode("hunter-register")}
      />
    )
  }

  // Hunter register view
  if (appMode === "hunter-register") {
    return (
      <HunterRegister
        onBack={() => setAppMode("hunter-login")}
        onRegisterSuccess={handleHunterLoginSuccess}
      />
    )
  }

  // Merchant portal view
  if (appMode === "merchant-portal" && merchantToken && merchantData) {
    return (
      <MerchantPortal
        merchantToken={merchantToken}
        merchantData={merchantData}
        onLogout={handleMerchantLogout}
      />
    )
  }

  const addMerchant = (newMerchant: Merchant) => {
    console.log('[APP] addMerchant called with:', newMerchant)
    
    // Refresh the merchants list from API to ensure we get the persisted data with hunter-merchant link
    setMerchantsLoading(true)
    console.log('[APP] Set loading to true, starting API fetch...')
    
    const fetchMerchants = async () => {
      if (!hunterToken) {
        console.error('[APP] ERROR: No hunterToken available!')
        setMerchants([newMerchant])
        setMerchantsLoading(false)
        return
      }
      
      try {
        const apiUrl = getApiUrl()
        console.log('[APP] Fetching from:', `${apiUrl}/api/v1/hunters/me/merchants`)
        console.log('[APP] Using token:', hunterToken.slice(0, 20) + '...')
        
        const res = await fetch(`${apiUrl}/api/v1/hunters/me/merchants`, {
          headers: {
            Authorization: `Bearer ${hunterToken}`,
          },
        })
        
        console.log('[APP] Response status:', res.status)
        const data = await res.json()
        console.log('[APP] Response data:', JSON.stringify(data, null, 2))
        
        if (data?.success && Array.isArray(data.data)) {
          console.log('[APP] API returned', data.data.length, 'merchants')
          const mapped: Merchant[] = data.data.map((mhm: any) => {
            const merchant = mhm.merchant || mhm
            const mapped = {
              id: merchant.id,
              name: merchant.businessName || merchant.name || merchant.business_name || 'Merchant',
              owner: merchant.ownerName || merchant.owner || merchant.owner_name || '',
              location: merchant.businessAddress || merchant.location || '',
              status: (merchant.status || mhm.onboardingStatus || merchant.onboardingStatus || 'pending')
                .toString()
                .toLowerCase() === 'approved' || (merchant.status || mhm.onboardingStatus || '').toString().toLowerCase() === 'onboarded'
                ? 'Onboarded'
                : 'Pending',
              category: merchant.category?.name || merchant.category || '',
              dateAdded: merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : (merchant.dateAdded || ''),
            }
            console.log('[APP] Mapped merchant:', mapped)
            return mapped
          })
          console.log('[APP] Final mapped merchants:', mapped)
          setMerchants(mapped)
          console.log('[APP] State updated with', mapped.length, 'merchants')
        } else {
          console.warn('[APP] API response not in expected format:', data)
          setMerchants([])
        }
      } catch (err) {
        console.error('[APP] ERROR fetching merchants:', err)
        console.error('[APP] Error details:', (err as any).message)
        console.warn('[APP] Falling back to local merchant:', newMerchant)
        setMerchants([newMerchant])
      } finally {
        setMerchantsLoading(false)
        console.log('[APP] Fetch complete, loading set to false')
      }
    }
    
    fetchMerchants()
    setActiveTab("merchants")
    console.log('[APP] Active tab set to merchants')
  }

  const handleTabChange = (tab: "dashboard" | "merchants" | "onboard" | "activities" | "analytics" | "targets") => {
    // If we're not in hunter mode, don't allow tab changes (stay on login)
    if (appMode !== 'hunter') {
      console.log('[handleTabChange] Not in hunter mode, ignoring tab change request')
      return
    }

    setPreviousTab(activeTab)
    setIsLoading(true)
    setTimeout(() => {
      setActiveTab(tab)
      setIsLoading(false)
    }, 300)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardLive merchants={merchants} />
      case "merchants":
        return <MerchantList merchants={merchants} loading={merchantsLoading} />
      case "onboard":
        return <OnboardingForm onSubmit={addMerchant} hunterToken={hunterToken} />
      case "analytics":
      case "targets":
        return <DashboardLive merchants={merchants} />
      default:
        return <DashboardLive merchants={merchants} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* PWA Install Prompt - Disabled in development (only works on production HTTPS) */}
      {/* <PWAInstallPrompt /> */}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleHunterLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30 animate-slide-in-down shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-md">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-custom-olive flex items-center gap-2">
              <span className="hidden sm:inline">FieldPro</span> Harare
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search CBD Merchants..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-custom-sage outline-none w-64 transition-all"
              />
            </div>
            {hunterToken && (
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            )}
            
            {!hunterToken && !merchantToken && (
              <>
                <button
                  onClick={() => setAppMode("merchant-login")}
                  className="hidden sm:flex px-4 py-2 text-sm font-semibold text-custom-olive border border-custom-olive rounded-lg hover:bg-custom-olive/5 transition-colors"
                >
                  Merchant Login
                </button>
                <button
                  onClick={() => setAppMode("hunter-login")}
                  className="hidden sm:flex px-4 py-2 text-sm font-semibold text-custom-olive border border-custom-olive rounded-lg hover:bg-custom-olive/5 transition-colors"
                >
                  Hunter Login
                </button>
              </>
            )}
            
            {hunterToken && (
              <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                <div className="w-8 h-8 rounded-full bg-custom-sage flex items-center justify-center text-white font-bold">
                  {hunterData ? `${(hunterData.firstName || '').charAt(0)}${(hunterData.lastName || '').charAt(0)}` : 'MK'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold">{hunterData ? `${hunterData.firstName} ${hunterData.lastName}` : "Unknown"}</p>
                  <p className="text-[10px] text-gray-500">Hunter</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 ${isLoading ? "opacity-50" : "opacity-100 animate-fade-in"} transition-opacity duration-300`}
        >
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>

        {/* Mobile Persistent Nav - Fixed at Bottom */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-2 shadow-lg shadow-black/5 z-40">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-2 rounded-2xl transition-all ${
              activeTab === "dashboard"
                ? "text-custom-olive bg-custom-olive/10 scale-105"
                : "text-gray-400 active:bg-gray-100 active:scale-95"
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[11px] font-bold">Home</span>
          </button>
          <button
            onClick={() => handleTabChange("merchants")}
            className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-2 rounded-2xl transition-all ${
              activeTab === "merchants"
                ? "text-custom-olive bg-custom-olive/10 scale-105"
                : "text-gray-400 active:bg-gray-100 active:scale-95"
            }`}
          >
            <Store size={24} />
            <span className="text-[11px] font-bold">Merchants</span>
          </button>
          <button
            onClick={() => handleTabChange("onboard")}
            className={`flex flex-col items-center justify-center w-14 h-14 ${
              activeTab === "onboard"
                ? "bg-custom-olive text-white shadow-lg shadow-custom-olive/50 scale-110"
                : "bg-custom-olive text-white shadow-lg shadow-custom-olive/40 active:scale-90"
            } rounded-full -mt-8 transition-all`}
          >
            <UserPlus size={24} />
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 rounded-2xl text-gray-400 active:bg-gray-100 active:scale-95 transition-all">
            <MapPin size={24} />
            <span className="text-[11px] font-bold">Map</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 rounded-2xl text-gray-400 active:bg-gray-100 active:scale-95 transition-all">
            <ClipboardList size={24} />
            <span className="text-[11px] font-bold">Leads</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App

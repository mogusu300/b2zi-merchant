"use client"

import React, { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.navigator.standalone === true) {
      console.log('Already installed (standalone mode)')
      setIsInstalled(true)
      return
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Already installed (display-mode standalone)')
      setIsInstalled(true)
      return
    }

    // Check if user dismissed the banner
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    console.log('PWA Install - isDismissed:', isDismissed)
    
    if (isDismissed) {
      console.log('User dismissed banner before, not showing')
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      setShowBanner(true)
    }

    const handleAppInstalled = () => {
      console.log('App installed event fired')
      setShowBanner(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-install-dismissed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show banner after 2 seconds even if no beforeinstallprompt
    const timer = setTimeout(() => {
      console.log('2 second timeout reached, showing banner anyway')
      setShowBanner(true)
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    console.log('Install button clicked. Has deferredPrompt:', !!deferredPrompt)
    
    if (deferredPrompt) {
      try {
        console.log('Calling deferredPrompt.prompt()')
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log('User chose:', outcome)
        
        if (outcome === 'accepted') {
          setShowBanner(false)
          setIsInstalled(true)
          setShowInstructions(false)
          localStorage.setItem('pwa-install-dismissed', 'true')
        }
        setDeferredPrompt(null)
      } catch (error) {
        console.error('Error calling native install prompt:', error)
        setShowInstructions(true)
      }
    } else {
      // No native prompt available, show custom instructions
      console.log('No deferredPrompt available, showing custom instructions')
      setShowInstructions(true)
    }
  }

  const handleDismiss = () => {
    console.log('Dismiss button clicked')
    setShowBanner(false)
    setShowInstructions(false)
    setDeferredPrompt(null)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't render if already installed
  if (isInstalled) {
    return null
  }

  // Show custom instructions modal
  if (showInstructions) {
    const isAndroid = /android/i.test(navigator.userAgent)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

    console.log('Rendering instructions modal. isAndroid:', isAndroid, 'isIOS:', isIOS)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 safe-inset">
        <div className="bg-[#2e3621] border border-[#b1c98d]/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2e3621] to-[#3a4428] px-6 py-4 border-b border-[#b1c98d]/20 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Install b2zi</h2>
              <p className="text-[#b1c98d]/70 text-xs">Add to your home screen</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[#b1c98d]/70 hover:text-[#b1c98d]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Instructions Content */}
          <div className="px-6 py-6 space-y-4">
            {isAndroid ? (
              <>
                <p className="text-[#b1c98d] font-semibold">Android Installation:</p>
                <ol className="text-[#b1c98d]/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Tap the menu icon (⋮) in the top-right corner</li>
                  <li>Select "Install app"</li>
                  <li>Tap "Install" to confirm</li>
                </ol>
              </>
            ) : isIOS ? (
              <>
                <p className="text-[#b1c98d] font-semibold">iPhone/iPad Installation:</p>
                <ol className="text-[#b1c98d]/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Tap the Share button (arrow up from bottom)</li>
                  <li>Scroll down and select "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </>
            ) : (
              <>
                <p className="text-[#b1c98d] font-semibold">Desktop Installation:</p>
                <p className="text-[#b1c98d]/80 text-sm">
                  Use your phone to visit this site and follow the Android or iPhone instructions above.
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="px-6 py-4 border-t border-[#b1c98d]/20 flex gap-3">
            <button
              onClick={() => setShowInstructions(false)}
              className="flex-1 bg-[#b1c98d]/20 hover:bg-[#b1c98d]/30 text-[#b1c98d] px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Got it
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-[#2e3621] hover:bg-[#3a4428] text-[#b1c98d]/70 hover:text-[#b1c98d] px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-[#b1c98d]/20"
            >
              Don't ask
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show install banner
  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#2e3621] to-[#3a4428] border-b border-[#b1c98d]/20 backdrop-blur-lg safe-top">
      <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#b1c98d] rounded-xl flex items-center justify-center font-bold text-[#2e3621] text-sm">
              b2
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">b2zi</p>
            <p className="text-[#b1c98d]/70 text-xs truncate">Install as native app</p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="flex items-center gap-2 bg-[#b1c98d] hover:bg-[#c8daa5] text-[#2e3621] px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0 transition-colors active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Download size={16} />
          Install
        </button>

        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[#b1c98d]/70 hover:text-[#b1c98d] flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { sessionStorage, UserSession } from '@/lib/session-storage'

// Hook for user session
export const useUserSession = () => {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(sessionStorage.getUser())
    setLoading(false)
  }, [])

  const setUserSession = useCallback((userData: UserSession) => {
    sessionStorage.setUser(userData)
    setUser(userData)
  }, [])

  const clearUserSession = useCallback(() => {
    sessionStorage.clearUser()
    setUser(null)
  }, [])

  return {
    user,
    loading,
    setUserSession,
    clearUserSession,
    isLoggedIn: !!user,
  }
}

// Hook for merchant session
export const useMerchantSession = () => {
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMerchant(sessionStorage.getMerchant())
    setLoading(false)
  }, [])

  const setMerchantSession = useCallback((merchantData: any) => {
    sessionStorage.setMerchant(merchantData)
    setMerchant(merchantData)
  }, [])

  const clearMerchantSession = useCallback(() => {
    sessionStorage.clearMerchant()
    setMerchant(null)
  }, [])

  return {
    merchant,
    loading,
    setMerchantSession,
    clearMerchantSession,
    isLoggedIn: !!merchant,
  }
}

// Hook for marketplace preferences
export const useMarketplacePreferences = () => {
  const [preferences, setPreferencesState] = useState({
    selectedCategory: '',
    sortBy: 'newest' as 'price-low' | 'price-high' | 'newest' | 'rating',
    viewMode: 'grid' as 'grid' | 'list',
    itemsPerPage: 12,
  })

  useEffect(() => {
    const saved = sessionStorage.getPreferences()
    if (saved) {
      setPreferencesState(saved)
    }
  }, [])

  const updatePreferences = useCallback((updates: any) => {
    sessionStorage.setPreferences(updates)
    setPreferencesState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    preferences,
    updatePreferences,
    selectedCategory: preferences.selectedCategory,
    sortBy: preferences.sortBy,
    viewMode: preferences.viewMode,
    itemsPerPage: preferences.itemsPerPage,
  }
}

// Hook for favorites/wishlist
export const useFavorites = () => {
  const [favorites, setFavoritesState] = useState<string[]>([])

  useEffect(() => {
    setFavoritesState(sessionStorage.getFavorites())
  }, [])

  const addFavorite = useCallback((productId: string) => {
    sessionStorage.addFavorite(productId)
    setFavoritesState(prev => [...prev, productId])
  }, [])

  const removeFavorite = useCallback((productId: string) => {
    sessionStorage.removeFavorite(productId)
    setFavoritesState(prev => prev.filter(id => id !== productId))
  }, [])

  const toggleFavorite = useCallback((productId: string) => {
    if (sessionStorage.isFavorite(productId)) {
      removeFavorite(productId)
    } else {
      addFavorite(productId)
    }
  }, [addFavorite, removeFavorite])

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId)
  }, [favorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    count: favorites.length,
  }
}

// Hook for search history
export const useSearchHistory = () => {
  const [history, setHistoryState] = useState<string[]>([])

  useEffect(() => {
    setHistoryState(sessionStorage.getSearchHistory())
  }, [])

  const addQuery = useCallback((query: string) => {
    sessionStorage.addSearchQuery(query)
    setHistoryState(sessionStorage.getSearchHistory())
  }, [])

  const clearHistory = useCallback(() => {
    sessionStorage.clearSearchHistory()
    setHistoryState([])
  }, [])

  return {
    history,
    addQuery,
    clearHistory,
  }
}

// Hook for viewed products
export const useViewedProducts = () => {
  const [viewed, setViewedState] = useState<Array<{ id: string; name: string; viewedAt: string }>>([])

  useEffect(() => {
    setViewedState(sessionStorage.getViewedProducts())
  }, [])

  const addViewed = useCallback((productId: string, productName: string) => {
    sessionStorage.addViewedProduct(productId, productName)
    setViewedState(sessionStorage.getViewedProducts())
  }, [])

  return {
    viewed,
    addViewed,
    count: viewed.length,
  }
}

// Hook for activity tracking
export const useActivityTracking = () => {
  const [activity, setActivityState] = useState<Array<{ action: string; details?: any; timestamp: string }>>([])

  const track = useCallback((action: string, details?: any) => {
    sessionStorage.trackActivity(action, details)
    setActivityState(sessionStorage.getActivity())
  }, [])

  const getActivity = useCallback(() => {
    return sessionStorage.getActivity()
  }, [])

  return {
    activity,
    track,
    getActivity,
  }
}

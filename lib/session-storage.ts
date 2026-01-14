// Session storage utilities for marketplace
// Handles all user session data persistence

const SESSION_KEYS = {
  USER: 'b2zi_user',
  MERCHANT: 'b2zi_merchant',
  CART: 'b2zi_cart',
  PREFERENCES: 'b2zi_preferences',
  FAVORITES: 'b2zi_favorites',
  SEARCH_HISTORY: 'b2zi_search_history',
  VIEWED_PRODUCTS: 'b2zi_viewed_products',
  ACTIVITY: 'b2zi_activity',
} as const

// User Session
export interface UserSession {
  id: string
  email: string
  name: string
  loginTime: string
}

export const sessionStorage = {
  // User Session
  setUser: (user: UserSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user))
    }
  },

  getUser: (): UserSession | null => {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem(SESSION_KEYS.USER)
    return user ? JSON.parse(user) : null
  },

  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEYS.USER)
    }
  },

  // Merchant Session
  setMerchant: (merchant: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEYS.MERCHANT, JSON.stringify(merchant))
    }
  },

  getMerchant: () => {
    if (typeof window === 'undefined') return null
    const merchant = localStorage.getItem(SESSION_KEYS.MERCHANT)
    return merchant ? JSON.parse(merchant) : null
  },

  clearMerchant: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEYS.MERCHANT)
    }
  },

  // Preferences (filters, sorting, view mode)
  setPreferences: (prefs: {
    selectedCategory?: string
    sortBy?: 'price-low' | 'price-high' | 'newest' | 'rating'
    viewMode?: 'grid' | 'list'
    itemsPerPage?: number
  }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEYS.PREFERENCES, JSON.stringify({
        ...sessionStorage.getPreferences(),
        ...prefs,
        lastUpdated: new Date().toISOString(),
      }))
    }
  },

  getPreferences: () => {
    if (typeof window === 'undefined') return {}
    const prefs = localStorage.getItem(SESSION_KEYS.PREFERENCES)
    return prefs ? JSON.parse(prefs) : {}
  },

  // Favorites/Wishlist
  addFavorite: (productId: string) => {
    if (typeof window === 'undefined') return
    const favorites = sessionStorage.getFavorites()
    if (!favorites.includes(productId)) {
      favorites.push(productId)
      localStorage.setItem(SESSION_KEYS.FAVORITES, JSON.stringify(favorites))
    }
  },

  removeFavorite: (productId: string) => {
    if (typeof window === 'undefined') return
    const favorites = sessionStorage.getFavorites()
    const updated = favorites.filter(id => id !== productId)
    localStorage.setItem(SESSION_KEYS.FAVORITES, JSON.stringify(updated))
  },

  getFavorites: (): string[] => {
    if (typeof window === 'undefined') return []
    const favorites = localStorage.getItem(SESSION_KEYS.FAVORITES)
    return favorites ? JSON.parse(favorites) : []
  },

  isFavorite: (productId: string): boolean => {
    return sessionStorage.getFavorites().includes(productId)
  },

  // Search History
  addSearchQuery: (query: string) => {
    if (typeof window === 'undefined' || !query.trim()) return
    const history = sessionStorage.getSearchHistory()
    // Remove if already exists
    const filtered = history.filter(q => q !== query)
    // Add to beginning, limit to 10
    const updated = [query, ...filtered].slice(0, 10)
    localStorage.setItem(SESSION_KEYS.SEARCH_HISTORY, JSON.stringify(updated))
  },

  getSearchHistory: (): string[] => {
    if (typeof window === 'undefined') return []
    const history = localStorage.getItem(SESSION_KEYS.SEARCH_HISTORY)
    return history ? JSON.parse(history) : []
  },

  clearSearchHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEYS.SEARCH_HISTORY)
    }
  },

  // Viewed Products (browsing history)
  addViewedProduct: (productId: string, productName: string) => {
    if (typeof window === 'undefined') return
    const viewed = sessionStorage.getViewedProducts()
    const product = { id: productId, name: productName, viewedAt: new Date().toISOString() }
    // Remove if already exists
    const filtered = viewed.filter(p => p.id !== productId)
    // Add to beginning, limit to 20
    const updated = [product, ...filtered].slice(0, 20)
    localStorage.setItem(SESSION_KEYS.VIEWED_PRODUCTS, JSON.stringify(updated))
  },

  getViewedProducts: (): Array<{ id: string; name: string; viewedAt: string }> => {
    if (typeof window === 'undefined') return []
    const viewed = localStorage.getItem(SESSION_KEYS.VIEWED_PRODUCTS)
    return viewed ? JSON.parse(viewed) : []
  },

  // Activity Tracking
  trackActivity: (action: string, details?: any) => {
    if (typeof window === 'undefined') return
    const activities = sessionStorage.getActivity()
    const activity = {
      action,
      details,
      timestamp: new Date().toISOString(),
    }
    // Keep last 50 activities
    const updated = [activity, ...activities].slice(0, 50)
    localStorage.setItem(SESSION_KEYS.ACTIVITY, JSON.stringify(updated))
  },

  getActivity: (): Array<{ action: string; details?: any; timestamp: string }> => {
    if (typeof window === 'undefined') return []
    const activity = localStorage.getItem(SESSION_KEYS.ACTIVITY)
    return activity ? JSON.parse(activity) : []
  },

  // Clear all session data
  clearAll: () => {
    if (typeof window === 'undefined') return
    Object.values(SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  },

  // Clear all except user data
  clearSessionExceptUser: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEYS.CART)
    localStorage.removeItem(SESSION_KEYS.PREFERENCES)
    localStorage.removeItem(SESSION_KEYS.ACTIVITY)
  },
}

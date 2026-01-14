# Session Management - Quick Reference Guide

## 🚀 Quick Start

### In Any Component
```typescript
import { 
  useUserSession, 
  useMarketplacePreferences, 
  useFavorites, 
  useSearchHistory,
  useViewedProducts,
  useActivityTracking 
} from '@/hooks/use-session'

export function MyComponent() {
  // User authentication
  const { user, isLoggedIn, setUserSession } = useUserSession()
  
  // Preferences
  const { preferences, updatePreferences } = useMarketplacePreferences()
  
  // Favorites
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  
  // Search history
  const { history, addQuery, clearHistory } = useSearchHistory()
  
  // Viewed products
  const { viewed, addViewed } = useViewedProducts()
  
  // Activity tracking
  const { track, activity } = useActivityTracking()
  
  // Use them
  return (
    <div>
      {isLoggedIn && <p>Welcome, {user?.email}</p>}
      <button onClick={() => toggleFavorite('product-id')}>
        {isFavorite('product-id') ? '❤️' : '🤍'} Favorite
      </button>
      <button onClick={() => addQuery('search term')}>
        Search
      </button>
    </div>
  )
}
```

---

## 📊 Storage Keys Reference

| Key | Purpose | Type | Example |
|-----|---------|------|---------|
| `b2zi_user` | Current user login | Object | `{id, email, name}` |
| `b2zi_merchant` | Seller login | Object | `{id, storeName, email}` |
| `b2zi_preferences` | User settings | Object | `{selectedCategory, sortBy}` |
| `b2zi_cart` | Shopping cart | Array | `[{product, quantity, color}]` |
| `b2zi_favorites` | Wishlist | Array | `["product-1", "product-2"]` |
| `b2zi_search_history` | Search queries | Array | `["shoes", "nike", "adidas"]` |
| `b2zi_viewed_products` | Recently viewed | Array | `[{id, name, timestamp}]` |
| `b2zi_activity` | Action log | Array | `[{action, timestamp, details}]` |

---

## 🎯 Common Tasks

### Login User
```typescript
const { setUserSession } = useUserSession()

const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/customers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  const user = await response.json()
  setUserSession(user)
}
```

### Add to Favorites
```typescript
const { toggleFavorite } = useFavorites()

<button onClick={() => toggleFavorite(productId)}>
  Add to Wishlist
</button>
```

### Track Action
```typescript
const { track } = useActivityTracking()

// Simple tracking
track('product_click', { productId: '123' })

// With details
track('purchase', { 
  orderId: 'order-456',
  amount: 99.99,
  items: 3
})
```

### Get User Preferences
```typescript
const { preferences, updatePreferences } = useMarketplacePreferences()

// Read preferences
console.log(preferences.selectedCategory) // 'electronics'
console.log(preferences.sortBy) // 'newest'

// Update preferences
updatePreferences({ 
  selectedCategory: 'shoes',
  sortBy: 'price-low'
})
```

### Manage Search History
```typescript
const { history, addQuery, clearHistory } = useSearchHistory()

// Add to history
addQuery('Nike shoes')

// View history
console.log(history) // ['Nike shoes', 'adidas', 'running']

// Clear history
clearHistory()
```

### Track Viewed Products
```typescript
const { viewed, addViewed } = useViewedProducts()

// Add product to viewed
addViewed('product-123', 'Nike Air Max')

// View recently viewed
console.log(viewed) // [{id, name, timestamp}, ...]
```

---

## 🔍 Activity Tracking Events

Common actions to track:

```typescript
// Navigation
track('marketplace_visit')
track('page_view', { page: '/marketplace' })

// Search
track('search', { query: 'shoes', results: 42 })

// Product
track('product_view', { productId: '123', productName: 'Nike' })
track('product_click', { productId: '123' })

// Filtering
track('category_filter', { category: 'shoes' })
track('sort_change', { sortBy: 'price-low' })
track('price_filter', { minPrice: 10, maxPrice: 100 })

// Cart
track('add_to_cart', { productId: '123', quantity: 2 })
track('remove_from_cart', { productId: '123' })
track('update_quantity', { productId: '123', newQuantity: 3 })

// Favorites
track('favorite_add', { productId: '123' })
track('favorite_remove', { productId: '123' })
track('favorite_toggle', { productId: '123', isFavorite: true })

// Checkout
track('checkout_start')
track('checkout_complete', { orderId: '456', amount: 99.99 })

// User
track('login', { userId: '123' })
track('logout')
track('register')
```

---

## 💾 Direct Storage Access

If you need to bypass hooks (not recommended):

```typescript
import { sessionStorage } from '@/lib/session-storage'

// User
sessionStorage.setUser({ id: '1', email: 'user@example.com', name: 'John' })
const user = sessionStorage.getUser()
sessionStorage.clearUser()

// Favorites
sessionStorage.addFavorite('product-123')
sessionStorage.removeFavorite('product-123')
const favorites = sessionStorage.getFavorites() // ['id1', 'id2']
sessionStorage.isFavorite('product-123') // true/false

// Preferences
sessionStorage.setPreferences({ 
  selectedCategory: 'shoes',
  sortBy: 'price-low',
  viewMode: 'grid',
  itemsPerPage: 12
})
const prefs = sessionStorage.getPreferences()

// Activity
sessionStorage.trackActivity('search', { query: 'shoes' })
const activities = sessionStorage.getActivity()

// Clear all
sessionStorage.clearAll()
sessionStorage.clearSessionExceptUser()
```

---

## 🐛 Debugging

### View All Session Data
Open browser DevTools Console:
```javascript
// View all keys
Object.keys(localStorage).filter(k => k.startsWith('b2zi_'))

// View specific data
JSON.parse(localStorage.getItem('b2zi_favorites'))
JSON.parse(localStorage.getItem('b2zi_activity'))
JSON.parse(localStorage.getItem('b2zi_preferences'))

// Clear all session
Object.keys(localStorage).forEach(k => {
  if (k.startsWith('b2zi_')) localStorage.removeItem(k)
})
```

### Monitor Activities
```javascript
const activities = JSON.parse(localStorage.getItem('b2zi_activity'))
console.table(activities)
```

---

## ⚙️ Configuration

### Modify Storage Keys
Edit `/lib/session-storage.ts`:
```typescript
export const SESSION_KEYS = {
  USER: 'b2zi_user',           // Change this
  FAVORITES: 'b2zi_favorites', // Change this
  // ... etc
}
```

### Add New Session Features
1. Add key to `SESSION_KEYS`
2. Add getter/setter to `sessionStorage` object in `/lib/session-storage.ts`
3. Create hook in `/hooks/use-session.ts`
4. Export hook in same file
5. Use hook in components

---

## 🎨 UI Integration Examples

### Show User Info
```typescript
const { user } = useUserSession()

{user && (
  <div>
    <img src={user.avatar} alt={user.name} />
    <p>{user.name}</p>
    <p>{user.email}</p>
  </div>
)}
```

### Favorites Button
```typescript
const { isFavorite, toggleFavorite } = useFavorites()

<button 
  onClick={() => toggleFavorite(productId)}
  className={isFavorite(productId) ? 'text-red-500' : 'text-gray-400'}
>
  ❤️ {isFavorite(productId) ? 'Favorited' : 'Add to Favorites'}
</button>
```

### Activity Indicators
```typescript
const { activity } = useActivityTracking()

<div>
  <h3>Your Recent Activity</h3>
  {activity.slice(0, 5).map(act => (
    <p key={act.timestamp}>
      {act.action} at {new Date(act.timestamp).toLocaleString()}
    </p>
  ))}
</div>
```

### Search with History
```typescript
const { history, addQuery } = useSearchHistory()

<div>
  <input 
    onChange={(e) => addQuery(e.target.value)}
    list="search-history"
  />
  <datalist id="search-history">
    {history.map(q => <option key={q} value={q} />)}
  </datalist>
</div>
```

---

## 📋 Best Practices

1. **Always use hooks** - Don't access localStorage directly in components
2. **Track important actions** - Purchase, search, product view, add to cart
3. **Respect user privacy** - Allow opt-out for tracking
4. **Clean up data** - Implement data retention policies
5. **Use TypeScript** - All types are defined in `/lib/session-storage.ts`
6. **Test persistence** - Always refresh page to verify data persists

---

## 🚨 Troubleshooting

### Favorites not persisting?
```typescript
// Check hook is working
const { favorites } = useFavorites()
console.log(favorites) // Should show array

// Check localStorage
console.log(localStorage.getItem('b2zi_favorites'))

// Verify onToggleFavorite is passed correctly
<ProductCard onToggleFavorite={handleToggleFavorite} />
```

### User session lost after refresh?
```typescript
// Check localStorage
console.log(localStorage.getItem('b2zi_user'))

// Verify setUserSession is called on login
const { setUserSession } = useUserSession()
setUserSession(userData)
```

### Activity not tracking?
```typescript
// Check track function is called
const { track } = useActivityTracking()
track('test_action', { data: 'test' })

// Verify localStorage updated
console.log(localStorage.getItem('b2zi_activity'))
```

---

## 📞 Support

For issues or questions:
1. Check the SESSION_MANAGEMENT_COMPLETE.md guide
2. Review hook implementation in `/hooks/use-session.ts`
3. Check storage utility in `/lib/session-storage.ts`
4. Examine Marketplace.tsx for integration examples
5. Use browser DevTools to inspect localStorage

# Authentication Flow - Quick Reference Guide

## Corrected Backend Login Functions

### Customer Login API (`/app/api/customers/login/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  comparePassword,
  createToken,
  createSession,
  handleSuccessfulLogin,
} from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[CUSTOMER LOGIN] Attempt - Email:', email)

    if (!email || !password) {
      console.log('[CUSTOMER LOGIN] ❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // 1. Find customer
    console.log('[CUSTOMER LOGIN] 🔍 Searching for customer by email:', email)
    const customer = await prisma.customer.findUnique({
      where: { email },
    })

    if (!customer) {
      console.log('[CUSTOMER LOGIN] ❌ Customer NOT found for email:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[CUSTOMER LOGIN] ✅ Customer found:', customer.id)

    // 2. Verify password
    console.log('[CUSTOMER LOGIN] 🔐 Comparing passwords...')
    const passwordMatch = await comparePassword(password, customer.password)
    console.log('[CUSTOMER LOGIN] Password match:', passwordMatch)

    if (!passwordMatch) {
      console.log('[CUSTOMER LOGIN] ❌ Password mismatch for customer:', customer.id)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[CUSTOMER LOGIN] ✅ Password correct!')

    // 3. Update login stats
    await handleSuccessfulLogin(customer.id, 'customer')
    console.log('[CUSTOMER LOGIN] ✅ Login attempt marked as successful')

    // 4. Create token
    const token = createToken({
      id: customer.id,
      email: customer.email,
      type: 'customer',
    })
    console.log('[CUSTOMER LOGIN] ✅ JWT token created')

    // 5. Create session
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     request.ip ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await createSession(customer.id, 'customer', token, ipAddress, userAgent)
    console.log('[CUSTOMER LOGIN] ✅ Session created in database')

    // 6. Return response
    const { password: _, ...customerData } = customer

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          type: 'customer',
        },
        customer: customerData,
        token,
      },
      { status: 200 }
    )

    // 7. Set httpOnly cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    console.log('[CUSTOMER LOGIN] ✅ Login successful! User:', customer.email)
    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[CUSTOMER LOGIN] ❌ Error:', errorMsg)
    console.error('[CUSTOMER LOGIN] Full error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login', details: errorMsg },
      { status: 500 }
    )
  }
}
```

### Merchant Login API (`/app/api/merchant/login/route.ts`)
Same as above, but:
- Change `[CUSTOMER LOGIN]` → `[MERCHANT LOGIN]`
- Change `prisma.customer` → `prisma.merchant`
- Change response user object fields accordingly

---

## Corrected Frontend Hook (`/hooks/use-auth.ts`)

```typescript
const login = useCallback(
  async (email: string, password: string, type: 'merchant' | 'customer') => {
    try {
      const endpoint = type === 'merchant' 
        ? '/api/merchant/login' 
        : '/api/customers/login'

      console.log('[AUTH HOOK] Login attempt:', { email, type, endpoint })

      // 1. Make API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('[AUTH HOOK] Response status:', response.status)
      const data = await response.json()
      console.log('[AUTH HOOK] Response data:', data)

      // 2. Check BOTH status AND success flag
      if (!response.ok || !data.success) {
        const error = data.error || 'Login failed'
        console.error('[AUTH HOOK] Login failed:', error)
        throw new Error(error)
      }

      // 3. Extract user from consistent response
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

      // 4. Update state
      setUser(userData)
      setIsAuthenticated(true)

      // 5. Store token backup
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
```

---

## Corrected Login Page Handler

### For both Customer (`/app/customers/login/page.tsx`) and Merchant (`/app/sellers/login/page.tsx`)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setErrorMessage("")

  if (!formData.email || !formData.password) {
    setErrorMessage("Please fill in all fields")
    return
  }

  setIsSubmitting(true)
  try {
    console.log("[LOGIN PAGE] Starting login...", formData.email)
    
    // 1. Call login hook
    const result = await login(formData.email, formData.password, "customer") // or "merchant"
    console.log("[LOGIN PAGE] Login result:", result)
    
    // 2. Check result
    if (!result.success) {
      const error = result.error || "Login failed"
      console.error("[LOGIN PAGE] ❌ Login failed:", error)
      setErrorMessage(error)
      setIsSubmitting(false)
      return
    }

    // 3. Save to localStorage
    if (result.user) {
      localStorage.setItem("b2zi_user", JSON.stringify(result.user)) // or "b2zi_merchant"
      console.log("[LOGIN PAGE] ✅ User saved to localStorage:", result.user)
    }

    // 4. Clear form
    setFormData({ email: "", password: "" })
    
    // 5. IMMEDIATELY redirect (no setTimeout!)
    console.log("[LOGIN PAGE] ✅ Login complete, redirecting immediately...")
    router.push("/marketplace") // or "/sellers/dashboard" for merchants
  } catch (error) {
    console.error("[LOGIN PAGE] ❌ Login error:", error)
    const errorMsg = error instanceof Error ? error.message : "An error occurred. Please try again."
    setErrorMessage(errorMsg)
    setIsSubmitting(false)
  }
}
```

---

## Key Differences (Before vs After)

| Issue | Before | After |
|-------|--------|-------|
| **Response structure** | Different for customer/merchant | Consistent `user` field |
| **Logging** | None | Detailed at every step |
| **Error checking** | Only `!response.ok` | Check `!response.ok \|\| !data.success` |
| **User data extraction** | Direct property access | Safe navigation with `?.` |
| **Redirect timing** | `setTimeout(..., 500)` | Immediate `router.push()` |
| **Password hashing** | ✅ bcryptjs (always was) | ✅ bcryptjs (no change) |
| **Database lookup** | ✅ findUnique by email | ✅ findUnique by email (no change) |
| **Password comparison** | ✅ comparePassword() | ✅ comparePassword() (no change) |

---

## Debug Checklist

- [ ] Test user exists in database (`node debug-auth.js`)
- [ ] Password hash is correct in database
- [ ] API endpoint returns `success: true` on valid credentials
- [ ] API endpoint returns `user` object in response
- [ ] Frontend checks `data.success` flag
- [ ] Frontend logs appear in browser console
- [ ] Backend logs appear in terminal running `npm run dev`
- [ ] Router redirects immediately (no delay)
- [ ] localStorage has correct key (`b2zi_user` or `b2zi_merchant`)
- [ ] Middleware doesn't block authenticated users
- [ ] Cookie is set with `auth-token` name

---

## Common Errors & Solutions

### "Invalid email or password"
- **Check 1**: User exists? Run `node debug-auth.js`
- **Check 2**: Email format matches exactly
- **Check 3**: Password is correct (check database for hash)
- **Check 4**: Check backend logs for which step failed

### "No redirect to dashboard"
- **Check 1**: Did login return `success: true`?
- **Check 2**: Is `result.user` defined?
- **Check 3**: Are there JS errors in console?
- **Check 4**: Is router object working? (test with other pages)

### "Redirect happens but user is not logged in"
- **Check 1**: Is `localStorage.setItem()` working?
- **Check 2**: Is middleware blocking the route?
- **Check 3**: Is cookie being set? (Check DevTools → Application → Cookies)
- **Check 4**: Is JWT token valid?

### "Backend logs don't appear"
- **Check 1**: Did you save the file?
- **Check 2**: Did you restart `npm run dev`?
- **Check 3**: Are console.log statements actually in the file?
- **Check 4**: Is terminal attached to correct process?

---

**Remember**: The fixes ensure:
1. **Consistent API responses** across customer and merchant endpoints
2. **Comprehensive logging** for debugging
3. **Proper error handling** in frontend
4. **Immediate redirects** after login
5. **Safe data extraction** with optional chaining

# Quick Start - Authentication & Session Management

## 5-Minute Setup

### 1. Configure Environment Variables
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Add to .env
JWT_SECRET="your-generated-secret-here"
SESSION_MAX_AGE=604800
SESSION_UPDATE_AGE=86400
```

### 2. Database Sync
```bash
pnpm prisma db push
```

### 3. Test Login

#### For Merchants:
```bash
# 1. Register at /register
# 2. Login at /sellers/login
# 3. Dashboard at /sellers/dashboard
```

#### For Customers:
```bash
# 1. Register at /customers/register
# 2. Login at /customers/login
# 3. Marketplace at /marketplace
```

## Key Endpoints

### Authentication
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/merchant/login` | POST | Merchant login |
| `/api/customers/login` | POST | Customer login |
| `/api/merchant/logout` | POST | Merchant logout |
| `/api/customers/logout` | POST | Customer logout |
| `/api/auth/session` | GET | Check session status |

### Registration
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/register` | POST | Merchant registration |
| `/api/customers/register` | POST | Customer registration |

## Code Examples

### Login in Component
```typescript
import { useAuth } from '@/hooks/use-auth'

export function LoginForm() {
  const { login } = useAuth()
  
  const handleLogin = async () => {
    const result = await login('user@example.com', 'password', 'merchant')
    if (result.success) {
      // Redirect or show success
    } else {
      console.error(result.error)
    }
  }
  
  return <button onClick={handleLogin}>Login</button>
}
```

### Protect Page
```typescript
import { useProtectedRoute } from '@/hooks/use-auth'

export function DashboardPage() {
  const { user, isLoading } = useProtectedRoute('merchant')
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Welcome, {user?.businessName}</div>
}
```

### API Route Protection
```typescript
import { withAuthWrapper } from '@/lib/auth-middleware'
import { NextResponse } from 'next/server'

export const POST = withAuthWrapper(async (request) => {
  const user = request.user
  // User is authenticated, process request
  return NextResponse.json({ success: true })
}, 'merchant') // Optional: require specific role
```

## Common Issues & Fixes

### "Session not persisting"
1. Check browser cookies are enabled
2. Verify JWT_SECRET is set
3. Check `/api/auth/session` endpoint

### "Account locked"
- User tried logging in 5 times incorrectly
- Wait 15 minutes or admin can reset `lockedUntil` field

### "Invalid token"
- Session expired (7 days by default)
- User needs to login again

### "Unauthorized"
- No token in request
- Token is expired
- User type doesn't match endpoint

## Security Checklist

- [ ] JWT_SECRET is generated and set
- [ ] Using HTTPS in production
- [ ] httpOnly cookies enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Expired sessions cleaned up
- [ ] Failed logins monitored
- [ ] Passwords hashed with bcrypt

## Useful Commands

```bash
# Check current auth state
curl http://localhost:3000/api/auth/session

# Test merchant login
curl -X POST http://localhost:3000/api/merchant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"merchant@test.com","password":"test123456"}'

# View active sessions in database
SELECT * FROM "Session" WHERE "expiresAt" > NOW();

# Clean expired sessions
DELETE FROM "Session" WHERE "expiresAt" < NOW();
```

## Database Queries

### View User Sessions
```sql
SELECT s.*, u.email 
FROM "Session" s
JOIN "Merchant" u ON s."merchantId" = u.id
WHERE s."expiresAt" > NOW();
```

### Check Login Attempts
```sql
SELECT email, "loginAttempts", "lockedUntil" 
FROM "Merchant" 
WHERE "loginAttempts" > 0;
```

### Reset Locked Account
```sql
UPDATE "Merchant" 
SET "lockedUntil" = NULL, "loginAttempts" = 0 
WHERE email = 'user@example.com';
```

## Features

✅ Secure password hashing (bcrypt)
✅ JWT-based sessions
✅ Database session tracking
✅ Account lockout protection
✅ Failed login attempt tracking
✅ HttpOnly secure cookies
✅ CSRF protection (SameSite)
✅ Role-based access control
✅ Client-side auth hooks
✅ Protected API routes
✅ Middleware route protection
✅ Session expiration
✅ IP/User agent logging

## Next Steps

1. **Test thoroughly** - Try all login/logout flows
2. **Monitor logs** - Watch for auth errors
3. **Configure secrets** - Use strong JWT_SECRET
4. **Set up monitoring** - Track login patterns
5. **Plan enhancements** - Add 2FA, OAuth, etc.

## Documentation

- Full guide: `docs/AUTHENTICATION_SESSION_GUIDE.md`
- Implementation details: `docs/SESSION_MANAGEMENT_IMPLEMENTATION.md`
- Code: `lib/auth-utils.ts`, `lib/auth-middleware.ts`, `hooks/use-auth.ts`

## Support

If issues occur:
1. Check error messages in browser console
2. Review API response status codes
3. Verify environment variables
4. Check database connectivity
5. Review middleware configuration

## Resources

- JWT: https://jwt.io
- Bcrypt: https://github.com/kelektiv/node.bcrypt.js
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Prisma: https://www.prisma.io/docs/

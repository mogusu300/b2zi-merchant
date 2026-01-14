# Session Management & Authentication Configuration Guide

## Overview

This document outlines the improved session management and authentication system for both Sellers (Merchants) and Buyers (Customers) in the B2Zi marketplace.

## Architecture

### Components

1. **Authentication Utilities** (`lib/auth-utils.ts`)
   - Password hashing with bcrypt
   - JWT token creation and verification
   - Session management in database
   - Account lockout mechanism
   - Failed login attempt tracking

2. **Authentication Middleware** (`lib/auth-middleware.ts`)
   - Request-level authentication checking
   - Token verification
   - Role-based access control

3. **Next.js Middleware** (`middleware.ts`)
   - Route protection at application level
   - Automatic redirects for unauthenticated users
   - Session validation for protected routes

4. **Authentication Hooks** (`hooks/use-auth.ts`)
   - Client-side auth state management
   - Login/logout/register functions
   - Session checking
   - Route protection hooks

5. **API Endpoints**
   - `/api/merchant/login` - Merchant login
   - `/api/merchant/logout` - Merchant logout
   - `/api/customers/login` - Customer login
   - `/api/customers/logout` - Customer logout
   - `/api/auth/session` - Session check
   - `/api/register` - Merchant registration
   - `/api/customers/register` - Customer registration

## Security Features

### 1. Password Security
- Passwords are hashed using bcrypt (10 salt rounds)
- Passwords are never stored or transmitted in plain text
- Hash verification uses secure comparison

### 2. Session Management
- Sessions stored in database with expiration
- 7-day session timeout by default
- Tracks session creation time, IP address, and user agent
- Session invalidation on logout
- Automatic cleanup of expired sessions

### 3. Account Protection
- Failed login attempt tracking
- Account lockout after 5 failed attempts
- 15-minute lockout period
- Reset on successful login

### 4. Token Security
- JWT tokens with configurable expiration
- httpOnly cookies (cannot be accessed by JavaScript)
- Secure flag for production environments
- SameSite=Strict for CSRF protection

### 5. Role-Based Access Control
- Separate authentication for merchants and customers
- Route protection based on user type
- Automatic redirection to appropriate dashboards

## Database Schema

### Merchant Model
```
- id (cuid)
- email (unique)
- password (hashed)
- businessName
- ownerName
- phone
- status (pending/approved/rejected)
- isVerified (boolean)
- lastLogin (timestamp)
- loginAttempts (integer)
- lockedUntil (timestamp)
- sessions (relationship)
```

### Customer Model
```
- id (cuid)
- email (unique)
- password (hashed)
- name
- phone
- isVerified (boolean)
- lastLogin (timestamp)
- loginAttempts (integer)
- lockedUntil (timestamp)
- sessions (relationship)
```

### Session Model
```
- id (cuid)
- token (unique, indexed)
- type (merchant/customer)
- userId
- merchantId (nullable)
- customerId (nullable)
- ipAddress
- userAgent
- expiresAt (timestamp, indexed)
- createdAt (timestamp)
```

## Configuration

### Environment Variables

```env
# JWT Secret (REQUIRED - Change in production!)
JWT_SECRET="your-super-secret-key-change-in-production"

# Session timeout (7 days in seconds)
SESSION_MAX_AGE=604800

# Session update age (1 day in seconds)
SESSION_UPDATE_AGE=86400
```

### JWT_SECRET Generation

Generate a strong secret key:
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Usage

### Login (Merchant)

**Endpoint:** `POST /api/merchant/login`

**Request:**
```json
{
  "email": "merchant@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "merchant": {
    "id": "...",
    "email": "merchant@example.com",
    "businessName": "My Store",
    "ownerName": "John Doe",
    "status": "approved",
    "lastLogin": "2024-01-09T10:30:00Z"
  },
  "token": "eyJhbGc..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

### Login (Customer)

**Endpoint:** `POST /api/customers/login`

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "customer": {
    "id": "...",
    "email": "customer@example.com",
    "name": "John Doe",
    "lastLogin": "2024-01-09T10:30:00Z"
  },
  "token": "eyJhbGc..."
}
```

### Logout

**Endpoint:** `POST /api/merchant/logout` or `POST /api/customers/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Check Session

**Endpoint:** `GET /api/auth/session`

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "type": "merchant|customer"
  },
  "session": {
    "createdAt": "2024-01-09T10:00:00Z",
    "expiresAt": "2024-01-16T10:00:00Z",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

### Register (Merchant)

**Endpoint:** `POST /api/register`

**Request:**
```json
{
  "businessName": "My Store",
  "ownerName": "John Doe",
  "email": "merchant@example.com",
  "phone": "+263771234567",
  "businessType": "retail",
  "businessAddress": "123 Main St",
  "password": "securePassword123",
  "idType": "nrc",
  "idFrontUrl": "https://...",
  "idBackUrl": "https://..."
}
```

**Validation:**
- Email must be valid format and unique
- Password must be at least 8 characters
- All required fields must be provided

### Register (Customer)

**Endpoint:** `POST /api/customers/register`

**Request:**
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "phone": "+263771234567"
}
```

**Validation:**
- Email must be valid format and unique
- Password must be at least 8 characters
- Passwords must match

## Client-Side Integration

### Using the useAuth Hook

```typescript
import { useAuth } from '@/hooks/use-auth'

export function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password', 'merchant')
    if (result.success) {
      // Redirect to dashboard
    } else {
      console.error(result.error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### Protecting Routes

```typescript
import { useProtectedRoute } from '@/hooks/use-auth'

export function ProtectedPage() {
  const { user, isLoading } = useProtectedRoute('merchant')

  if (isLoading) return <div>Loading...</div>

  return <div>Welcome, {user?.businessName}</div>
}
```

## Middleware Protection

Protected routes are automatically guarded by the middleware:

**Merchant Routes:**
- `/sellers/dashboard`
- `/sellers/products`
- `/sellers/orders`
- `/api/merchant/*`

**Customer Routes:**
- `/customers/orders`
- `/customers/checkout`
- `/marketplace`
- `/api/customers/*`

Unauthenticated users are automatically redirected to the appropriate login page.

## Failed Login Attempts

The system tracks failed login attempts to prevent brute force attacks:

1. First 4 failed attempts: Account remains active
2. 5th failed attempt: Account locked for 15 minutes
3. Successful login: Attempt counter reset to 0
4. After lockout period: Account automatically unlocked

## Best Practices

### For Developers

1. **Always use HTTPS in production**
   - Set `secure` flag in cookies to true
   - Use environment-based configuration

2. **Rotate JWT_SECRET regularly**
   - Never commit secrets to version control
   - Use environment variables

3. **Implement rate limiting**
   - Limit login attempts per IP
   - Implement CAPTCHA for multiple failures

4. **Monitor sessions**
   - Log all login/logout events
   - Alert on suspicious activity
   - Clean up expired sessions regularly

5. **Update authentication regularly**
   - Keep dependencies updated
   - Review security advisories
   - Implement multi-factor authentication

### For Users

1. **Strong passwords**
   - Use at least 8 characters
   - Mix uppercase, lowercase, numbers, symbols

2. **Session security**
   - Don't share login credentials
   - Log out when done
   - Use secure networks

3. **Account protection**
   - Enable 2FA when available
   - Review login history
   - Update password regularly

## Troubleshooting

### Session Not Persisting

**Problem:** User logs in but session doesn't persist across pages

**Solutions:**
1. Check if cookies are enabled in browser
2. Verify JWT_SECRET is set in .env
3. Check if /api/auth/session returns valid session

### Account Locked

**Problem:** User cannot log in with message "Account locked"

**Solutions:**
1. Wait 15 minutes for automatic unlock
2. Admin can update `lockedUntil` field in database
3. Check `loginAttempts` field

### Invalid Token

**Problem:** "Unauthorized: Invalid or expired token"

**Solutions:**
1. User needs to log in again
2. Check token expiration
3. Verify JWT_SECRET hasn't changed

### CORS Issues

**Problem:** Login request fails with CORS error

**Solutions:**
1. Ensure requests are to same origin
2. Check cookies are sent with requests
3. Verify credentials mode is set

## Database Cleanup

### Automatic Cleanup

Implement a cron job to clean up expired sessions:

```typescript
// Run periodically (daily recommended)
import { cleanupExpiredSessions } from '@/lib/auth-utils'

await cleanupExpiredSessions()
```

### Manual Cleanup

```sql
-- Delete all expired sessions
DELETE FROM "Session" WHERE "expiresAt" < NOW();

-- Reset login attempts for all users
UPDATE "Merchant" SET "loginAttempts" = 0, "lockedUntil" = NULL;
UPDATE "Customer" SET "loginAttempts" = 0, "lockedUntil" = NULL;
```

## Next Steps

1. **Configure JWT_SECRET**
   - Generate secure key
   - Add to .env in production

2. **Test Authentication Flow**
   - Register test accounts
   - Test login/logout
   - Verify session persistence

3. **Implement Additional Features**
   - Password reset functionality
   - Email verification
   - Two-factor authentication
   - Session management dashboard

4. **Monitor and Maintain**
   - Review logs regularly
   - Clean up expired sessions
   - Update dependencies
   - Implement rate limiting

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review database schema
3. Check console logs for errors
4. Review API response codes

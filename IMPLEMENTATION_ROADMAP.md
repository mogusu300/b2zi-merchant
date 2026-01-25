# FieldPro Harare Backend - Implementation Roadmap

**Project:** FieldPro Harare Merchant Onboarding PWA  
**Phase:** Backend Development & Integration  
**Timeline:** 12-16 weeks  
**Status:** Design Complete - Ready for Implementation

---

## Overview

This roadmap provides a sequential implementation plan for building the FieldPro Harare backend, integrating with the existing marketplace database, and launching in production.

---

## Phase 1: Foundation & Setup (Weeks 1-2)

### 1.1 Environment & Infrastructure Setup

**Tasks:**
- [ ] Provision PostgreSQL database (production-ready)
  - Enable SSL connections
  - Configure backup strategy
  - Set up replication for high availability
  - Create database user with least-privilege access

- [ ] Configure AWS S3 bucket
  - Enable versioning
  - Set up encryption (SSE-S3)
  - Configure lifecycle policies (archive old files after 1 year)
  - Create IAM user with S3-only permissions
  - Set up CloudFront distribution for file serving

- [ ] Set up monitoring & logging
  - Configure CloudWatch for AWS resources
  - Set up Sentry for error tracking
  - Configure DataDog/New Relic for APM
  - Set up log aggregation (CloudWatch Logs)

- [ ] Configure CI/CD pipeline
  - GitHub Actions or GitLab CI
  - Automated testing on every commit
  - Automated deployment to staging
  - Manual approval for production deployment

**Deliverables:**
- Fully configured PostgreSQL instance
- S3 bucket with proper security settings
- CI/CD pipeline running
- Monitoring dashboards active

---

### 1.2 Project Structure & Dependencies

**Tasks:**
- [ ] Create API directory structure
  ```
  app/
  ├── api/v1/
  │   ├── auth/
  │   ├── merchants/
  │   ├── hunters/
  │   └── admin/
  ├── lib/
  ├── middleware.ts
  └── types/
  ```

- [ ] Install and configure dependencies
  - `@prisma/client` - ORM
  - `jsonwebtoken` - JWT tokens
  - `bcryptjs` - Password hashing
  - `zod` - Input validation
  - `@aws-sdk/client-s3` - S3 client
  - `winston` - Logging
  - `next-cors` - CORS handling

- [ ] Configure Prisma
  - [ ] Set `DATABASE_URL` in `.env`
  - [ ] Create Prisma schema with all FieldPro tables
  - [ ] Configure Prisma client
  - [ ] Set up connection pooling

- [ ] TypeScript setup
  - Strict mode enabled
  - Path aliases configured (@/lib, @/types, etc.)
  - Type checking in pre-commit hook

**Deliverables:**
- Complete project structure
- All dependencies installed and configured
- Prisma schema defined (see BACKEND_ARCHITECTURE_DESIGN.md)
- Type definitions for all data models

---

## Phase 2: Authentication & Core Services (Weeks 3-4)

### 2.1 Authentication System

**Tasks:**
- [ ] Implement JWT token management
  - [ ] `generateHunterToken()` function
  - [ ] `generateMerchantToken()` function
  - [ ] `generateRefreshToken()` function
  - [ ] `verifyToken()` function
  - [ ] Token expiration and refresh logic
  - [ ] Refresh token rotation

- [ ] Implement password hashing
  - [ ] `hashPassword()` using bcryptjs (12 rounds)
  - [ ] `comparePassword()` function
  - [ ] Password strength validator
  - [ ] Password reset flow

- [ ] Implement OTP system
  - [ ] `generateOTP()` function
  - [ ] `generateOTPRequest()` function (with expiration)
  - [ ] `validateOTP()` function
  - [ ] OTP storage in Redis (temporary)

- [ ] Middleware
  - [ ] JWT verification middleware
  - [ ] Role-based access control middleware
  - [ ] Rate limiting middleware
  - [ ] Error handling middleware

**Tests:**
- [ ] Unit tests for JWT generation/verification
- [ ] Unit tests for password hashing
- [ ] Unit tests for OTP validation

**Deliverables:**
- Working JWT authentication
- Password hashing system
- OTP generation system
- Middleware stack

---

### 2.2 Hunter Authentication Endpoints

**Tasks:**
- [ ] `POST /api/v1/auth/hunters/login`
  - Validate email/password
  - Check hunter exists and is active
  - Generate JWT + refresh token
  - Log authentication event
  - Return tokens + hunter profile

- [ ] `POST /api/v1/auth/hunters/refresh`
  - Validate refresh token
  - Generate new access token
  - Invalidate old token (optional - token rotation)
  - Return new token

- [ ] `POST /api/v1/auth/hunters/logout`
  - Invalidate refresh token
  - Clear session
  - Log logout event

- [ ] `GET /api/v1/hunters/me`
  - Authenticated route
  - Return current hunter profile
  - Include performance metrics

**Tests:**
- [ ] Integration tests for login flow
- [ ] Integration tests for token refresh
- [ ] Integration tests for logout
- [ ] Test invalid credentials
- [ ] Test expired tokens

**Deliverables:**
- 4 working hunter auth endpoints
- Full authentication flow
- Error handling for all scenarios

---

### 2.3 Merchant Authentication Endpoints

**Tasks:**
- [ ] `POST /api/v1/auth/merchants/login`
  - Lookup merchant by phone
  - Verify password
  - Generate JWT token
  - Log authentication event

- [ ] `POST /api/v1/auth/merchants/request-otp`
  - Generate 6-digit OTP
  - Store temporarily with expiration
  - Send OTP via SMS (Twilio/Africa's Talking)
  - Return OTP request ID

- [ ] `POST /api/v1/auth/merchants/verify-otp`
  - Validate OTP request
  - Verify OTP code
  - Generate JWT token
  - Log authentication event

**Tests:**
- [ ] Integration tests for merchant login
- [ ] Integration tests for OTP request
- [ ] Integration tests for OTP verification
- [ ] Test OTP expiration
- [ ] Test invalid OTP

**Deliverables:**
- 3 working merchant auth endpoints
- Full passwordless login option
- SMS integration for OTP

---

## Phase 3: Merchant Management (Weeks 5-6)

### 3.1 Merchant Lookup & Validation

**Tasks:**
- [ ] `POST /api/v1/merchants/check-existence`
  - Input: phone, email, business_name, brn
  - Check if merchant exists in database
  - Return existence status + details if exists
  - Log lookup event

- [ ] `GET /api/v1/merchants/lookup`
  - Merchant-facing endpoint
  - Lookup by phone
  - Return own merchant details
  - No other merchant data visible

- [ ] Input validators
  - [ ] Phone number validator (regex + database check)
  - [ ] Email validator (regex + database check)
  - [ ] Business registration number validator
  - [ ] Address validator

**Tests:**
- [ ] Unit tests for validators
- [ ] Integration tests for check-existence
- [ ] Test duplicate detection
- [ ] Test missing fields

**Deliverables:**
- Duplicate prevention system
- Input validation schemas
- Lookup endpoints

---

### 3.2 Merchant Onboarding

**Tasks:**
- [ ] `POST /api/v1/merchants/onboard`
  - Authenticated: hunter only
  - Input: business name, owner, phone, email, address, category, GPS
  - Validate all inputs (Zod schema)
  - Check merchant doesn't exist
  - **TRANSACTION:**
    1. Create merchant record
    2. Create merchant profile (GPS + address)
    3. Create hunter-merchant link
    4. Log onboarding activity
    5. Update hunter stats
  - Return merchant ID + onboarding ID

- [ ] `GET /api/v1/merchants/:id`
  - Authenticated: hunter who onboarded it
  - Return full merchant details
  - Include documents
  - Include activity log
  - Include onboarding status

- [ ] `PATCH /api/v1/merchants/:id`
  - Authenticated: hunter who onboarded it
  - Update merchant fields: owner_name, phone, email, address, category
  - Log changes
  - Validate no duplicates on phone/email

- [ ] Merchant activity logging
  - Log every onboarding action
  - Track changes (old → new values)
  - Include timestamp, IP, user agent
  - Include context (hunter ID, merchant ID)

**Tests:**
- [ ] Integration test: complete onboarding flow
- [ ] Test transaction rollback on failure
- [ ] Test duplicate prevention
- [ ] Test hunter authorization
- [ ] Test activity logging
- [ ] Test GPS validation
- [ ] Test duplicate field updates

**Deliverables:**
- Full merchant onboarding system
- Transaction handling
- Activity audit trail

---

### 3.3 Hunter Merchant List & Stats

**Tasks:**
- [ ] `GET /api/v1/hunters/me/merchants`
  - Authenticated: hunter only
  - Pagination: page, limit
  - Filters: status (pending_verification, verified, rejected)
  - Sort: newest first
  - Return: list of merchant summaries

- [ ] `GET /api/v1/hunters/me/stats`
  - Query param: period (this_week, this_month, all_time)
  - Calculate daily metrics
  - Aggregates from merchant_activity_logs + agent_performance_metrics
  - Return:
    - field_visits
    - merchants_approached
    - merchants_onboarded
    - conversion_rate
    - documents_uploaded/verified
    - distance_covered

- [ ] `GET /api/v1/hunters/me/targets`
  - Get active targets for hunter
  - Show progress vs goal
  - Calculate remaining days
  - Show daily breakdown

**Tests:**
- [ ] Test pagination
- [ ] Test filtering by status
- [ ] Test stats calculation
- [ ] Test period comparison
- [ ] Test authorization (can't see other hunters' data)

**Deliverables:**
- Hunter dashboard data endpoints
- Performance tracking
- Target progress visualization

---

## Phase 4: Document Management (Weeks 7-8)

### 4.1 File Upload Infrastructure

**Tasks:**
- [ ] S3 integration
  - [ ] AWS SDK setup
  - [ ] S3 upload function
  - [ ] Pre-signed URL generation (1 hour expiry)
  - [ ] File validation
  - [ ] Encryption handling

- [ ] File validation
  - [ ] MIME type whitelist (PDF, JPEG, PNG)
  - [ ] File size limit (10MB)
  - [ ] Virus scanning (ClamAV or AWS GuardDuty)
  - [ ] Filename sanitization

- [ ] Storage strategy
  - [ ] Organize by merchant_id
  - [ ] Use UUID for filename (prevents enumeration)
  - [ ] Store metadata in database
  - [ ] Track upload by hunter + timestamp

**Deliverables:**
- S3 integration working
- File validation complete
- Pre-signed URLs functioning

---

### 4.2 Document Upload Endpoints

**Tasks:**
- [ ] `POST /api/v1/merchants/:id/documents/upload`
  - Authenticated: hunter who onboarded merchant
  - multipart/form-data
  - Fields: file, document_type, document_name
  - Validate merchant ownership
  - Upload to S3
  - Store metadata in database
  - Generate download URL
  - Log document upload
  - Return document reference

- [ ] `GET /api/v1/merchants/:id/documents`
  - List all documents for merchant
  - Show verification status
  - Show upload timestamp
  - Show uploader (hunter name)

- [ ] `GET /api/v1/merchants/:id/documents/:docId`
  - Get single document details
  - Include OCR data (if available)
  - Return download URL (pre-signed, 1 hour)
  - Show verification status

- [ ] `DELETE /api/v1/merchants/:id/documents/:docId`
  - Remove document
  - Delete from S3
  - Remove database record
  - Log deletion

**Tests:**
- [ ] Upload valid file
- [ ] Reject invalid file type
- [ ] Reject oversized file
- [ ] Test hunter authorization
- [ ] Test duplicate uploads
- [ ] Test document listing
- [ ] Test deletion

**Deliverables:**
- Full document management system
- File upload/download working
- Pre-signed URLs secure

---

### 4.3 Document Verification (Admin)

**Tasks:**
- [ ] `POST /api/v1/admin/merchants/:id/documents/:docId/verify`
  - Admin only
  - Mark document as verified
  - Optional: OCR extraction
  - Optional: verification notes
  - Update merchant status if all docs verified
  - Log verification event
  - Notify merchant + hunter

- [ ] Document status tracking
  - pending_review → verified → used
  - pending_review → rejected
  - Track rejections for resubmission

**Tests:**
- [ ] Admin can verify
- [ ] Non-admin cannot
- [ ] Triggers status updates
- [ ] Notifications sent

**Deliverables:**
- Admin document verification flow
- Status tracking

---

## Phase 5: Merchant Portal (Weeks 9-10)

### 5.1 Merchant Login & Profile

**Tasks:**
- [ ] Merchant authentication
  - Already done in Phase 2
  - Merchant can log in via phone + password OR phone + OTP

- [ ] `GET /api/v1/merchants/me/profile`
  - Return merchant's own profile
  - Show onboarding status
  - Show hunter who registered
  - Show registration date

**Deliverables:**
- Merchant can log in
- Merchant can view own profile

---

### 5.2 Merchant Onboarding Status

**Tasks:**
- [ ] `GET /api/v1/merchants/me/onboarding-status`
  - Return comprehensive status object:
    ```json
    {
      "merchant_id": "789",
      "status": "pending_verification",
      "registered_on": "2025-12-20T14:22:30Z",
      "days_since_registration": 2,
      "estimated_verification_date": "2025-12-22",
      "documents_status": {
        "total_required": 3,
        "uploaded": 2,
        "verified": 1,
        "rejected": 0,
        "required_documents": [
          {
            "type": "business_license",
            "status": "verified"
          },
          {
            "type": "tax_certificate",
            "status": "pending_review"
          }
        ]
      },
      "registered_by_hunter": {
        "name": "John Moyo",
        "phone": "+263712345678"
      }
    }
    ```

- [ ] `GET /api/v1/merchants/me/documents`
  - List merchant's own documents
  - Show verification status per document
  - Provide download links (if verified)

**Tests:**
- [ ] Status calculation
- [ ] Document counting
- [ ] Timeline estimation
- [ ] Hunter info retrieval

**Deliverables:**
- Merchant can track onboarding progress
- Merchant can view documents

---

## Phase 6: Integration & Admin Features (Weeks 11-12)

### 6.1 Admin Dashboard Endpoints

**Tasks:**
- [ ] `GET /api/v1/admin/merchants`
  - Filter: status, created_date_range
  - Sort: newest, pending_docs, needs_review
  - Pagination
  - Bulk actions: verify, reject

- [ ] `GET /api/v1/admin/hunters`
  - List all hunters
  - Performance metrics
  - Target progress
  - Activity log

- [ ] `PATCH /api/v1/admin/merchants/:id/status`
  - Change merchant status
  - Verify, reject, or mark dormant
  - Admin note
  - Send notifications

**Deliverables:**
- Admin management endpoints

---

### 6.2 Analytics & Reporting

**Tasks:**
- [ ] `GET /api/v1/reports/merchants`
  - Merchants registered per day/week/month
  - Conversion rate trends
  - Rejection reasons
  - Category breakdown

- [ ] `GET /api/v1/reports/hunters`
  - Hunter performance comparison
  - Target attainment
  - Activity patterns
  - Top performers

- [ ] Export functionality
  - Export to CSV
  - Export to PDF
  - Filtered reports

**Deliverables:**
- Analytics & reporting system

---

## Phase 7: Testing & QA (Weeks 13-14)

### 7.1 Unit Tests

**Tasks:**
- [ ] JWT tests (20 tests)
  - Token generation
  - Token verification
  - Token expiration
  - Token rotation

- [ ] Password tests (10 tests)
  - Hash generation
  - Hash verification
  - Strength validation
  - Edge cases

- [ ] Validator tests (30 tests)
  - Phone number validation
  - Email validation
  - Input sanitization
  - Business rules

- [ ] Database query tests (25 tests)
  - CRUD operations
  - Transactions
  - Error handling
  - Edge cases

**Target:** 85%+ code coverage

---

### 7.2 Integration Tests

**Tasks:**
- [ ] Authentication flow (20 tests)
  - Hunter login/logout/refresh
  - Merchant login (password + OTP)
  - Token expiration
  - Invalid credentials

- [ ] Merchant onboarding flow (25 tests)
  - Duplicate detection
  - Onboarding transaction
  - Activity logging
  - Stats update

- [ ] Document upload flow (15 tests)
  - File validation
  - S3 upload
  - Metadata storage
  - Download URL generation

- [ ] Authorization tests (15 tests)
  - Hunter can't access other's merchants
  - Merchant can only see own data
  - Admin-only endpoints
  - Role-based access

**Target:** All critical flows tested

---

### 7.3 Load Testing

**Tasks:**
- [ ] Create load test scenarios
  - 1000 simultaneous hunters
  - 5000 merchant registrations per day
  - 10K document uploads per day
  - Database connection pool stress

- [ ] Run load tests
  - Response time p99 < 500ms
  - Error rate < 0.1%
  - Database pool not exhausted

- [ ] Optimize bottlenecks
  - Database indexes
  - Query optimization
  - Caching strategy

**Deliverables:**
- Load test report
- Performance optimization complete

---

### 7.4 Security Testing

**Tasks:**
- [ ] OWASP Top 10 scan
  - SQL injection (automated scan)
  - XSS prevention
  - CSRF protection
  - Authentication bypass
  - Authorization flaws

- [ ] Penetration testing
  - Manual security review
  - Attack scenario testing
  - Vulnerability assessment

- [ ] Security audit
  - Password hashing verification
  - Token security
  - File upload security
  - Rate limiting effectiveness

**Deliverables:**
- Security audit report
- All vulnerabilities fixed

---

## Phase 8: Documentation & Deployment (Weeks 15-16)

### 8.1 Documentation

**Tasks:**
- [ ] API documentation
  - OpenAPI/Swagger specification
  - Postman collection
  - Example requests/responses
  - Error code reference

- [ ] Deployment guide
  - Environment setup
  - Database migration steps
  - Monitoring setup
  - Backup procedures
  - Disaster recovery plan

- [ ] Operational runbook
  - How to deploy
  - How to rollback
  - How to scale
  - How to monitor
  - Common issues & solutions

**Deliverables:**
- Complete API documentation
- Deployment procedures
- Operational guides

---

### 8.2 Staging Deployment

**Tasks:**
- [ ] Deploy to staging
  - Run database migrations
  - Deploy application code
  - Verify all endpoints
  - Test against staging database

- [ ] Final QA
  - Smoke tests (all endpoints)
  - Integration tests (complete flows)
  - Performance baseline
  - Security verification

- [ ] Stakeholder testing
  - Admin tests features
  - Hunter tests onboarding
  - Merchant tests portal
  - Feedback collection

**Deliverables:**
- Staging environment fully operational
- QA sign-off

---

### 8.3 Production Deployment

**Tasks:**
- [ ] Pre-deployment checklist
  - [ ] All tests passing
  - [ ] Code review complete
  - [ ] Security audit passed
  - [ ] Backups verified
  - [ ] Rollback plan ready
  - [ ] Monitoring configured
  - [ ] Alerting enabled

- [ ] Deploy to production
  - [ ] Blue-green deployment (zero downtime)
  - [ ] Database migrations
  - [ ] Verify endpoints
  - [ ] Monitor metrics
  - [ ] Check error logs

- [ ] Post-deployment
  - [ ] Smoke tests pass
  - [ ] Metrics normal
  - [ ] No error spikes
  - [ ] Stakeholder confirmation

**Deliverables:**
- Live production API
- All systems operational
- Team trained on operations

---

## Success Criteria

### Functional Requirements Met
- [ ] ✅ Hunter authentication working
- [ ] ✅ Merchant authentication working (password + OTP)
- [ ] ✅ Merchant onboarding flow complete
- [ ] ✅ Document upload & management working
- [ ] ✅ Merchant portal functional
- [ ] ✅ Admin verification workflow working
- [ ] ✅ Reporting & analytics available
- [ ] ✅ All APIs documented
- [ ] ✅ Full traceability (audit trail)

### Non-Functional Requirements Met
- [ ] ✅ 99.9% uptime SLA
- [ ] ✅ Response time p99 < 500ms
- [ ] ✅ Error rate < 0.1%
- [ ] ✅ Zero data loss (backups verified)
- [ ] ✅ OWASP Top 10 compliant
- [ ] ✅ Rate limiting active
- [ ] ✅ Monitoring & alerting working
- [ ] ✅ Disaster recovery plan tested

### Deliverables Checklist
- [ ] ✅ Prisma schema (all tables)
- [ ] ✅ API endpoints (40+ routes)
- [ ] ✅ Authentication system
- [ ] ✅ File upload system
- [ ] ✅ Database transactions
- [ ] ✅ Activity logging
- [ ] ✅ Admin features
- [ ] ✅ Test suite (100+ tests)
- [ ] ✅ Security audit passed
- [ ] ✅ Performance baseline established
- [ ] ✅ Documentation complete
- [ ] ✅ Operations guide ready
- [ ] ✅ Production deployment complete

---

## Risk Mitigation

### Risk: Database Performance Issues
**Mitigation:** 
- Load test early (Week 6)
- Implement caching (Redis)
- Add read replicas if needed
- Regular query optimization

### Risk: Security Vulnerabilities
**Mitigation:**
- Weekly security audits during development
- OWASP checklist for every endpoint
- Penetration testing before production
- Bug bounty program post-launch

### Risk: Integration with Existing Marketplace
**Mitigation:**
- Isolated transactions (no impact on marketplace)
- Read-only access to existing tables initially
- Gradual rollout (hunters first, then merchants)
- Parallel data validation period

### Risk: Data Loss
**Mitigation:**
- Daily automated backups
- Monthly full backups
- Weekly restore testing
- Geo-redundant storage

---

## Resource Requirements

### Team
- 2 Backend Engineers
- 1 DevOps Engineer
- 1 QA Engineer
- 1 Product Manager

### Infrastructure
- PostgreSQL server (cloud managed: AWS RDS/GCP Cloud SQL)
- S3 bucket for file storage
- CDN for file serving
- Load balancer
- Redis for caching (optional)
- Monitoring: CloudWatch/DataDog
- Error tracking: Sentry
- CI/CD: GitHub Actions

### Services
- Email/SMS for notifications: AWS SES / Twilio
- Authentication: JWT (built-in)
- Payment processing: Stripe (if needed)
- Analytics: Mixpanel / Segment

---

## Go-Live Checklist

- [ ] Production database initialized & backed up
- [ ] Monitoring & alerting active
- [ ] Team trained on operations
- [ ] Support documentation complete
- [ ] Incident response procedures ready
- [ ] Rollback plan tested
- [ ] Security audit passed
- [ ] All tests passing in production environment
- [ ] Performance baselines established
- [ ] Load testing completed
- [ ] Stakeholder sign-off obtained
- [ ] Go-live announcement scheduled

---

## Post-Launch (Week 17+)

- Monitor system performance & stability
- Gather feedback from hunters & merchants
- Plan Phase 2 features (mapping, advanced analytics, etc.)
- Continuous security monitoring
- Regular optimization & scaling
- Feature enhancements based on feedback

---

## Summary

This 16-week roadmap provides a comprehensive, phased approach to building and deploying the FieldPro Harare backend. By following this plan:

1. **Weeks 1-2:** Foundation solid
2. **Weeks 3-4:** Authentication working
3. **Weeks 5-6:** Core onboarding logic
4. **Weeks 7-8:** Document management
5. **Weeks 9-10:** Merchant portal live
6. **Weeks 11-12:** Admin features ready
7. **Weeks 13-14:** Fully tested
8. **Weeks 15-16:** Production deployed

The system will be:
- ✅ Secure (JWT, password hashing, rate limiting)
- ✅ Scalable (indexed queries, caching ready)
- ✅ Reliable (transactions, backups, monitoring)
- ✅ Maintainable (clean code, tests, documentation)
- ✅ Production-ready

---

**Document Version:** 1.0  
**Created:** January 17, 2026  
**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 (Week 1)

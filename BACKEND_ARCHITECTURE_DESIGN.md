# FieldPro Harare - Production Backend Architecture Design

**Version:** 1.0  
**Date:** January 17, 2026  
**Status:** Design Specification (Pre-Implementation)

---

## Executive Summary

This document defines the complete backend architecture for FieldPro Harare, a PWA for merchant hunters (sales agents) who onboard merchants in the field. The system integrates with an existing marketplace database while maintaining strict data isolation and traceability.

### Key Design Principles

1. **No Duplication** - Merchants stored once in shared marketplace tables
2. **Full Traceability** - Every merchant linked to onboarding agent
3. **Separation of Concerns** - Agent auth ≠ Merchant auth
4. **Data Integrity** - Foreign keys enforce relationships
5. **Production-Ready** - Security, error handling, audit trails

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FIELDPRO HARARE PWA                       │
│            (Frontend - React/Next.js/TypeScript)             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  FIELDPRO API LAYER                          │
│   (Next.js API Routes / Backend Logic)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ Auth Service │  │ Merchant Svc │  │ Hunter Service │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│              SHARED POSTGRESQL DATABASE                      │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ MARKETPLACE     │  │ FIELDPRO TABLES  │                 │
│  │                 │  │                  │                 │
│  │ • merchants     │  │ • merchant_      │                 │
│  │ • merchant_     │  │   hunters        │                 │
│  │   profiles      │  │ • merchant_      │                 │
│  │ • categories    │  │   hunter_        │                 │
│  │                 │  │   merchants      │                 │
│  │                 │  │ • merchant_      │                 │
│  │                 │  │   onboarding_    │                 │
│  │                 │  │   documents      │                 │
│  │                 │  │ • merchant_      │                 │
│  │                 │  │   activity_logs  │                 │
│  │                 │  │ • agent_targets  │                 │
│  │                 │  │ • agent_         │                 │
│  │                 │  │   performance_   │                 │
│  │                 │  │   metrics        │                 │
│  └─────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### PART 1: MARKETPLACE TABLES (EXISTING - DO NOT MODIFY)

Assumed structure based on typical marketplace platforms:

```sql
-- Existing marketplace tables (read-only in FieldPro context)
CREATE TABLE merchants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  business_registration_number VARCHAR(100),
  business_category_id INTEGER REFERENCES categories(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(phone),
  UNIQUE(email),
  UNIQUE(business_registration_number)
);

CREATE TABLE merchant_profiles (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  physical_address VARCHAR(500),
  gps_coordinates POINT,
  business_hours JSONB,
  average_revenue DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(merchant_id)
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PART 2: FIELDPRO HUNTER MANAGEMENT TABLES

#### Table 1: merchant_hunters (Agent Accounts)

```sql
CREATE TABLE merchant_hunters (
  id SERIAL PRIMARY KEY,
  
  -- Identity & Auth
  user_id BIGINT NOT NULL,  -- Reference to existing user system
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_image_url VARCHAR(500),
  
  -- Status & Metadata
  status VARCHAR(50) DEFAULT 'active',  -- active, inactive, suspended
  zone VARCHAR(100),  -- Zone/area assigned to hunter
  assigned_territory JSONB,  -- GeoJSON polygon or detailed info
  
  -- Performance Tracking
  total_onboarded_count INTEGER DEFAULT 0,
  total_leads_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Verification
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_document_id VARCHAR(100),
  identity_verification_date TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id BIGINT,  -- Admin who created this account
  
  -- Constraints
  CONSTRAINT hunters_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT hunters_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_merchant_hunters_email ON merchant_hunters(email);
CREATE INDEX idx_merchant_hunters_status ON merchant_hunters(status);
CREATE INDEX idx_merchant_hunters_zone ON merchant_hunters(zone);
```

#### Table 2: merchant_hunter_merchants (Linking Junction)

```sql
CREATE TABLE merchant_hunter_merchants (
  id SERIAL PRIMARY KEY,
  
  -- Foreign Keys
  merchant_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id) ON DELETE RESTRICT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
  
  -- Relationship Metadata
  onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  onboarding_status VARCHAR(50) DEFAULT 'pending_verification',  
  -- pending_verification, verified, rejected, dormant
  
  -- Hunter's Status on This Merchant
  is_primary_hunter BOOLEAN DEFAULT TRUE,  -- Main agent responsible
  
  -- Tracking
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_completed_at TIMESTAMP,
  
  -- Notes
  hunter_notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints & Indexes
  UNIQUE(merchant_hunter_id, merchant_id),  -- One hunter per merchant
  CONSTRAINT status_check CHECK (onboarding_status IN 
    ('pending_verification', 'verified', 'rejected', 'dormant')),
  
  FOREIGN KEY (merchant_hunter_id) REFERENCES merchant_hunters(id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

CREATE INDEX idx_mhm_hunter ON merchant_hunter_merchants(merchant_hunter_id);
CREATE INDEX idx_mhm_merchant ON merchant_hunter_merchants(merchant_id);
CREATE INDEX idx_mhm_status ON merchant_hunter_merchants(onboarding_status);
CREATE INDEX idx_mhm_onboarded_at ON merchant_hunter_merchants(onboarded_at);
```

**Business Logic:**
- One merchant can only be onboarded by ONE primary hunter
- Updates flow through `last_activity_at`
- Status progression: `pending_verification` → `verified` or `rejected`

#### Table 3: merchant_onboarding_documents

```sql
CREATE TABLE merchant_onboarding_documents (
  id SERIAL PRIMARY KEY,
  
  -- Linking
  merchant_hunter_merchant_id INTEGER NOT NULL REFERENCES merchant_hunter_merchants(id) ON DELETE CASCADE,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id) ON DELETE CASCADE,
  
  -- Document Details
  document_type VARCHAR(100) NOT NULL,  
  -- business_license, national_id, tax_certificate, bank_statement, etc.
  document_name VARCHAR(255) NOT NULL,
  s3_url VARCHAR(500) NOT NULL,  -- Cloud storage reference
  s3_key VARCHAR(500) NOT NULL,  -- For deletion/retrieval
  file_size_bytes BIGINT,
  file_mimetype VARCHAR(100),
  
  -- OCR & Verification
  ocr_extracted_data JSONB,  -- Extracted text from document
  is_verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  verified_by_admin_id BIGINT,
  verified_at TIMESTAMP,
  
  -- Upload Metadata
  uploaded_by_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Sequence
  document_sequence_number INTEGER,  -- Order uploaded
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT document_type_check CHECK (document_type IN 
    ('business_license', 'national_id', 'tax_certificate', 
     'bank_statement', 'proof_of_address', 'other')),
  
  FOREIGN KEY (merchant_hunter_merchant_id) REFERENCES merchant_hunter_merchants(id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  FOREIGN KEY (merchant_hunter_id) REFERENCES merchant_hunters(id)
);

CREATE INDEX idx_documents_merchant ON merchant_onboarding_documents(merchant_id);
CREATE INDEX idx_documents_hunter ON merchant_onboarding_documents(merchant_hunter_id);
CREATE INDEX idx_documents_type ON merchant_onboarding_documents(document_type);
CREATE INDEX idx_documents_verified ON merchant_onboarding_documents(is_verified);
```

#### Table 4: merchant_activity_logs (Audit Trail)

```sql
CREATE TABLE merchant_activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- What
  activity_type VARCHAR(100) NOT NULL,
  -- merchant_created, merchant_updated, document_uploaded, 
  -- merchant_verified, status_changed, hunter_assigned, etc.
  
  -- Who
  merchant_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id),
  
  -- What Changed
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
  merchant_hunter_merchant_id INTEGER REFERENCES merchant_hunter_merchants(id) ON DELETE SET NULL,
  
  -- Details
  activity_description TEXT,
  changes JSONB,  -- {old_status: 'pending', new_status: 'verified'}
  metadata JSONB,  -- Additional context
  
  -- IP & Context
  ip_address INET,
  user_agent VARCHAR(500),
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT activity_type_check CHECK (activity_type IN 
    ('merchant_created', 'merchant_updated', 'document_uploaded',
     'merchant_verified', 'status_changed', 'hunter_assigned',
     'merchant_rejected', 'merchant_dormant'))
);

CREATE INDEX idx_logs_hunter ON merchant_activity_logs(merchant_hunter_id);
CREATE INDEX idx_logs_merchant ON merchant_activity_logs(merchant_id);
CREATE INDEX idx_logs_type ON merchant_activity_logs(activity_type);
CREATE INDEX idx_logs_created_at ON merchant_activity_logs(created_at);
```

#### Table 5: agent_targets

```sql
CREATE TABLE agent_targets (
  id SERIAL PRIMARY KEY,
  
  -- Hunter & Period
  merchant_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id) ON DELETE CASCADE,
  target_period VARCHAR(50) NOT NULL,  -- weekly, monthly, quarterly
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Goals
  merchants_to_onboard INTEGER NOT NULL,
  leads_to_collect INTEGER NOT NULL,
  
  -- Progress
  merchants_onboarded INTEGER DEFAULT 0,
  leads_collected INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_admin_id BIGINT,
  
  CONSTRAINT target_period_check CHECK (target_period IN ('weekly', 'monthly', 'quarterly')),
  CONSTRAINT valid_dates CHECK (period_start_date <= period_end_date),
  UNIQUE(merchant_hunter_id, period_start_date, period_end_date)
);

CREATE INDEX idx_targets_hunter ON agent_targets(merchant_hunter_id);
CREATE INDEX idx_targets_period ON agent_targets(period_start_date, period_end_date);
CREATE INDEX idx_targets_active ON agent_targets(is_active);
```

#### Table 6: agent_performance_metrics

```sql
CREATE TABLE agent_performance_metrics (
  id SERIAL PRIMARY KEY,
  
  -- Hunter & Date
  merchant_hunter_id INTEGER NOT NULL REFERENCES merchant_hunters(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Daily Metrics
  field_visits INTEGER DEFAULT 0,
  merchants_approached INTEGER DEFAULT 0,
  merchants_onboarded INTEGER DEFAULT 0,
  leads_collected INTEGER DEFAULT 0,
  
  -- Quality Metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,  -- 0-100%
  documents_uploaded INTEGER DEFAULT 0,
  documents_verified INTEGER DEFAULT 0,
  
  -- Status
  merchants_pending_verification INTEGER DEFAULT 0,
  merchants_verified INTEGER DEFAULT 0,
  merchants_rejected INTEGER DEFAULT 0,
  
  -- Distance & Time
  distance_covered_km DECIMAL(8,2),
  hours_in_field INTEGER,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(merchant_hunter_id, metric_date),
  CONSTRAINT conversion_rate_check CHECK (conversion_rate >= 0 AND conversion_rate <= 100)
);

CREATE INDEX idx_metrics_hunter ON agent_performance_metrics(merchant_hunter_id);
CREATE INDEX idx_metrics_date ON agent_performance_metrics(metric_date);
CREATE INDEX idx_metrics_hunter_date ON agent_performance_metrics(merchant_hunter_id, metric_date);
```

---

## Authentication & Authorization Design

### Agent/Merchant Hunter Authentication

**Flow:**

```
┌──────────────────────────────────────────────┐
│ Login Form (Email + Password)                │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ POST /api/auth/hunters/login                │
│ - Validate email format                      │
│ - Hash password (bcryptjs)                   │
│ - Compare with merchant_hunters.password_hash│
│ - Return JWT token + refresh token          │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Store JWT in localStorage/sessionStorage     │
│ Include in Authorization header:             │
│ "Authorization: Bearer <jwt_token>"          │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ Middleware validates JWT on every request    │
│ Attaches hunter ID to request context        │
└──────────────────────────────────────────────┘
```

**JWT Payload (Agent):**

```json
{
  "sub": "merchant_hunter_123",
  "email": "john.moyo@fieldpro.com",
  "hunter_id": 123,
  "role": "merchant_hunter",
  "status": "active",
  "iat": 1705424000,
  "exp": 1705510400
}
```

### Merchant Authentication (NEW)

**Problem:** Merchants need to check onboarding status independently

**Solution: Merchant Portal Authentication**

```
┌────────────────────────────────┐
│ Merchant Login Portal          │
│ (Phone or Business License #)  │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ POST /api/auth/merchants/login │
│ - Phone + Password or          │
│ - Business License + OTP       │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Lookup: merchants.phone        │
│ or                             │
│ merchants.business_license_num │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Return JWT with merchant_id    │
│ Role: "merchant"               │
└────────────────────────────────┘
```

**JWT Payload (Merchant):**

```json
{
  "sub": "merchant_456",
  "merchant_id": 456,
  "business_name": "Zim-Express Retail",
  "role": "merchant",
  "iat": 1705424000,
  "exp": 1705510400
}
```

**Key Difference:**

| Hunter | Merchant |
|--------|----------|
| Email + Password | Phone + Password or License + OTP |
| Can see all own merchants | Can only see own profile/status |
| Can upload documents | Can view documents |
| Middleware: `@requireHunter` | Middleware: `@requireMerchant` |

---

## API Endpoint Specification

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 Hunter Login

```http
POST /api/auth/hunters/login
Content-Type: application/json

{
  "email": "john.moyo@fieldpro.com",
  "password": "SecurePassword123"
}

RESPONSE 200 OK:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "hunter": {
    "id": 123,
    "first_name": "John",
    "last_name": "Moyo",
    "email": "john.moyo@fieldpro.com",
    "status": "active",
    "total_onboarded_count": 45,
    "conversion_rate": 78.5
  }
}

RESPONSE 401 Unauthorized:
{
  "success": false,
  "error": "Invalid credentials"
}
```

#### 1.2 Hunter Refresh Token

```http
POST /api/auth/hunters/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

RESPONSE 200 OK:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

#### 1.3 Hunter Logout

```http
POST /api/auth/hunters/logout
Authorization: Bearer <token>

RESPONSE 200 OK:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 1.4 Merchant Login

```http
POST /api/auth/merchants/login
Content-Type: application/json

{
  "phone": "+263712345678",
  "password": "MerchantPassword123"
}

RESPONSE 200 OK:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "merchant": {
    "id": 456,
    "name": "Zim-Express Retail",
    "owner_name": "John Moyo",
    "phone": "+263712345678",
    "email": "john@zimexpress.com"
  }
}
```

#### 1.5 Merchant Login via OTP (Alternative)

```http
POST /api/auth/merchants/request-otp
Content-Type: application/json

{
  "phone": "+263712345678"
}

RESPONSE 200 OK:
{
  "success": true,
  "message": "OTP sent to phone",
  "otp_request_id": "otp_req_12345"
}

---

POST /api/auth/merchants/verify-otp
Content-Type: application/json

{
  "otp_request_id": "otp_req_12345",
  "otp": "123456"
}

RESPONSE 200 OK:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2. MERCHANT ONBOARDING ENDPOINTS

#### 2.1 Check Merchant Existence

```http
POST /api/merchants/check-existence
Authorization: Bearer <hunter_token>
Content-Type: application/json

{
  "phone": "+263712345678",
  "email": "john@zimexpress.com",
  "business_name": "Zim-Express Retail",
  "business_registration_number": "BRN123456"
}

RESPONSE 200 OK:
{
  "success": true,
  "exists": false,
  "message": "Merchant does not exist"
}

RESPONSE 200 OK (EXISTS):
{
  "success": true,
  "exists": true,
  "merchant": {
    "id": 456,
    "name": "Zim-Express Retail",
    "phone": "+263712345678",
    "status": "verified",
    "onboarded_by": "Jane Doe",  // Previous hunter
    "onboarded_at": "2025-11-15T10:30:00Z"
  },
  "message": "Merchant already exists"
}
```

#### 2.2 Register New Merchant

```http
POST /api/merchants/onboard
Authorization: Bearer <hunter_token>
Content-Type: application/json

{
  "name": "Harare Fresh Mart",
  "owner_name": "Sarah Phiri",
  "email": "sarah@freshmart.com",
  "phone": "+263712345679",
  "business_category_id": 2,
  "business_registration_number": "BRN789012",
  "physical_address": "First Street Mall, Shop 15, Harare",
  "gps_latitude": -17.8252,
  "gps_longitude": 31.0335
}

RESPONSE 201 Created:
{
  "success": true,
  "merchant": {
    "id": 789,
    "name": "Harare Fresh Mart",
    "phone": "+263712345679",
    "status": "pending_verification",
    "onboarded_at": "2025-12-20T14:22:30Z"
  },
  "merchant_hunter_id": 123,
  "onboarding_id": "mhm_999",
  "message": "Merchant registered successfully"
}

RESPONSE 409 Conflict:
{
  "success": false,
  "error": "Merchant with this phone already exists",
  "existing_merchant_id": 456
}

RESPONSE 400 Bad Request:
{
  "success": false,
  "errors": [
    "Phone number format invalid",
    "Email already registered"
  ]
}
```

#### 2.3 Update Merchant Profile

```http
PATCH /api/merchants/:merchant_id
Authorization: Bearer <hunter_token>
Content-Type: application/json

{
  "owner_name": "Sarah Phiri Updated",
  "email": "sarah.new@freshmart.com",
  "phone": "+263712345679"
}

RESPONSE 200 OK:
{
  "success": true,
  "merchant": {
    "id": 789,
    "name": "Harare Fresh Mart",
    "owner_name": "Sarah Phiri Updated",
    "email": "sarah.new@freshmart.com",
    "updated_at": "2025-12-20T15:00:00Z"
  }
}
```

---

### 3. DOCUMENT MANAGEMENT ENDPOINTS

#### 3.1 Upload Document

```http
POST /api/merchants/:merchant_id/documents/upload
Authorization: Bearer <hunter_token>
Content-Type: multipart/form-data

form-data:
  - file: <binary_file>
  - document_type: "business_license"
  - document_name: "Business_License_2024.pdf"

RESPONSE 201 Created:
{
  "success": true,
  "document": {
    "id": 1001,
    "merchant_id": 789,
    "document_type": "business_license",
    "document_name": "Business_License_2024.pdf",
    "s3_url": "https://s3.amazonaws.com/fieldpro/merchants/789/business_license_123.pdf",
    "uploaded_at": "2025-12-20T15:30:00Z",
    "is_verified": false
  },
  "message": "Document uploaded successfully"
}

RESPONSE 400 Bad Request:
{
  "success": false,
  "error": "File size exceeds 10MB limit"
}
```

#### 3.2 List Merchant Documents

```http
GET /api/merchants/:merchant_id/documents
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "merchant_id": 789,
  "documents": [
    {
      "id": 1001,
      "document_type": "business_license",
      "document_name": "Business_License_2024.pdf",
      "uploaded_at": "2025-12-20T15:30:00Z",
      "is_verified": true,
      "verified_at": "2025-12-21T09:00:00Z"
    },
    {
      "id": 1002,
      "document_type": "national_id",
      "document_name": "ID_Certificate.pdf",
      "uploaded_at": "2025-12-20T16:00:00Z",
      "is_verified": false
    }
  ],
  "total_count": 2
}
```

#### 3.3 Get Document Details

```http
GET /api/merchants/:merchant_id/documents/:document_id
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "document": {
    "id": 1001,
    "merchant_id": 789,
    "document_type": "business_license",
    "document_name": "Business_License_2024.pdf",
    "s3_url": "https://s3.amazonaws.com/...",
    "file_size_bytes": 2048000,
    "file_mimetype": "application/pdf",
    "uploaded_at": "2025-12-20T15:30:00Z",
    "uploaded_by": "John Moyo",
    "is_verified": true,
    "verified_at": "2025-12-21T09:00:00Z",
    "verified_by": "Admin User",
    "ocr_data": {
      "extracted_text": "Business License Number: BRN789012...",
      "confidence_score": 0.95
    }
  }
}
```

#### 3.4 Delete Document

```http
DELETE /api/merchants/:merchant_id/documents/:document_id
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### 4. MERCHANT QUERY ENDPOINTS

#### 4.1 Get Merchants Onboarded by Hunter

```http
GET /api/hunters/me/merchants?status=pending_verification&page=1&limit=20
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "hunter_id": 123,
  "merchants": [
    {
      "id": 789,
      "name": "Harare Fresh Mart",
      "owner_name": "Sarah Phiri",
      "phone": "+263712345679",
      "status": "pending_verification",
      "onboarded_at": "2025-12-20T14:22:30Z",
      "documents_count": 2,
      "documents_verified_count": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### 4.2 Get Merchant Detail

```http
GET /api/merchants/:merchant_id
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "merchant": {
    "id": 789,
    "name": "Harare Fresh Mart",
    "owner_name": "Sarah Phiri",
    "email": "sarah@freshmart.com",
    "phone": "+263712345679",
    "status": "pending_verification",
    "category": "Grocery",
    "physical_address": "First Street Mall",
    "gps_coordinates": {
      "latitude": -17.8252,
      "longitude": 31.0335
    },
    "onboarded_at": "2025-12-20T14:22:30Z",
    "onboarded_by_hunter": {
      "id": 123,
      "name": "John Moyo"
    },
    "documents": [
      {
        "id": 1001,
        "type": "business_license",
        "verified": true
      }
    ],
    "activity_log": [
      {
        "type": "merchant_created",
        "timestamp": "2025-12-20T14:22:30Z",
        "description": "Merchant registered by John Moyo"
      }
    ]
  }
}
```

#### 4.3 Get Merchant by Phone (Portal)

```http
GET /api/merchants/lookup?phone=+263712345679
Authorization: Bearer <merchant_token>

RESPONSE 200 OK:
{
  "success": true,
  "merchant": {
    "id": 789,
    "name": "Harare Fresh Mart",
    "owner_name": "Sarah Phiri",
    "status": "verified",
    "onboarded_at": "2025-12-20T14:22:30Z",
    "documents_verified_count": 3,
    "onboarding_progress": 100
  }
}
```

---

### 5. HUNTER PROFILE & STATS ENDPOINTS

#### 5.1 Get Hunter Profile

```http
GET /api/hunters/me
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "hunter": {
    "id": 123,
    "first_name": "John",
    "last_name": "Moyo",
    "email": "john.moyo@fieldpro.com",
    "phone": "+263712345678",
    "zone": "Harare CBD",
    "profile_image_url": "https://...",
    "total_onboarded_count": 45,
    "total_leads_count": 120,
    "conversion_rate": 78.5,
    "status": "active",
    "identity_verified": true,
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

#### 5.2 Get Hunter Statistics

```http
GET /api/hunters/me/stats?period=this_week
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "hunter_id": 123,
  "period": "this_week",
  "stats": {
    "field_visits": 42,
    "merchants_approached": 28,
    "merchants_onboarded": 12,
    "leads_collected": 45,
    "conversion_rate": 42.86,
    "documents_uploaded": 8,
    "documents_verified": 5,
    "pending_verification": 3,
    "verified": 8,
    "rejected": 1,
    "distance_covered_km": 156.5,
    "hours_in_field": 38
  },
  "comparison_to_previous_period": {
    "merchants_onboarded": "+2",
    "conversion_rate": "-5.2%"
  }
}
```

#### 5.3 Get Target Progress

```http
GET /api/hunters/me/targets?period=this_month
Authorization: Bearer <hunter_token>

RESPONSE 200 OK:
{
  "success": true,
  "hunter_id": 123,
  "targets": [
    {
      "id": 501,
      "target_period": "monthly",
      "period_start_date": "2025-12-01",
      "period_end_date": "2025-12-31",
      "merchants_to_onboard": 30,
      "merchants_onboarded": 18,
      "progress_percentage": 60,
      "leads_to_collect": 75,
      "leads_collected": 45,
      "days_remaining": 11
    }
  ]
}
```

---

### 6. ONBOARDING STATUS ENDPOINTS (MERCHANT PORTAL)

#### 6.1 Get My Onboarding Status

```http
GET /api/merchants/me/onboarding-status
Authorization: Bearer <merchant_token>

RESPONSE 200 OK:
{
  "success": true,
  "merchant_id": 789,
  "status": "pending_verification",
  "onboarding_timeline": {
    "registered_on": "2025-12-20T14:22:30Z",
    "days_since_registration": 2,
    "estimated_verification_date": "2025-12-22"
  },
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

---

## Backend Logic Flow

### Flow 1: Agent Onboards a New Merchant

```
Step 1: Agent Login
  ├─ POST /api/auth/hunters/login
  ├─ Validate credentials
  ├─ Generate JWT token
  └─ Return token

Step 2: Check Merchant Existence
  ├─ POST /api/merchants/check-existence
  ├─ Query merchants table (phone, email, brn)
  ├─ If exists: Return existing merchant data
  └─ If not: Proceed to Step 3

Step 3: Register Merchant
  ├─ POST /api/merchants/onboard
  ├─ Validate merchant data (schema)
  ├─ BEGIN TRANSACTION
  │  ├─ Insert into merchants table
  │  │  ├─ name, owner_name, email, phone
  │  │  ├─ business_category_id, status='pending'
  │  │  ├─ Return merchant_id
  │  │
  │  ├─ Insert into merchant_profiles table
  │  │  ├─ merchant_id, gps_coordinates
  │  │  ├─ physical_address
  │  │
  │  ├─ Insert into merchant_hunter_merchants table
  │  │  ├─ merchant_hunter_id (from JWT)
  │  │  ├─ merchant_id (newly created)
  │  │  ├─ onboarding_status='pending_verification'
  │  │  ├─ is_primary_hunter=true
  │  │  ├─ Return merchant_hunter_merchant_id
  │  │
  │  ├─ Insert into merchant_activity_logs
  │  │  ├─ activity_type='merchant_created'
  │  │  ├─ merchant_hunter_id
  │  │  ├─ merchant_id
  │  │  ├─ changes = {status: 'pending'}
  │  │
  │  ├─ Update merchant_hunters stats
  │  │  └─ total_onboarded_count += 1
  │  │
  │  └─ COMMIT
  │
  ├─ Handle errors: ROLLBACK if any step fails
  └─ Return success response

Step 4: Upload Documents
  ├─ POST /api/merchants/{id}/documents/upload
  ├─ Validate file (type, size < 10MB)
  ├─ Upload to S3 (or cloud storage)
  ├─ Insert into merchant_onboarding_documents
  │  ├─ s3_url, s3_key, file info
  │  ├─ ocr_extracted_data (optional)
  │  └─ document_sequence_number
  ├─ Insert activity log
  └─ Return document reference

Step 5: Submit for Verification
  ├─ PATCH /api/merchants/{id}
  ├─ All required documents uploaded?
  ├─ YES: Update merchant_hunter_merchants
  │     └─ onboarding_status='pending_verification'
  ├─ Insert activity log
  └─ Send notification to admin
```

### Flow 2: Merchant Checks Onboarding Status

```
Step 1: Merchant Login
  ├─ POST /api/auth/merchants/login
  ├─ Lookup merchants.phone
  ├─ Verify password or OTP
  └─ Return JWT token

Step 2: Get Onboarding Status
  ├─ GET /api/merchants/me/onboarding-status
  ├─ Query merchant record
  ├─ Query merchant_hunter_merchants
  │  └─ Get status, onboarding_date, hunter info
  ├─ Query merchant_onboarding_documents
  │  └─ Get document status, verified count
  ├─ Calculate progress & timeline
  └─ Return comprehensive status object

Step 3: View Documents
  ├─ GET /api/merchants/:id/documents
  ├─ Return all merchant's documents
  ├─ Show verification status per document
  └─ Provide download links (if verified)
```

### Flow 3: Admin Verifies Merchant

```
Step 1: Admin Reviews
  ├─ Query all pending merchants
  ├─ Review uploaded documents
  └─ Make decision: verify, request more docs, or reject

Step 2: Update Merchant Status
  ├─ PATCH /api/merchants/:id/verify
  ├─ BEGIN TRANSACTION
  │  ├─ Update merchant_hunter_merchants
  │  │  └─ onboarding_status='verified'
  │  │     verified_at=now()
  │  ├─ Update merchant_onboarding_documents
  │  │  └─ is_verified=true, verified_by_admin_id
  │  ├─ Update merchants
  │  │  └─ status='verified'
  │  ├─ Insert activity log
  │  └─ COMMIT
  └─ Send notification to merchant & hunter
```

---

## Error Handling & Validation

### Request Validation

```typescript
// Example: Merchant onboarding payload validation
const onboardMerchantSchema = {
  name: {
    type: "string",
    minLength: 3,
    maxLength: 255,
    required: true
  },
  owner_name: {
    type: "string",
    minLength: 3,
    maxLength: 255,
    required: true
  },
  phone: {
    type: "string",
    pattern: "^\\+?[0-9]{10,15}$",
    required: true,
    unique: true  // Check in database
  },
  email: {
    type: "string",
    pattern: "email",
    required: true,
    unique: true
  },
  business_registration_number: {
    type: "string",
    pattern: "^[A-Z0-9]{6,20}$",
    required: true,
    unique: true
  },
  gps_latitude: {
    type: "number",
    min: -90,
    max: 90,
    required: true
  },
  gps_longitude: {
    type: "number",
    min: -180,
    max: 180,
    required: true
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Merchant retrieved |
| 201 | Created | Merchant registered |
| 400 | Bad Request | Invalid phone format |
| 401 | Unauthorized | Token expired |
| 403 | Forbidden | Hunter trying to access another's merchant |
| 404 | Not Found | Merchant doesn't exist |
| 409 | Conflict | Merchant phone already exists |
| 422 | Unprocessable | Missing required fields |
| 500 | Server Error | Database connection failed |

### Business Logic Errors

```json
{
  "success": false,
  "errorCode": "DUPLICATE_MERCHANT",
  "error": "Merchant with this phone already exists",
  "details": {
    "existing_merchant_id": 456,
    "existing_merchant_name": "Zim-Express Retail",
    "onboarded_by": "Jane Doe",
    "onboarded_at": "2025-11-15T10:30:00Z"
  }
}
```

---

## Security Considerations

### 1. Authentication & Authorization

- **Password hashing:** bcryptjs with salt rounds >= 12
- **Token expiration:** 
  - Access token: 1 hour
  - Refresh token: 7 days
- **Refresh token rotation:** New refresh token on each refresh request
- **Token storage (Frontend):** 
  - Secure: HttpOnly cookies preferred
  - Alternative: localStorage with CSRF protection

### 2. Data Isolation

```typescript
// Middleware example: Verify hunter owns merchant
async function verifyHunterMerchantAccess(req, res, next) {
  const hunterId = req.user.hunter_id;
  const merchantId = req.params.merchant_id;
  
  const ownership = await db.merchant_hunter_merchants.findUnique({
    where: {
      merchant_hunter_id_merchant_id: {
        merchant_hunter_id: hunterId,
        merchant_id: merchantId
      }
    }
  });
  
  if (!ownership) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  
  next();
}
```

### 3. Rate Limiting

```
- Login endpoint: 5 attempts per 15 minutes per IP
- Document upload: 50 files per hour per hunter
- Merchant registration: 100 per day per hunter
```

### 4. File Upload Security

- **Virus scanning:** Scan uploads before S3
- **File type validation:** Whitelist: PDF, JPEG, PNG only
- **File size limit:** 10MB max per file
- **Filename sanitization:** Remove special characters
- **Storage:** S3 with encryption at rest & in transit
- **Access control:** Pre-signed URLs with expiration (1 hour)

### 5. Audit Trail

```sql
-- Every material action logged
INSERT INTO merchant_activity_logs VALUES (
  activity_type='merchant_created',
  merchant_hunter_id=123,
  merchant_id=789,
  ip_address='197.150.50.100',
  user_agent='Mozilla/5.0...',
  changes={status: 'pending'},
  created_at=NOW()
);
```

### 6. SQL Injection Prevention

- **Use Prisma ORM:** Parameterized queries only
- **Input validation:** Schema validation before queries
- **Example (SAFE):**

```typescript
// ✅ SAFE - Prisma prevents injection
const merchant = await prisma.merchants.findUnique({
  where: { phone: req.body.phone }
});

// ❌ NEVER DO THIS:
const merchant = await db.query(`SELECT * FROM merchants WHERE phone='${req.body.phone}'`);
```

### 7. CORS & CSRF

```typescript
// CORS configuration
const corsOptions = {
  origin: [
    "https://fieldpro-harare.com",
    "https://merchant.fieldpro-harare.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// CSRF Token for state-changing operations
app.use(csrf());
```

---

## Integration Points with Marketplace

### Shared Tables

These tables ALREADY exist in marketplace and FieldPro reads/writes to them:

1. **merchants**
   - FieldPro: Inserts new merchants
   - Marketplace: Reads merchant data, displays in marketplace
   - FieldPro should NOT modify existing merchant records (only read)

2. **merchant_profiles**
   - FieldPro: Inserts profile data (GPS, address)
   - Marketplace: Reads profile for display
   - FieldPro should NOT modify existing profiles

3. **categories**
   - FieldPro: Reads categories for dropdown
   - Marketplace: Source of truth for categories

### API Response Mapping

**Frontend expects (from types.ts):**

```typescript
interface Merchant {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'Pending' | 'Onboarded' | 'Rejected';
  category: string;
  dateAdded: string;
}
```

**Backend returns (API):**

```json
{
  "id": "789",
  "name": "Harare Fresh Mart",
  "owner": "Sarah Phiri",  // from owner_name
  "location": "First Street Mall",  // from physical_address
  "status": "pending_verification",  // Map: pending_verification -> Pending
  "category": "Grocery",  // from categories.name
  "dateAdded": "2025-12-20"  // from onboarded_at
}
```

---

## Deployment & Infrastructure

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fieldpro

# Auth
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-key-min-32-chars
JWT_EXPIRY=3600

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=fieldpro-documents

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@fieldpro.com
SMTP_PASS=xxx

# App
NODE_ENV=production
API_URL=https://api.fieldpro-harare.com
FRONTEND_URL=https://fieldpro-harare.com
```

### Database Migrations

```bash
# Initial schema setup
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Verify schema
npx prisma studio
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test: Check merchant existence
describe('Merchant.checkExistence', () => {
  it('should return false for new merchant', async () => {
    const exists = await checkMerchantExists({
      phone: '+263712345700'
    });
    expect(exists).toBe(false);
  });

  it('should return true for existing merchant', async () => {
    const existing = await createMerchant({ phone: '+263712345700' });
    const exists = await checkMerchantExists({ phone: '+263712345700' });
    expect(exists).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test: Complete onboarding flow
describe('Merchant Onboarding Flow', () => {
  it('should onboard merchant and link to hunter', async () => {
    // 1. Create merchant
    const merchant = await onboardMerchant(hunterToken, {
      name: 'Test Retail',
      phone: '+263712345700'
    });

    // 2. Verify merchant created
    expect(merchant.status).toBe('pending_verification');

    // 3. Upload document
    const doc = await uploadDocument(hunterToken, merchant.id, file);
    expect(doc.is_verified).toBe(false);

    // 4. Verify linking
    const mhm = await db.merchant_hunter_merchants.findFirst({
      where: { merchant_id: merchant.id }
    });
    expect(mhm.merchant_hunter_id).toBe(hunterIdFromToken);
  });
});
```

---

## Monitoring & Observability

### Logging

```
Level: DEBUG, INFO, WARN, ERROR, FATAL
Format: JSON for structured logging
Fields:
  - timestamp
  - level
  - service: "fieldpro-api"
  - action: "merchant_onboarded"
  - hunter_id
  - merchant_id
  - duration_ms
  - status: "success" | "error"
  - error (if applicable)
```

### Metrics

```
- Merchant registrations per day
- Hunter onboarding success rate
- Document upload volume
- API response times (p50, p95, p99)
- Database query times
- Error rates by endpoint
- Authentication failures
- Storage usage (S3)
```

---

## Migration Strategy (Marketplace Integration)

### Step 1: Prepare Database

```sql
-- Add FieldPro tables to existing marketplace DB
psql -U postgres -d marketplace_db -f fieldpro_schema.sql
```

### Step 2: Verify Existing Merchants

```sql
-- Ensure no orphaned records
SELECT COUNT(*) FROM merchants WHERE merchant_profile IS NULL;
```

### Step 3: Test Data Isolation

```sql
-- Create test hunter
INSERT INTO merchant_hunters (...) VALUES (...);

-- Create test merchant
INSERT INTO merchants (...) VALUES (...);

-- Link them
INSERT INTO merchant_hunter_merchants (...) VALUES (...);

-- Verify isolation: Hunter X cannot see Hunter Y's merchants
```

### Step 4: Enable FieldPro Endpoints

Gradually enable endpoints in production with feature flags

---

## Glossary

| Term | Definition |
|------|-----------|
| **Hunter/Agent** | Merchant hunter - sales agent who onboards merchants |
| **Merchant Hunter** | Same as Hunter |
| **Merchant** | Business/shop being onboarded |
| **Onboarding** | Process of registering merchant in system |
| **Pending Verification** | Merchant registered but documents not yet verified |
| **Verified** | Merchant and documents verified by admin |
| **MHM** | merchant_hunter_merchants (junction table) |
| **Conversion Rate** | (merchants_onboarded / merchants_approached) × 100 |

---

## Checklist for Implementation

- [ ] Database migration files created
- [ ] Prisma schema defined
- [ ] Authentication middleware implemented
- [ ] API endpoints created
- [ ] Input validation schemas defined
- [ ] Error handling middleware
- [ ] Database transactions implemented
- [ ] Activity logging implemented
- [ ] File upload handler (S3 integration)
- [ ] JWT token generation & validation
- [ ] Rate limiting middleware
- [ ] CORS configuration
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Security audit
- [ ] Performance testing
- [ ] Load testing
- [ ] Staging deployment
- [ ] Production deployment

---

## Next Steps

1. **Review this design** with stakeholders
2. **Create Prisma schema** based on SQL definitions
3. **Implement authentication** (Hunter + Merchant)
4. **Build API endpoints** (start with core: onboard, check existence, upload docs)
5. **Integrate with S3** for document storage
6. **Add activity logging** to track all changes
7. **Write comprehensive tests**
8. **Deploy to staging** for QA
9. **Perform security audit**
10. **Deploy to production**

---

**Document Version:** 1.0  
**Last Updated:** January 17, 2026  
**Status:** Ready for Implementation

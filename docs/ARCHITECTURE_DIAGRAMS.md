# System Architecture Diagrams

## 1. Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

    FRONTEND (Browser)          API LAYER (Next.js)         DATABASE (PostgreSQL)
    ─────────────────           ──────────────────           ──────────────────

    ┌──────────────┐
    │ Home Page    │
    │ /            │
    └──────┬───────┘
           │ click register
           │
    ┌──────▼───────────────┐
    │ Registration Form    │
    │ /register (step 1)   │
    └──────┬───────────────┘
           │ fill form
           │
    ┌──────▼───────────────┐
    │ Continue Button      │
    │ (client validation)  │
    └──────┬───────────────┘
           │
    ┌──────▼───────────────┐
    │ Upload Files Step    │
    │ /register (step 2)   │
    └──────┬───────────────┘
           │ select files
           │
    ┌──────▼───────────────┐
    │ Submit Registration  │
    └──────┬───────────────┘
           │
           │ 1. Upload files
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
    ┌──────────────┐         ┌──────────────────┐
    │ File 1       │         │ /api/upload      │────┐
    │ (ID Front)   │         │                  │    │
    └──────┬───────┘         └──────────────────┘    │ validate
           │                                         │ • type
    ┌──────▼──────┐                                  │ • size
    │ File 2      │                                  │
    │ (ID Back)   │                                  ▼
    └──────┬──────┘                         ┌──────────────────┐
           │                                │ temp URLs        │
           │ 2. Submit form data + URLs     │ generated        │
           └────────────────────────────────►                  │
                                            │ /api/register    │
                                            │                  │
                                            │ • validate       │
                                            │ • check email    │
                                            │ • hash password  │
                                            │ • save data      │
                                            └──────┬───────────┘
                                                   │
                                                   ▼
                                            ┌──────────────────┐
                                            │ INSERT INTO      │
                                            │ Merchant         │
                                            │                  │
                                            │ {                │
                                            │  id, business... │
                                            │  email, phone... │
                                            │  status: pending │
                                            │ }                │
                                            └──────┬───────────┘
                                                   │
           ┌───────────────────────────────────────┘
           │ Success response
           │ + merchantId
           │
    ┌──────▼──────────────┐
    │ Success Page        │
    │ /register/success   │
    └─────────────────────┘
```

---

## 2. File Upload Process

```
    Client Side                 API Route                Storage (TBD)
    ───────────                 ─────────                ────────────

┌─────────────────────┐
│ File Input          │
│ (user selects)      │
└──────────┬──────────┘
           │
    ┌──────▼──────────┐
    │ Validate:       │
    │ • Type (IMG)    │
    │ • Size < 10MB   │
    └──────┬──────────┘
           │
┌──────────▼────────────────────────┐
│ FormData + fetch()                 │
│ POST /api/upload                   │
└────────────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Receive in API     │
        │                    │
        │ Validate:          │
        │ • MIME type        │
        │ • File size        │
        │ • Not corrupted    │
        └────────┬───────────┘
                 │
        ┌────────▼──────────────────┐
        │ Store file:                │
        │ • Vercel Blob (recommend)  │
        │ • AWS S3                   │
        │ • Cloudinary               │
        │ • Local (dev)              │
        └────────┬──────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Return URL         │
        │ to client          │
        └────────┬───────────┘
                 │
    ┌────────────▼──────────────┐
    │ Store URL in state        │
    │ Use in registration       │
    │ submission                │
    └───────────────────────────┘
```

---

## 3. Database Schema Relationship

```
┌─────────────────────────────────────────┐
│         Merchant Table                  │
├─────────────────────────────────────────┤
│ id (PK)               │ cuid             │
│ businessName          │ text             │
│ ownerName             │ text             │
│ email (UNIQUE)        │ text             │
│ phone                 │ text             │
│ businessType          │ text             │
│ businessAddress       │ text             │
│ password              │ text (hashed)    │
│ idType                │ text (enum)      │
│ idFrontUrl            │ text (nullable)  │
│ idBackUrl             │ text (nullable)  │
│ status                │ text (default)   │
│ createdAt (INDEX)     │ timestamp        │
│ updatedAt             │ timestamp        │
└─────────────────────────────────────────┘

        ▲
        │ Future Relations
        │
    ┌───┴────────────────────────┐
    │                             │
    ▼                             ▼
┌──────────────────┐    ┌──────────────────┐
│ MerchantProducts │    │ MerchantOrders   │
├──────────────────┤    ├──────────────────┤
│ id               │    │ id               │
│ merchantId (FK)  │    │ merchantId (FK)  │
│ name             │    │ orderId          │
│ description      │    │ status           │
│ price            │    │ totalAmount      │
│ image            │    │ createdAt        │
│ status           │    │ updatedAt        │
│ createdAt        │    │                  │
└──────────────────┘    └──────────────────┘
```

---

## 4. Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     App (Next.js 16)                              │
└────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │    Pages (app directory)       │
                    └────────────────────────────────┘

         ┌──────────────────┬──────────────────┬─────────────────┐
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
    ┌─────────┐        ┌──────────────┐  ┌──────────────┐  ┌─────────┐
    │  Home   │        │  Register    │  │ Register     │  │ Admin   │
    │ page.tsx│        │ page.tsx     │  │ Success      │  │ page.tsx│
    │ /       │        │ /register    │  │ /register/   │  │ /admin  │
    └─────────┘        └──────┬───────┘  │ success      │  └─────────┘
                               │          └──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  API Routes         │
                    │  (/app/api)         │
                    ├─────────────────────┤
                    │                     │
                    │ /api/register ──┐  │
                    │ /api/upload ────┼─►│ Database
                    │                 │  │ (PostgreSQL)
                    └─────────────────┬──┘
                                      │
                    ┌─────────────────▼──┐
                    │  Utilities         │
                    ├─────────────────────┤
                    │ lib/prisma.ts       │
                    │ (Prisma Client)     │
                    └────────────────────┘
```

---

## 5. Registration Form State Machine

```
                    START
                      │
                      ▼
            ┌─────────────────────┐
            │  Form Mounted       │
            │  Step: 1            │
            │  Loading: false     │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
     ┌─────►│ STEP 1: Input Info  │◄────────┐
     │      │ Validate:           │         │
     │      │ • Name, Email, etc. │         │
     │      │ • Password > 8 char │         │
     │      └──────────┬──────────┘         │
     │                 │                    │
     │         ┌───────┴───────┐            │
     │         │               │            │
     │     ERROR           CONTINUE         │
     │         │               │            │
     │         ▼               ▼            │
     │    Show Error    ┌──────────────┐   │
     │    Message       │ STEP 2:      │   │
     │    Stay on       │ Upload Files │   │
     │    Step 1        │ Validate:    │   │
     │                  │ • Files req. │   │
     │                  └──────┬───────┘   │
     │                         │           │
     │                 ┌───────┴───────┐   │
     │                 │               │   │
     │             ERROR           SUBMIT │
     │                 │               │   │
     │                 ▼               ▼   │
     │            Show Error    ┌─────────────────┐
     │            Message       │ SUBMITTING      │
     │            Stay on       │ • Upload files  │
     │            Step 2        │ • Save data     │
     │                          │ • Show spinner  │
     │                          └────────┬────────┘
     │                                   │
     │                           ┌───────┴───────┐
     │                           │               │
     │                       ERROR           SUCCESS
     │                           │               │
     │                           ▼               ▼
     │                      Show Error      ┌──────────┐
     │                      Stay on step    │ Redirect │
     │                                      │ /success │
     │                                      └──────────┘
     │                                           │
     └───────────────────────────────────────────┘
                    BACK Button
```

---

## 6. API Request/Response Flow

```
CLIENT SIDE                     SERVER SIDE                   DATABASE
───────────                     ───────────                   ────────

Step 1: Upload Files
────────────────

FormData {
  file: File
} ────────────────►
                   POST /api/upload
                   ├─ Validate file
                   │  • Type
                   │  • Size
                   └─ Generate URL
                   
                   Response: { url }
              ◄────────────────


Step 2: Save Registration
──────────────────────

JSON {
  businessName,
  ownerName,
  email,
  phone,
  businessType,
  businessAddress,
  password,
  idType,
  idFrontUrl,
  idBackUrl
} ────────────────►
                   POST /api/register
                   ├─ Validate input
                   ├─ Check email unique
                   ├─ Hash password (TODO)
                   └─ Create merchant
                                           INSERT INTO Merchant
                                           VALUES (...)
                                           
                                           ◄─ Merchant created
                                           
                   Response: { 
                     success: true,
                     merchantId: "xyz"
                   }
              ◄────────────────
```

---

## 7. Admin Dashboard Query Flow

```
USER VISITS /admin
        │
        ▼
┌───────────────────┐
│ AdminPage         │
│ (Server Component)│
└────────┬──────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ await prisma.merchant    │
    │   .findMany({            │
    │     orderBy:             │
    │       { createdAt:       │
    │         'desc' }         │
    │   })                     │
    └────────┬─────────────────┘
             │
         DATABASE QUERY
             │
    ┌────────▼──────────────┐
    │ SELECT * FROM         │
    │ Merchant              │
    │ ORDER BY createdAt    │
    │ DESC                  │
    └────────┬──────────────┘
             │
        ◄────┴────► Returns array of merchants
             │
        ┌────▼──────────────────┐
        │ Render Dashboard      │
        │ • Loop merchants      │
        │ • Show status badge   │
        │ • Display all details │
        │ • Links to documents  │
        └───────────────────────┘
             │
        DISPLAY IN BROWSER
```

---

## 8. Environment Configuration

```
.env.local (Local Development)
├── DATABASE_URL = "postgresql://user:pass@localhost/db"
├── BLOB_READ_WRITE_TOKEN = (optional)
├── AWS_* = (optional)
└── CLOUDINARY_* = (optional)

.env.production (Vercel/Deployment)
├── DATABASE_URL = "postgresql://user:pass@vercel.../db?sslmode=require"
├── BLOB_READ_WRITE_TOKEN = "vercel_blob_token_here"
├── FILE_UPLOAD_SERVICE = "vercel-blob" | "s3" | "cloudinary"
└── ADMIN_PASSWORD = (optional, for dashboard)
```

---

## 9. Error Handling Flow

```
Request Received
      │
      ▼
┌─────────────────┐
│ Validate Input  │
└──────┬──────────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
VALID   INVALID
   │       │
   │       ▼
   │    ┌──────────────────────┐
   │    │ Return Error (400)    │
   │    │ { error: "message" }  │
   │    └──────────────────────┘
   │       │
   │       ▼
   │    Display on Form
   │    • Error message
   │    • Stay on step
   │
   ▼
┌──────────────────┐
│ Process Request  │
└────────┬─────────┘
         │
     ┌───┴────┐
     │        │
     ▼        ▼
  SUCCESS   FAILURE
     │        │
     │        ▼
     │    ┌─────────────────────┐
     │    │ Return Error (500)   │
     │    │ { error: "Failed" }  │
     │    └─────────────────────┘
     │        │
     │        ▼
     │    Log Error
     │    Display to User
     │    Offer Retry
     │
     ▼
  ┌─────────────────┐
  │ Success Response│
  │ { success: true}│
  └────────┬────────┘
           │
        Redirect
```

---

## 10. Deployment Architecture

```
Development                 Staging                 Production
───────────                 ───────                 ──────────

Local Machine          Vercel (Preview)          Vercel (Production)
  │                         │                           │
  ├─ Localhost:3000         ├─ Preview URL             ├─ Production URL
  ├─ Local DB               ├─ Staging DB              ├─ Vercel Postgres
  └─ File uploads (temp)    └─ File uploads (blob)     └─ File uploads (blob)

        │                         │                       │
        │         git push        │                       │
        └────────────────────────►│      git merge        │
                                  └──────────────────────►│

                                                  ┌─ Load Balancer
                                                  │
                                    ┌─────────────┴────┐
                                    │                   │
                                    ▼                   ▼
                              Vercel Edge      Next.js Server
                              Functions         (Serverless)
                                    │                   │
                                    └─────────────┬────┘
                                                  │
                                         ┌────────▼─────────┐
                                         │                  │
                                         ▼                  ▼
                                    API Routes         Database
                                  (Edge Functions)   (Vercel Postgres)
                                         │                  │
                                         └────────┬─────────┘
                                                  │
                                         ┌────────▼─────────┐
                                         │                  │
                                         ▼                  ▼
                                    Vercel Blob      CDN (Caching)
                                  (File Storage)   (Images, etc)
```

---

This document provides a complete visual understanding of the system architecture, data flow, and deployment strategy.

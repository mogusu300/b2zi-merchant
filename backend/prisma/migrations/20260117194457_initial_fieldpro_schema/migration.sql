-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('HUNTER', 'MERCHANT');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'MANAGER');

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessType" TEXT,
    "businessAddress" TEXT,
    "password" TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idFrontUrl" TEXT,
    "idBackUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT,
    "customerId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "images" TEXT[],
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_hunters" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "region" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "targetMonthly" INTEGER NOT NULL DEFAULT 0,
    "onboardedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_hunters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_hunter_merchants" (
    "id" TEXT NOT NULL,
    "merchantHunterId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completedAt" TIMESTAMP(3),
    "onboardingStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingDaysElapsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_hunter_merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_onboarding_documents" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "extractedData" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "uploadedByHunterId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_onboarding_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_activity_logs" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "merchantHunterId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedByRole" TEXT NOT NULL,
    "performedByIp" TEXT,
    "performedByUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_targets" (
    "id" TEXT NOT NULL,
    "merchantHunterId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_performance_metrics" (
    "id" TEXT NOT NULL,
    "merchantHunterId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalOnboarded" INTEGER NOT NULL DEFAULT 0,
    "totalRejected" INTEGER NOT NULL DEFAULT 0,
    "totalPending" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageOnboardingDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCalculated" BOOLEAN NOT NULL DEFAULT false,
    "calculatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_logins" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedFromIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_email_key" ON "merchants"("email");

-- CreateIndex
CREATE INDEX "merchants_email_idx" ON "merchants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_merchantId_idx" ON "sessions"("merchantId");

-- CreateIndex
CREATE INDEX "sessions_customerId_idx" ON "sessions"("customerId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_hunters_email_key" ON "merchant_hunters"("email");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_hunters_phone_key" ON "merchant_hunters"("phone");

-- CreateIndex
CREATE INDEX "merchant_hunters_email_idx" ON "merchant_hunters"("email");

-- CreateIndex
CREATE INDEX "merchant_hunters_phone_idx" ON "merchant_hunters"("phone");

-- CreateIndex
CREATE INDEX "merchant_hunters_isActive_idx" ON "merchant_hunters"("isActive");

-- CreateIndex
CREATE INDEX "merchant_hunter_merchants_merchantHunterId_idx" ON "merchant_hunter_merchants"("merchantHunterId");

-- CreateIndex
CREATE INDEX "merchant_hunter_merchants_merchantId_idx" ON "merchant_hunter_merchants"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_hunter_merchants_status_idx" ON "merchant_hunter_merchants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_hunter_merchants_merchantHunterId_merchantId_key" ON "merchant_hunter_merchants"("merchantHunterId", "merchantId");

-- CreateIndex
CREATE INDEX "merchant_onboarding_documents_merchantId_idx" ON "merchant_onboarding_documents"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_onboarding_documents_documentType_idx" ON "merchant_onboarding_documents"("documentType");

-- CreateIndex
CREATE INDEX "merchant_onboarding_documents_isVerified_idx" ON "merchant_onboarding_documents"("isVerified");

-- CreateIndex
CREATE INDEX "merchant_activity_logs_merchantId_idx" ON "merchant_activity_logs"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_activity_logs_merchantHunterId_idx" ON "merchant_activity_logs"("merchantHunterId");

-- CreateIndex
CREATE INDEX "merchant_activity_logs_action_idx" ON "merchant_activity_logs"("action");

-- CreateIndex
CREATE INDEX "agent_targets_merchantHunterId_idx" ON "agent_targets"("merchantHunterId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_targets_merchantHunterId_year_month_key" ON "agent_targets"("merchantHunterId", "year", "month");

-- CreateIndex
CREATE INDEX "agent_performance_metrics_merchantHunterId_idx" ON "agent_performance_metrics"("merchantHunterId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_performance_metrics_merchantHunterId_year_month_key" ON "agent_performance_metrics"("merchantHunterId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_logins_merchantId_key" ON "merchant_logins"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_logins_phone_key" ON "merchant_logins"("phone");

-- CreateIndex
CREATE INDEX "merchant_logins_phone_idx" ON "merchant_logins"("phone");

-- CreateIndex
CREATE INDEX "merchant_logins_merchantId_idx" ON "merchant_logins"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_entityId_entityType_idx" ON "refresh_tokens"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_hunter_merchants" ADD CONSTRAINT "merchant_hunter_merchants_merchantHunterId_fkey" FOREIGN KEY ("merchantHunterId") REFERENCES "merchant_hunters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_hunter_merchants" ADD CONSTRAINT "merchant_hunter_merchants_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_onboarding_documents" ADD CONSTRAINT "merchant_onboarding_documents_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_activity_logs" ADD CONSTRAINT "merchant_activity_logs_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_activity_logs" ADD CONSTRAINT "merchant_activity_logs_merchantHunterId_fkey" FOREIGN KEY ("merchantHunterId") REFERENCES "merchant_hunters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_targets" ADD CONSTRAINT "agent_targets_merchantHunterId_fkey" FOREIGN KEY ("merchantHunterId") REFERENCES "merchant_hunters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_performance_metrics" ADD CONSTRAINT "agent_performance_metrics_merchantHunterId_fkey" FOREIGN KEY ("merchantHunterId") REFERENCES "merchant_hunters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_logins" ADD CONSTRAINT "merchant_logins_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

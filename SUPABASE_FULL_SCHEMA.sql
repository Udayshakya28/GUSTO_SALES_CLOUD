-- ============================================
-- Complete Database Schema for Supabase
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Migration 1: Initial Schema
-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analyzedUrl" TEXT NOT NULL,
    "generatedKeywords" TEXT[],
    "generatedDescription" TEXT NOT NULL,
    "targetSubreddits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "redditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "body" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_redditId_key" ON "Lead"("redditId");
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_url_key" ON "Lead"("url");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Campaign_userId_fkey'
    ) THEN
        ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Lead_campaignId_fkey'
    ) THEN
        ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Migration 2: Add lead intent
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "intent" TEXT;

-- Migration 3: Add user subscription fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT;

-- Migration 4: Create SubredditProfile table
CREATE TABLE IF NOT EXISTS "SubredditProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cultureNotes" TEXT,
    "peakActivityTime" TEXT,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubredditProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubredditProfile_name_key" ON "SubredditProfile"("name");

-- Migration 5: Add reply tracking fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduledReplyStatus') THEN
        CREATE TYPE "ScheduledReplyStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'CANCELLED');
    END IF;
END $$;

ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastKarmaCheck" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "redditKarma" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "redditRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "redditUsername" TEXT;

CREATE TABLE IF NOT EXISTS "ScheduledReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ScheduledReplyStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "redditPostId" TEXT,
    "failReason" TEXT,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "upvotes" INTEGER DEFAULT 0,
    "authorReplied" BOOLEAN DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledReply_pkey" PRIMARY KEY ("id")
);

-- Migration 6: Fix lead user relation
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userId" TEXT;
-- Update existing leads if any (set to a default user or handle separately)
-- ALTER TABLE "Lead" ALTER COLUMN "userId" SET NOT NULL; -- Uncomment after setting values

-- Migration 7: Add market insight model
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadType') THEN
        CREATE TYPE "LeadType" AS ENUM ('DIRECT_LEAD', 'COMPETITOR_MENTION');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InsightStatus') THEN
        CREATE TYPE "InsightStatus" AS ENUM ('NEW', 'VIEWED', 'ACTIONED', 'IGNORED');
    END IF;
END $$;

ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "competitors" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Untitled Campaign';

ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sentiment" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "type" "LeadType" NOT NULL DEFAULT 'DIRECT_LEAD';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "MarketInsight" (
    "id" TEXT NOT NULL,
    "discoveredCompetitorName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceTextSnippet" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "status" "InsightStatus" NOT NULL DEFAULT 'NEW',
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketInsight_userId_idx" ON "MarketInsight"("userId");
CREATE INDEX IF NOT EXISTS "MarketInsight_campaignId_idx" ON "MarketInsight"("campaignId");
CREATE INDEX IF NOT EXISTS "Campaign_userId_idx" ON "Campaign"("userId");
CREATE INDEX IF NOT EXISTS "Lead_userId_idx" ON "Lead"("userId");
CREATE INDEX IF NOT EXISTS "Lead_campaignId_idx" ON "Lead"("campaignId");
CREATE INDEX IF NOT EXISTS "ScheduledReply_leadId_idx" ON "ScheduledReply"("leadId");

-- Migration 8: Add insight analysis flag
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "insightAnalysisRan" BOOLEAN NOT NULL DEFAULT false;

-- Migration 9: Add unique constraint for market insights
CREATE UNIQUE INDEX IF NOT EXISTS "MarketInsight_campaignId_discoveredCompetitorName_key" ON "MarketInsight"("campaignId", "discoveredCompetitorName");

-- Migration 10: Add summary to lead
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "summary" TEXT;

-- Migration 11: Add Google ranked flag
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isGoogleRanked" BOOLEAN DEFAULT false;

-- Migration 12: Create webhooks table
CREATE TABLE IF NOT EXISTS "webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTriggered" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "filters" JSONB,
    "rateLimitMinutes" INTEGER,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- Migration 13: Create AIUsage table
CREATE TABLE IF NOT EXISTS "AIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AIUsage_userId_month_type_key" ON "AIUsage"("userId", "month", "type");

-- Migration 14: Add campaign active flag
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Migration 15: Add campaign filters
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "negativeKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "subredditBlacklist" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migration 16: Add manual discovery timestamp
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "lastManualDiscoveryAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasConnectedReddit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "redditAuthState" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Lead_id_userId_key" ON "Lead"("id", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_redditAuthState_key" ON "User"("redditAuthState");

-- Migration 17: Add global search timestamp
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "lastGlobalDiscoverAt" TIMESTAMP(3);
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "lastTargetedDiscoveryAt" TIMESTAMP(3);

-- Migration 18: Add pending manual post status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_MANUAL_POST' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ScheduledReplyStatus')) THEN
        ALTER TYPE "ScheduledReplyStatus" ADD VALUE 'PENDING_MANUAL_POST';
    END IF;
END $$;

-- Migration 19: Create EmailNotificationSetting table
CREATE TABLE IF NOT EXISTS "EmailNotificationSetting" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailNotificationSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailNotificationSetting_userId_key" ON "EmailNotificationSetting"("userId");

-- Migration 20: Add user name fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Migration 21: Add subscription end date
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionEndsAt" TIMESTAMP(3);

-- Migration 22: Add unique constraint for redditId and campaignId
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_redditId_campaignId_key" ON "Lead"("redditId", "campaignId");

-- Add all foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_userId_fkey') THEN
        ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ScheduledReply_leadId_fkey') THEN
        ALTER TABLE "ScheduledReply" ADD CONSTRAINT "ScheduledReply_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ScheduledReply_userId_fkey') THEN
        ALTER TABLE "ScheduledReply" ADD CONSTRAINT "ScheduledReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MarketInsight_userId_fkey') THEN
        ALTER TABLE "MarketInsight" ADD CONSTRAINT "MarketInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MarketInsight_campaignId_fkey') THEN
        ALTER TABLE "MarketInsight" ADD CONSTRAINT "MarketInsight_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhooks_userId_fkey') THEN
        ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIUsage_userId_fkey') THEN
        ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EmailNotificationSetting_userId_fkey') THEN
        ALTER TABLE "EmailNotificationSetting" ADD CONSTRAINT "EmailNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Update Campaign foreign key to CASCADE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Campaign_userId_fkey') THEN
        ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";
    END IF;
    ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
END $$;

-- Update Lead foreign key to CASCADE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_campaignId_fkey') THEN
        ALTER TABLE "Lead" DROP CONSTRAINT "Lead_campaignId_fkey";
    END IF;
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
END $$;

-- ============================================
-- Schema Complete!
-- ============================================

<<<<<<< HEAD
=======

>>>>>>> landing/main

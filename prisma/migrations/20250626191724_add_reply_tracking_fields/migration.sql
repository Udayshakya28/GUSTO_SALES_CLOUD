/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ScheduledReplyStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'CANCELLED');

-- DropIndex
DROP INDEX "User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "lastKarmaCheck" TIMESTAMP(3),
ADD COLUMN     "redditKarma" INTEGER DEFAULT 0,
ADD COLUMN     "redditRefreshToken" TEXT,
ADD COLUMN     "redditUsername" TEXT;

-- CreateTable
CREATE TABLE "ScheduledReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ScheduledReplyStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
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

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReply" ADD CONSTRAINT "ScheduledReply_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReply" ADD CONSTRAINT "ScheduledReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

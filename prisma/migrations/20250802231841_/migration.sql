/*
  Warnings:

  - You are about to drop the column `lastGlobalSearchAt` on the `Campaign` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[redditId,campaignId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "lastGlobalSearchAt",
ADD COLUMN     "lastGlobalDiscoverAt" TIMESTAMP(3),
ADD COLUMN     "lastTargetedDiscoveryAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_redditId_campaignId_key" ON "Lead"("redditId", "campaignId");

/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[redditAuthState]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "lastManualDiscoveryAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasConnectedReddit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redditAuthState" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_userId_key" ON "Lead"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_redditAuthState_key" ON "User"("redditAuthState");

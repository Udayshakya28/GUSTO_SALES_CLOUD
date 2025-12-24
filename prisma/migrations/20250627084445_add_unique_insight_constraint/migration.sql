/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,discoveredCompetitorName]` on the table `MarketInsight` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MarketInsight_campaignId_discoveredCompetitorName_key" ON "MarketInsight"("campaignId", "discoveredCompetitorName");

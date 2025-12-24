-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "negativeKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subredditBlacklist" TEXT[] DEFAULT ARRAY[]::TEXT[];

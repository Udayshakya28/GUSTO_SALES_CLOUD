-- CreateTable
CREATE TABLE "SubredditProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cultureNotes" TEXT,
    "peakActivityTime" TEXT,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubredditProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubredditProfile_name_key" ON "SubredditProfile"("name");

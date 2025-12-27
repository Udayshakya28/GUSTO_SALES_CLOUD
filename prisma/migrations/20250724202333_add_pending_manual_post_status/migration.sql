-- AlterEnum
ALTER TYPE "ScheduledReplyStatus" ADD VALUE 'PENDING_MANUAL_POST';

-- AlterTable
ALTER TABLE "ScheduledReply" ALTER COLUMN "scheduledAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EmailNotificationSetting" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailNotificationSetting_userId_key" ON "EmailNotificationSetting"("userId");

-- AddForeignKey
ALTER TABLE "EmailNotificationSetting" ADD CONSTRAINT "EmailNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

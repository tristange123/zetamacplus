-- AlterTable
ALTER TABLE "Profile"
ADD COLUMN "dailyStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dailyLongestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dailyLastCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Test_userId_gameMode_time_idx" ON "Test"("userId", "gameMode", "time");

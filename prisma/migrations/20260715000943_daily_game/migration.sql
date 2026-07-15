-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "dailyAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dailyCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dailyPastTenTests" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "dailyTotalTests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "daily_1" TEXT,
ADD COLUMN     "daily_2" TEXT,
ADD COLUMN     "daily_3" TEXT;

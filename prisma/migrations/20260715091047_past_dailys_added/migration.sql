-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "dailyScore" INTEGER,
ADD COLUMN     "pastDailys" TEXT[] DEFAULT ARRAY[]::TEXT[];

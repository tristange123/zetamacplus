/*
  Warnings:

  - You are about to drop the column `hardPastTens` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `rapidPastTens` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `sprintPastTens` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `standardPastTens` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "hardPastTens",
DROP COLUMN "rapidPastTens",
DROP COLUMN "sprintPastTens",
DROP COLUMN "standardPastTens",
ADD COLUMN     "hardPastTenTests" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "rapidPastTenTests" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "sprintPastTenTests" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "standardPastTenTests" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

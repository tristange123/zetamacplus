/*
  Warnings:

  - The `standardPastTens` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rapidPastTens` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sprintPastTens` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hardPastTens` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "standardPastTens",
ADD COLUMN     "standardPastTens" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
DROP COLUMN "rapidPastTens",
ADD COLUMN     "rapidPastTens" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
DROP COLUMN "sprintPastTens",
ADD COLUMN     "sprintPastTens" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
DROP COLUMN "hardPastTens",
ADD COLUMN     "hardPastTens" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

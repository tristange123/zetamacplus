/*
  Warnings:

  - You are about to drop the column `userId` on the `Problem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_userId_fkey";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "userId";

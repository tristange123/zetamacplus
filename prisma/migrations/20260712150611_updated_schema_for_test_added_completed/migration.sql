-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Daily" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "firstNum" INTEGER NOT NULL,
    "secondNum" INTEGER NOT NULL,
    "answer" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "solveTime" DOUBLE PRECISION,

    CONSTRAINT "Daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyDate" (
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyDate_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "timeJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testsAttempted" INTEGER NOT NULL DEFAULT 0,
    "testsCompleted" INTEGER NOT NULL DEFAULT 0,
    "standard_1" INTEGER NOT NULL DEFAULT 0,
    "standard_2" INTEGER NOT NULL DEFAULT 0,
    "standard_3" INTEGER NOT NULL DEFAULT 0,
    "standardAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "standardTotalTests" INTEGER NOT NULL DEFAULT 0,
    "standardPastTens" INTEGER NOT NULL DEFAULT 0,
    "rapid_1" INTEGER NOT NULL DEFAULT 0,
    "rapid_2" INTEGER NOT NULL DEFAULT 0,
    "rapid_3" INTEGER NOT NULL DEFAULT 0,
    "rapidAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapidTotalTests" INTEGER NOT NULL DEFAULT 0,
    "rapidPastTens" INTEGER NOT NULL DEFAULT 0,
    "sprint_1" INTEGER NOT NULL DEFAULT 0,
    "sprint_2" INTEGER NOT NULL DEFAULT 0,
    "sprint_3" INTEGER NOT NULL DEFAULT 0,
    "sprintAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sprintTotalTests" INTEGER NOT NULL DEFAULT 0,
    "sprintPastTens" INTEGER NOT NULL DEFAULT 0,
    "hard_1" INTEGER NOT NULL DEFAULT 0,
    "hard_2" INTEGER NOT NULL DEFAULT 0,
    "hard_3" INTEGER NOT NULL DEFAULT 0,
    "hardAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hardTotalTests" INTEGER NOT NULL DEFAULT 0,
    "hardPastTens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tests" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameMode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "Tests" ADD CONSTRAINT "Tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

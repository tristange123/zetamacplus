-- AlterTable
ALTER TABLE "Profile"
ADD COLUMN "standardProblemsSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rapidProblemsSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sprintProblemsSolved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "hardProblemsSolved" INTEGER NOT NULL DEFAULT 0;

-- Backfill counters from completed tests for existing profiles.
UPDATE "Profile" AS profile
SET
    "standardProblemsSolved" = COALESCE((
        SELECT SUM(test."score")
        FROM "Test" AS test
        WHERE test."userId" = profile."userId"
          AND test."completed" = true
          AND test."gameMode" = 'standard'
    ), 0),
    "rapidProblemsSolved" = COALESCE((
        SELECT SUM(test."score")
        FROM "Test" AS test
        WHERE test."userId" = profile."userId"
          AND test."completed" = true
          AND test."gameMode" = 'rapid'
    ), 0),
    "sprintProblemsSolved" = COALESCE((
        SELECT SUM(test."score")
        FROM "Test" AS test
        WHERE test."userId" = profile."userId"
          AND test."completed" = true
          AND test."gameMode" = 'sprint'
    ), 0),
    "hardProblemsSolved" = COALESCE((
        SELECT SUM(test."score")
        FROM "Test" AS test
        WHERE test."userId" = profile."userId"
          AND test."completed" = true
          AND test."gameMode" = 'hard'
    ), 0);

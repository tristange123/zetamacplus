-- AlterTable
ALTER TABLE "Profile"
ALTER COLUMN "showKeyboard" SET DEFAULT false;

-- Existing profiles received the previous default before settings were configurable.
UPDATE "Profile"
SET "showKeyboard" = false;

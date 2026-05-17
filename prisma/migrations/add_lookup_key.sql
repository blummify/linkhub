ALTER TABLE "PasswordResetToken" ADD COLUMN "lookupKey" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "PasswordResetToken_lookupKey_key" ON "PasswordResetToken"("lookupKey");
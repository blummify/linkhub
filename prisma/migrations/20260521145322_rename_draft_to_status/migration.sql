/*
  Warnings:

  - You are about to drop the column `email` on the `EmailVerification` table. All the data in the column will be lost.
  - You are about to drop the column `draft` on the `Link` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[handle]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailVerification_email_key";

-- AlterTable
ALTER TABLE "EmailVerification" DROP COLUMN "email",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "draft",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "handle" TEXT,
ADD COLUMN     "hasClaimedHandle" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_userId_key" ON "EmailVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "handle" TEXT,
ADD COLUMN     "hasClaimedHandle" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");

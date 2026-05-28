-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "thumbnailKey" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "avatarKey" TEXT,
ADD COLUMN     "avatarUrl" TEXT;
